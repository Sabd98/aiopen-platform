import express from 'express';
import { validateBody } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { chatSchema } from '../schemas/chat.schema.js';
import { ChatController } from '../controllers/chat.controller.js';

const router = express.Router();

// All chat routes require authentication
router.use(requireAuth);

router.post('/', validateBody(chatSchema), ChatController.handleChat);
router.get('/', ChatController.getHistory);

export default router;
