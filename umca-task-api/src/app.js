import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth.js';
import healthRoutes from './routes/health.js';

// Import middleware
import { authenticateJWT } from './middleware/auth.js';
import { generalRateLimiter } from './middleware/rateLimiter.js';

dotenv.config();

const app = express();

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// General rate limiting
app.use(generalRateLimiter);

// Authentication routes (no JWT required)
app.use('/api/v1/auth', authRoutes);

// Health check route (no JWT required)
app.use('/api/v1/health', healthRoutes);

// Protected API routes (JWT required)
app.use('/api/v1', authenticateJWT);

// Tasks routes placeholder (protected)
app.get('/api/v1/tasks', (req, res) => {
  res.status(501).json({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'Tasks endpoint not implemented yet',
      timestamp: new Date().toISOString()
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found',
      timestamp: new Date().toISOString()
    }
  });
});

// Basic error handler (will be enhanced in GREEN phase)
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
      timestamp: new Date().toISOString()
    }
  });
});

export default app;