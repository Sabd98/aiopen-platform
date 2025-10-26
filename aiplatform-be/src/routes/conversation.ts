import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { ConversationController } from '../controllers/conversation.controller.js';

const router = express.Router();

// All conversation routes require authentication
router.use(requireAuth);

// Get all conversations for the user
router.get('/', ConversationController.getUserConversations);

// Get specific conversation with messages
router.get('/:id', ConversationController.getConversation);

// Create new conversation
router.post('/', ConversationController.createConversation);

// Update conversation title
router.patch('/:id', ConversationController.updateConversation);

// Delete conversation
router.delete('/:id', ConversationController.deleteConversation);

export default router;