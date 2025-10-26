import dotenv from "dotenv";
dotenv.config();
import { logger } from "../utils/logger.js";
import { generateText, streamText } from "ai";
import { openai } from "@ai-sdk/openai";

// split into chunks and yield them with a short delay so clients see typing effect.
async function* chunkStringWithDelay(
  text: string,
  chunkLen = 20,
  delayMs = 25
) {
  if (!text) return;
  for (let i = 0; i < text.length; i += chunkLen) {
    const piece = text.slice(i, i + chunkLen);
    yield piece;
    // small delay to simulate streaming tokens
    await new Promise((r) => setTimeout(r, delayMs));
  }
}

// Non-streaming: call provider and return text
export async function askAI(prompt: string): Promise<string> {
  try {
    const result = await generateText({
      model: openai("gpt-5"), // choose model label that matches your provider config
      prompt: prompt,
      maxOutputTokens: 32000,
    });

    // The exact shape depends on SDK; adapt if necessary
    const text =
      (result as any)?.output?.[0]?.content?.[0]?.text ??
      (typeof result === "string" ? result : JSON.stringify(result));
    return text;
  } catch (err) {
    logger.error("askAI error", err);
    throw err;
  }
}

// Streaming: returns AsyncGenerator<string>
export async function* streamAI(
  prompt: string
): AsyncGenerator<string, void, unknown> {
  // minimal robust stream handler
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    const e = new Error("OPENAI_API_KEY missing");
    logger.error("streamAI aborted: %s", e.message);
    throw e;
  }
  try {
    logger.info("streamAI start");
    let stream: any;

    // try to get a provider stream
    try {
      stream = await streamText({ model: openai("gpt-5"), prompt });
    } catch (e) {
      logger.info("streamText failed, falling back to generateText");
      // fallback: generate full text and chunk it
      const result = await generateText({
        model: openai("gpt-5"),
        prompt,
        maxOutputTokens: 32000,
      });
      const text =
        (result as any)?.output?.[0]?.content?.[0]?.text ??
        (typeof result === "string" ? result : JSON.stringify(result));
      if (text) {
        for await (const piece of chunkStringWithDelay(String(text))) {
          yield piece;
        }
      }
      return;
    }

    // If stream is async iterable, yield normalized string parts
    if (
      stream != null &&
      typeof (stream as any)[Symbol.asyncIterator] === "function"
    ) {
      for await (const part of stream as any) {
        const out =
          typeof part === "string"
            ? part
            : (part && (part.delta ?? part.text ?? part.content)) ??
              JSON.stringify(part);
        const outStr = String(out);
        if (!outStr) continue;
        // break very long pieces into smaller chunks for smoother UI
        if (outStr.length > 200) {
          for await (const piece of chunkStringWithDelay(outStr)) yield piece;
        } else {
          yield outStr;
        }
      }
      return;
    }

    // If stream.body is a Web ReadableStream, read and yield pieces
    const body = (stream as any)?.body ?? (stream as any)?.response?.body;
    if (body && typeof body.getReader === "function") {
      const reader = body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunkText =
          typeof value === "string"
            ? value
            : decoder.decode(value, { stream: true });
        if (chunkText) yield String(chunkText);
      }

      return;
    }

    // If node stream (EventEmitter), consume data events
    const node = (stream as any)?.body ?? stream;
    if (node && typeof node.on === "function") {
      const q: string[] = [];
      let done = false;
      let err: any = null;
      node.on("data", (d: any) => q.push(String(d)));
      node.on("end", () => (done = true));
      node.on("error", (e: any) => {
        err = e;
        done = true;
      });
      while (!done || q.length) {
        if (err) throw err;
        if (q.length) yield q.shift()!;
        else await new Promise((r) => setTimeout(r, 50));
      }
      return;
    }

    // Fallback: if stream has text/json helpers, use them
    if (stream && typeof (stream as any).text === "function") {
      const t = await (stream as any).text();
      if (t) yield String(t);
      return;
    }
    if (stream && typeof (stream as any).json === "function") {
      const j = await (stream as any).json();
      yield JSON.stringify(j);
      return;
    }

    throw new Error("AI SDK streaming interface not recognized");
  } catch (err) {
    logger.error(
      "streamAI error",
      err instanceof Error ? err.message : String(err)
    );
    throw err;
  }
}
