/**
 * JWT utilities: sign and verify access/refresh tokens
 */
import dotenv from 'dotenv';
dotenv.config();
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import {
  JWTPayload,
  RefreshTokenPayload,
  TokenPair,
  AuthConfig,
  UserProfile
} from '../types/auth.js';

function getConfig(): AuthConfig {
  const {
    JWT_SECRET,
    JWT_ISSUER = 'blueprint-api',
    JWT_AUDIENCE = 'blueprint-clients',
    ACCESS_TOKEN_EXP_MIN = '15',
    REFRESH_TOKEN_EXP_DAYS = '7',
    BCRYPT_SALT_ROUNDS = '12',
    RATE_LIMIT_WINDOW_MS = '900000',
    MAX_LOGIN_ATTEMPTS = '5',
    SESSION_REDIS_URL = 'redis://localhost:6379',
    SUPABASE_URL = '',
    SUPABASE_ANON_KEY = '',
    SUPABASE_SERVICE_ROLE_KEY = ''
  } = process.env;

  if (!JWT_SECRET) {
    throw new Error('Missing JWT_SECRET environment variable');
  }

  return {
    jwtSecret: JWT_SECRET,
    jwtIssuer: JWT_ISSUER,
    jwtAudience: JWT_AUDIENCE,
    accessTokenExpiryMinutes: parseInt(ACCESS_TOKEN_EXP_MIN, 10),
    refreshTokenExpiryDays: parseInt(REFRESH_TOKEN_EXP_DAYS, 10),
    bcryptSaltRounds: parseInt(BCRYPT_SALT_ROUNDS, 10),
    rateLimitWindowMs: parseInt(RATE_LIMIT_WINDOW_MS, 10),
    maxLoginAttempts: parseInt(MAX_LOGIN_ATTEMPTS, 10),
    sessionRedisUrl: SESSION_REDIS_URL,
    supabaseUrl: SUPABASE_URL,
    supabaseAnonKey: SUPABASE_ANON_KEY,
    supabaseServiceRoleKey: SUPABASE_SERVICE_ROLE_KEY
  };
}

export function signAccessToken(user: UserProfile): { token: string; payload: JWTPayload; expiresInSec: number } {
  const cfg = getConfig();
  const nowSec = Math.floor(Date.now() / 1000);
  const expSec = nowSec + cfg.accessTokenExpiryMinutes * 60;
  const payload: JWTPayload = {
    sub: user.id,
    email: user.email,
    organizationId: user.organizationId,
    role: user.role,
    permissions: user.permissions,
    iat: nowSec,
    exp: expSec,
    iss: cfg.jwtIssuer,
    aud: cfg.jwtAudience
  };
  const token = jwt.sign(payload, cfg.jwtSecret, { algorithm: 'HS256' });
  return { token, payload, expiresInSec: expSec - nowSec };
}

export function signRefreshToken(user: UserProfile): { token: string; payload: RefreshTokenPayload; tokenId: string; expiresInSec: number } {
  const cfg = getConfig();
  const nowSec = Math.floor(Date.now() / 1000);
  const expSec = nowSec + cfg.refreshTokenExpiryDays * 24 * 60 * 60;
  const tokenId = randomUUID();
  const payload: RefreshTokenPayload = {
    sub: user.id,
    organizationId: user.organizationId,
    tokenId,
    iat: nowSec,
    exp: expSec,
    iss: cfg.jwtIssuer,
    aud: cfg.jwtAudience
  };
  const token = jwt.sign(payload, cfg.jwtSecret, { algorithm: 'HS256' });
  return { token, payload, tokenId, expiresInSec: expSec - nowSec };
}

export function verifyAccessToken(token: string): JWTPayload {
  const cfg = getConfig();
  return jwt.verify(token, cfg.jwtSecret, { algorithms: ['HS256'], audience: cfg.jwtAudience, issuer: cfg.jwtIssuer }) as JWTPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const cfg = getConfig();
  return jwt.verify(token, cfg.jwtSecret, { algorithms: ['HS256'], audience: cfg.jwtAudience, issuer: cfg.jwtIssuer }) as RefreshTokenPayload;
}

export function generateTokenPair(user: UserProfile): TokenPair {
  const { token: accessToken, expiresInSec } = signAccessToken(user);
  const { token: refreshToken } = signRefreshToken(user);
  return {
    accessToken,
    refreshToken,
    expiresIn: expiresInSec,
    tokenType: 'Bearer'
  };
}

export const AuthEnv = { getConfig };