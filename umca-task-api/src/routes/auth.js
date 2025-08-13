import express from 'express';
import { register, login, refresh } from '../controllers/authController.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Apply rate limiting to all auth routes
router.use(authRateLimiter);

// Authentication routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);

export default router;