import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// JWT Configuration
export const JWT_CONFIG = {
  secret: process.env.JWT_SECRET || 'umca-demo-secret-key-256-bits-long-for-production-use-crypto-random',
  accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
  refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  algorithm: 'HS256',
  issuer: 'task-api',
  audience: 'task-api-users'
};

/**
 * Generate JWT access token and refresh token for user
 */
export function generateTokens(user) {
  // Generate access token
  const accessToken = jwt.sign(
    {
      userId: user.id,
      username: user.username,
      type: 'access'
    },
    JWT_CONFIG.secret,
    {
      expiresIn: JWT_CONFIG.accessTokenExpiry,
      algorithm: JWT_CONFIG.algorithm,
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience
    }
  );

  // Generate refresh token
  const refreshToken = jwt.sign(
    {
      userId: user.id,
      type: 'refresh'
    },
    JWT_CONFIG.secret,
    {
      expiresIn: JWT_CONFIG.refreshTokenExpiry,
      algorithm: JWT_CONFIG.algorithm,
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience
    }
  );

  // Calculate expiration times
  const accessTokenExpiry = new Date(Date.now() + parseTimeToMs(JWT_CONFIG.accessTokenExpiry));
  const refreshTokenExpiry = new Date(Date.now() + parseTimeToMs(JWT_CONFIG.refreshTokenExpiry));

  return {
    accessToken,
    refreshToken,
    accessTokenExpiry: accessTokenExpiry.toISOString(),
    refreshTokenExpiry: refreshTokenExpiry.toISOString()
  };
}

/**
 * Verify JWT token and return decoded payload
 */
export function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_CONFIG.secret, {
      algorithms: [JWT_CONFIG.algorithm],
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience
    });
    return { valid: true, payload: decoded };
  } catch (error) {
    return { 
      valid: false, 
      error: error.name,
      message: error.message 
    };
  }
}

/**
 * Generate secure hash for refresh token storage
 */
export function generateTokenHash(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Parse time string (e.g., '15m', '7d') to milliseconds
 */
function parseTimeToMs(timeString) {
  const unit = timeString.slice(-1);
  const value = parseInt(timeString.slice(0, -1), 10);
  
  switch (unit) {
    case 's': return value * 1000;
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'd': return value * 24 * 60 * 60 * 1000;
    default: return value * 60 * 1000; // default to minutes
  }
}