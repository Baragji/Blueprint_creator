import rateLimit from 'express-rate-limit';
import { AUTH_ERRORS } from '../utils/responses.js';

/**
 * Rate limiting configuration for authentication endpoints
 */
export const authRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 attempts per minute per IP
  skipSuccessfulRequests: true,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts. Please try again later',
      timestamp: new Date().toISOString()
    }
  }
});

/**
 * Rate limiting configuration for API endpoints
 */
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many API requests. Please try again later',
      timestamp: new Date().toISOString()
    }
  }
});

/**
 * General rate limiter for all endpoints
 */
export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP. Please try again later',
      timestamp: new Date().toISOString()
    }
  }
});