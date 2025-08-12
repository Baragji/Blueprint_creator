/**
 * Authentication middleware: validates JWT access tokens and attaches user context
 */
import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';
import {
  AuthenticatedRequest,
  AuthErrorCode,
  JWTPayload,
  Permission,
  UserProfile
} from '../types/auth.js';

function extractBearerToken(req: Request): string | null {
  const auth = req.headers.authorization || req.headers.Authorization as string | undefined;
  if (!auth || typeof auth !== 'string') return null;
  const [scheme, token] = auth.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) return null;
  return token.trim();
}

function payloadToUser(payload: JWTPayload): UserProfile {
  // Token may not carry PII like names; default to empty strings
  return {
    id: payload.sub,
    email: payload.email,
    firstName: '',
    lastName: '',
    role: payload.role,
    organizationId: payload.organizationId,
    emailVerified: true,
    permissions: payload.permissions,
  };
}

export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = extractBearerToken(req);
    if (!token) return next();

    const payload = verifyAccessToken(token);
    const user = payloadToUser(payload);

    (req as AuthenticatedRequest).user = user;
    (req as AuthenticatedRequest).token = token;
    (req as AuthenticatedRequest).organizationId = payload.organizationId;

    return next();
  } catch {
    // Ignore invalid token for optional auth, treat as unauthenticated
    return next();
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = extractBearerToken(req);
    if (!token) {
      return res.status(401).json({
        success: false,
        code: AuthErrorCode.INVALID_TOKEN,
        message: 'Missing or invalid Authorization header'
      });
    }

    let payload: JWTPayload;
    try {
      payload = verifyAccessToken(token);
    } catch (err: any) {
      const expired = err?.name === 'TokenExpiredError';
      return res.status(401).json({
        success: false,
        code: expired ? AuthErrorCode.TOKEN_EXPIRED : AuthErrorCode.INVALID_TOKEN,
        message: expired ? 'Access token expired' : 'Invalid access token'
      });
    }

    const user = payloadToUser(payload);
    (req as AuthenticatedRequest).user = user;
    (req as AuthenticatedRequest).token = token;
    (req as AuthenticatedRequest).organizationId = payload.organizationId;

    return next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      code: AuthErrorCode.INVALID_TOKEN,
      message: 'Unauthorized'
    });
  }
}

export function requirePermissions(required: Permission[] | Permission) {
  const requiredList = Array.isArray(required) ? required : [required];
  return (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthenticatedRequest;
    const userPerms = authReq.user?.permissions || [];
    const hasAll = requiredList.every((p) => userPerms.includes(p));
    if (!hasAll) {
      return res.status(403).json({
        success: false,
        code: AuthErrorCode.INSUFFICIENT_PERMISSIONS,
        message: 'Insufficient permissions'
      });
    }
    return next();
  };
}

export default {
  optionalAuth,
  requireAuth,
  requirePermissions,
};