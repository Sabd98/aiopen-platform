import { Response } from 'express';
import { Conversation, Message } from '../models/index.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export class ConversationController {
  // Get all conversations for the authenticated user
  static async getUserConversations(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'Please log in to access conversations',
        });
      }

      const conversations = await Conversation.findAll({
        where: { userId: req.user.id },
        include: [
          {
            model: Message,
            as: 'messages',
            limit: 1,
            order: [['createdAt', 'DESC']],
            attributes: ['content', 'createdAt'],
          },
        ],
        order: [['updatedAt', 'DESC']],
      });

      const formattedConversations = conversations.map((conv) => ({
        id: conv.id,
        title: conv.title,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
        lastMessage: conv.messages?.[0] || null,
      }));

      res.json({
        success: true,
        conversations: formattedConversations,
      });
    } catch (error) {
      console.error('Get conversations error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to fetch conversations',
      });
    }
  }

  // Get specific conversation with messages
  static async getConversation(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'Please log in to access conversations',
        });
      }

      const { id } = req.params;

      const conversation = await Conversation.findOne({
        where: { 
          id,
          userId: req.user.id,
        },
        include: [
          {
            model: Message,
            as: 'messages',
            order: [['createdAt', 'ASC']],
          },
        ],
      });

      if (!conversation) {
        return res.status(404).json({
          error: 'Conversation not found',
          message: 'The requested conversation does not exist or you do not have access to it',
        });
      }

      res.json({
        success: true,
        conversation: {
          id: conversation.id,
          title: conversation.title,
          createdAt: conversation.createdAt,
          updatedAt: conversation.updatedAt,
          messages: conversation.messages || [],
        },
      });
    } catch (error) {
      console.error('Get conversation error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to fetch conversation',
      });
    }
  }

  // Create new conversation
  static async createConversation(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'Please log in to create conversations',
        });
      }

      const { title } = req.body;

      const conversation = await Conversation.create({
        title: title || 'New Conversation',
        userId: req.user.id,
      });

      res.status(201).json({
        success: true,
        conversation: {
          id: conversation.id,
          title: conversation.title,
          createdAt: conversation.createdAt,
          updatedAt: conversation.updatedAt,
        },
      });
    } catch (error) {
      console.error('Create conversation error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to create conversation',
      });
    }
  }

  // Update conversation title
  static async updateConversation(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'Please log in to update conversations',
        });
      }

      const { id } = req.params;
      const { title } = req.body;

      const conversation = await Conversation.findOne({
        where: { 
          id,
          userId: req.user.id,
        },
      });

      if (!conversation) {
        return res.status(404).json({
          error: 'Conversation not found',
          message: 'The requested conversation does not exist or you do not have access to it',
        });
      }

      await conversation.update({ title });

      res.json({
        success: true,
        conversation: {
          id: conversation.id,
          title: conversation.title,
          createdAt: conversation.createdAt,
          updatedAt: conversation.updatedAt,
        },
      });
    } catch (error) {
      console.error('Update conversation error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to update conversation',
      });
    }
  }

  // Delete conversation
  static async deleteConversation(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'Please log in to delete conversations',
        });
      }

      const { id } = req.params;

      const conversation = await Conversation.findOne({
        where: { 
          id,
          userId: req.user.id,
        },
      });

      if (!conversation) {
        return res.status(404).json({
          error: 'Conversation not found',
          message: 'The requested conversation does not exist or you do not have access to it',
        });
      }

      await conversation.destroy();

      res.json({
        success: true,
        message: 'Conversation deleted successfully',
      });
    } catch (error) {
      console.error('Delete conversation error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to delete conversation',
      });
    }
  }
}