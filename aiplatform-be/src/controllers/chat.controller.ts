import type { Response } from "express";
import { askAI, streamAI } from "../services/ai.service.js";
import { logger } from "../utils/logger.js";
import { Conversation } from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";
import { AuthenticatedRequest } from "../middleware/auth.js";

export class ChatController {
  static async handleChat(req: AuthenticatedRequest, res: Response) {
    const {
      prompt,
      conversationId,
      stream: streamRequested,
    } = req.body as {
      prompt: string;
      conversationId?: string;
      stream?: boolean;
    };

    try {
      if (!req.user) {
        return res.status(401).json({
          error: "Authentication required",
          message: "Please log in to use chat",
        });
      }

      // find or create conversation
      let conv = null;
      if (conversationId) {
        conv = await Conversation.findOne({
          where: {
            id: conversationId,
            userId: req.user.id, // Ensure user owns the conversation
          },
        });
      }
      if (!conv) {
        conv = await Conversation.create({
          title: prompt.length > 50 ? prompt.substring(0, 47) + "..." : prompt,
          userId: req.user.id,
        });
      }

      // store user message as structured JSON: { text }
      await Message.create({
        conversationId: conv.id,
        role: "user",
        content: { text: prompt },
      });

      // If client didn't request streaming, use non-stream path
      if (!streamRequested) {
        let reply = await askAI(prompt);
        // try to parse reply if it's JSON string, otherwise wrap as { text }
        let contentObj: any = null;
        try {
          if (typeof reply === "string") {
            contentObj = JSON.parse(reply);
          } else {
            contentObj = reply;
          }
        } catch (e) {
          contentObj = { text: String(reply) };
        }
        // store assistant message
        await Message.create({
          conversationId: conv.id,
          role: "assistant",
          content: contentObj,
          meta: { streamed: false },
        });

        return res.json({ conversationId: conv.id, reply: contentObj });
      }

      // streaming requested: get the async generator
      const stream = streamAI(prompt);

      // STREAMING PATH: Server-Sent Events (SSE)
      res.setHeader("Cache-Control", "no-cache, no-transform");
      res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders?.();

      // support client disconnect
      const onClientClose = () => {
        logger.info("Client disconnected from SSE");
        // NOTE: we *could* abort upstream AI stream if supported
        res.end();
      };
      req.on("close", onClientClose);

      let assistantText = "";

      // iterate and push SSE events
      (async () => {
        try {
          for await (const chunk of stream) {
            // chunk: string
            logger.info("SSE sending chunk len", String(chunk).length);
            assistantText += chunk;
            // send as SSE event: data: <chunk>\n\n
            res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
          }
          // stream finished
          res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
          // persist assistant full message; try to parse accumulated text into JSON
          let contentObj: any;
          try {
            contentObj = JSON.parse(assistantText);
          } catch (e) {
            contentObj = { text: assistantText };
          }
          await Message.create({
            conversationId: conv.id,
            role: "assistant",
            content: contentObj,
            meta: { streamed: true },
          });
          res.end();
        } catch (err) {
          logger.error("Error while streaming AI:", err);
          try {
            res.write(
              `data: ${JSON.stringify({ error: "AI stream error" })}\n\n`
            );
            res.end();
          } catch {}
        } finally {
          req.off("close", onClientClose);
        }
      })();
    } catch (err) {
      logger.error("handleChat error", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  static async getHistory(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: "Authentication required",
          message: "Please log in to access chat history",
        });
      }

      const convs = await Conversation.findAll({
        where: { userId: req.user.id },
        include: [
          {
            model: Message,
            as: "messages",
            separate: true,
            order: [["createdAt", "ASC"]],
          },
        ],
        order: [["createdAt", "ASC"]],
      });

      return res.json({ conversations: convs });
    } catch (err) {
      logger.error("getHistory error", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}
