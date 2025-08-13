import { User } from '../models/User.js';
import { generateTokens, generateTokenHash } from '../utils/jwt.js';
import { validateInput, registerSchema, loginSchema } from '../utils/validation.js';
import { successResponse, errorResponse, AUTH_ERRORS, sendResponse } from '../utils/responses.js';

/**
 * Register new user
 */
export async function register(req, res) {
  try {
    // Validate input
    const { valid, data, errors } = validateInput(req.body, registerSchema);
    
    if (!valid) {
      return sendResponse(res, errorResponse(
        'VALIDATION_ERROR',
        'Invalid input data',
        400,
        errors
      ));
    }

    // Create user
    const user = await User.create(data);
    
    // Generate tokens
    const tokens = generateTokens(user);
    
    // Store refresh token (in production, this would be in database)
    const refreshTokenHash = generateTokenHash(tokens.refreshToken);
    await User.createRefreshToken({
      userId: user.id,
      tokenHash: refreshTokenHash,
      expiresAt: tokens.refreshTokenExpiry
    });

    // Return success response
    const responseData = successResponse({
      user,
      token: tokens.accessToken,
      expires_at: tokens.accessTokenExpiry
    }, 201);

    return sendResponse(res, responseData);

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.code === 'DUPLICATE_KEY') {
      const field = error.message.toLowerCase().includes('username') ? 'username' : 'email';
      return sendResponse(res, AUTH_ERRORS.USER_EXISTS(field));
    }
    
    return sendResponse(res, errorResponse(
      'INTERNAL_ERROR',
      'Registration failed',
      500
    ));
  }
}

/**
 * Login user
 */
export async function login(req, res) {
  try {
    // Validate input
    const { valid, data, errors } = validateInput(req.body, loginSchema);
    
    if (!valid) {
      return sendResponse(res, errorResponse(
        'VALIDATION_ERROR',
        'Invalid input data',
        400,
        errors
      ));
    }

    // Find user
    const user = await User.findByUsername(data.username);
    
    if (!user) {
      return sendResponse(res, AUTH_ERRORS.INVALID_CREDENTIALS());
    }

    // Validate password
    const isValidPassword = await User.validatePassword(data.password, user.password_hash);
    
    if (!isValidPassword) {
      return sendResponse(res, AUTH_ERRORS.INVALID_CREDENTIALS());
    }

    // Generate tokens
    const userWithoutPassword = await User.findById(user.id);
    const tokens = generateTokens(userWithoutPassword);
    
    // Store refresh token
    const refreshTokenHash = generateTokenHash(tokens.refreshToken);
    await User.createRefreshToken({
      userId: user.id,
      tokenHash: refreshTokenHash,
      expiresAt: tokens.refreshTokenExpiry
    });

    // Return success response
    const responseData = successResponse({
      user: userWithoutPassword,
      token: tokens.accessToken,
      expires_at: tokens.accessTokenExpiry
    });

    return sendResponse(res, responseData);

  } catch (error) {
    console.error('Login error:', error);
    
    return sendResponse(res, errorResponse(
      'INTERNAL_ERROR',
      'Login failed',
      500
    ));
  }
}

/**
 * Refresh access token
 */
export async function refresh(req, res) {
  try {
    const { refresh_token } = req.body;
    
    if (!refresh_token) {
      return sendResponse(res, AUTH_ERRORS.REFRESH_TOKEN_INVALID());
    }

    // Generate hash and find refresh token
    const tokenHash = generateTokenHash(refresh_token);
    const storedToken = await User.findRefreshToken(tokenHash);
    
    if (!storedToken || new Date(storedToken.expires_at) < new Date()) {
      return sendResponse(res, AUTH_ERRORS.REFRESH_TOKEN_INVALID());
    }

    // Get user
    const user = await User.findById(storedToken.user_id);
    
    if (!user) {
      return sendResponse(res, AUTH_ERRORS.REFRESH_TOKEN_INVALID());
    }

    // Generate new tokens
    const tokens = generateTokens(user);
    
    // Store new refresh token and delete old one
    await User.deleteRefreshToken(tokenHash);
    const newRefreshTokenHash = generateTokenHash(tokens.refreshToken);
    await User.createRefreshToken({
      userId: user.id,
      tokenHash: newRefreshTokenHash,
      expiresAt: tokens.refreshTokenExpiry
    });

    // Return success response
    const responseData = successResponse({
      token: tokens.accessToken,
      expires_at: tokens.accessTokenExpiry
    });

    return sendResponse(res, responseData);

  } catch (error) {
    console.error('Token refresh error:', error);
    
    return sendResponse(res, errorResponse(
      'INTERNAL_ERROR',
      'Token refresh failed',
      500
    ));
  }
}