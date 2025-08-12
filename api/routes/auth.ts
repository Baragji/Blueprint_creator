/**
 * This is a user authentication API route demo.
 * Handle user registration, login, token management, etc.
 */
import { Router, type Request, type Response } from 'express';
import { validateLoginRequest, validateRegisterRequest } from '../utils/validation.js';
import { authService } from '../services/authService.js';
import { requireAuth } from '../middleware/auth.js';
import { verifyRefreshToken } from '../utils/jwt.js';
import { AuthErrorCode, type AuthenticatedRequest } from '../types/auth.js';

const router = Router();

/**
 * User Registration
 * POST /api/auth/register
 */
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { valid, errors, sanitized } = validateRegisterRequest(req.body);
    if (!valid || !sanitized) {
      res.status(400).json({ success: false, code: AuthErrorCode.WEAK_PASSWORD, message: 'Invalid registration data', errors });
      return;
    }

    const { user, organization, tokens } = await authService.register(sanitized);

    // Align response shape with frontend expectations
    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role as unknown as 'owner' | 'admin' | 'user',
        organizationId: user.organizationId,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      organization: {
        id: organization.id,
        name: organization.name,
        settings: {
          allowSelfRegistration: true,
          requireEmailVerification: false,
          passwordPolicy: {
            minLength: 8,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSpecialChars: true,
          },
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (err: any) {
    const message = err?.message || 'Registration failed';
    const conflict = /already exists/i.test(message);
    res.status(conflict ? 409 : 500).json({ success: false, code: conflict ? AuthErrorCode.USER_ALREADY_EXISTS : AuthErrorCode.INVALID_CREDENTIALS, message });
  }
});

/**
 * User Login
 * POST /api/auth/login
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { valid, errors, sanitized } = validateLoginRequest(req.body);
    if (!valid || !sanitized) {
      res.status(400).json({ success: false, code: AuthErrorCode.INVALID_CREDENTIALS, message: 'Invalid login data', errors });
      return;
    }

    const { user, organization, tokens } = await authService.login(sanitized);

    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role as unknown as 'owner' | 'admin' | 'user',
        organizationId: user.organizationId,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      },
      organization: {
        id: organization.id,
        name: organization.name,
        settings: {
          allowSelfRegistration: true,
          requireEmailVerification: false,
          passwordPolicy: {
            minLength: 8,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSpecialChars: true,
          },
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (err: any) {
    res.status(401).json({ success: false, code: AuthErrorCode.INVALID_CREDENTIALS, message: err?.message || 'Invalid email or password' });
  }
});

/**
 * Token Refresh
 * POST /api/auth/refresh
 */
router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body || {};
    if (!refreshToken || typeof refreshToken !== 'string') {
      res.status(400).json({ success: false, code: AuthErrorCode.INVALID_TOKEN, message: 'Missing refresh token' });
      return;
    }

    const payload = verifyRefreshToken(refreshToken);
    const user = await authService.findUserById(payload.sub);
    if (!user || !user.isActive) {
      res.status(401).json({ success: false, code: AuthErrorCode.INVALID_CREDENTIALS, message: 'User not found or inactive' });
      return;
    }

    const org = await authService.findOrganizationById(user.organizationId);
    if (!org || !org.isActive) {
      res.status(401).json({ success: false, code: AuthErrorCode.ORGANIZATION_NOT_FOUND, message: 'Organization not found or inactive' });
      return;
    }

    const userProfile = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      organizationId: user.organizationId,
      emailVerified: user.emailVerified,
      permissions: [],
    };

    const { accessToken, refreshToken: newRefreshToken } = (await import('../utils/jwt.js')).generateTokenPair(userProfile);

    res.status(200).json({ token: accessToken, refreshToken: newRefreshToken });
  } catch (err: any) {
    const expired = err?.name === 'TokenExpiredError';
    res.status(401).json({ success: false, code: expired ? AuthErrorCode.TOKEN_EXPIRED : AuthErrorCode.INVALID_TOKEN, message: expired ? 'Refresh token expired' : 'Invalid refresh token' });
  }
});

/**
 * User Logout
 * POST /api/auth/logout
 */
router.post('/logout', async (req: Request, res: Response): Promise<void> => {
  // Stateless JWT logout: client should discard tokens
  res.status(200).json({ success: true });
});

/**
 * Get current user profile
 * GET /api/auth/me
 */
router.get('/me', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { user } = req as AuthenticatedRequest;
  if (!user) {
    res.status(401).json({ success: false, code: AuthErrorCode.INVALID_TOKEN, message: 'Unauthorized' });
    return;
  }

  res.status(200).json({ user: {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role as unknown as 'owner' | 'admin' | 'user',
    organizationId: user.organizationId,
  }});
});

export default router;