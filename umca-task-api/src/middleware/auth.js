import { verifyToken } from '../utils/jwt.js';
import { AUTH_ERRORS, sendResponse } from '../utils/responses.js';

/**
 * JWT Authentication Middleware
 * Validates JWT tokens and attaches user info to request
 */
export function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  
  // Check if authorization header exists
  if (!authHeader) {
    return sendResponse(res, AUTH_ERRORS.TOKEN_REQUIRED());
  }
  
  // Check if header has correct format
  if (!authHeader.startsWith('Bearer ')) {
    return sendResponse(res, AUTH_ERRORS.TOKEN_INVALID());
  }
  
  // Extract token
  const token = authHeader.substring(7);
  
  if (!token) {
    return sendResponse(res, AUTH_ERRORS.TOKEN_REQUIRED());
  }
  
  // Verify token
  const { valid, payload, error } = verifyToken(token);
  
  if (!valid) {
    if (error === 'TokenExpiredError') {
      return sendResponse(res, AUTH_ERRORS.TOKEN_EXPIRED());
    }
    return sendResponse(res, AUTH_ERRORS.TOKEN_INVALID());
  }
  
  // Validate token type
  if (payload.type !== 'access') {
    return sendResponse(res, AUTH_ERRORS.TOKEN_INVALID());
  }
  
  // Attach user info to request
  req.user = {
    id: payload.userId,
    username: payload.username
  };
  
  next();
}