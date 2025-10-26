import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validateAuth } from '../middleware/validate.js';

const router = Router();

// Public routes
router.post('/register', validateAuth.register, AuthController.register);
router.post('/login', validateAuth.login, AuthController.login);
router.post('/logout', AuthController.logout);
router.get('/check', AuthController.checkAuth);

// Protected routes
router.get('/me', requireAuth, AuthController.me);

export default router;