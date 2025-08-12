/**
 * Redis-backed rate limiting middleware with graceful in-memory fallback
 */
import type { Request, Response, NextFunction } from 'express';
import { AuthEnv } from '../utils/jwt.js';
import { RateLimitConfig } from '../types/auth.js';

// Minimal Redis-like interface used by the limiter
interface RedisLike {
  incr(key: string): Promise<number>;
  pexpire(key: string, ms: number): Promise<number>;
}

// In-memory fallback implementation
function createInMemoryRedis(): RedisLike {
  const store = new Map<string, { count: number; expiresAt: number }>();
  return {
    async incr(key: string) {
      const now = Date.now();
      const entry = store.get(key);
      if (!entry || entry.expiresAt <= now) {
        store.set(key, { count: 1, expiresAt: now });
        return 1;
      }
      entry.count += 1;
      return entry.count;
    },
    async pexpire(key: string, ms: number) {
      const now = Date.now();
      const entry = store.get(key);
      if (entry) {
        entry.expiresAt = now + ms;
      } else {
        store.set(key, { count: 0, expiresAt: now + ms });
      }
      return 1;
    }
  };
}

let redisClient: RedisLike | null = null;
async function getRedis(): Promise<RedisLike> {
  if (redisClient) return redisClient;
  const { sessionRedisUrl } = AuthEnv.getConfig();
  try {
    // Dynamically import ioredis using an indirect variable to avoid TS resolution when types are absent
    const moduleName: string = 'ioredis';
    const mod: any = await import(moduleName);
    const RedisCtor = mod?.default ?? mod;
    redisClient = new RedisCtor(sessionRedisUrl) as RedisLike;
  } catch (err) {
    console.warn('ioredis not available, falling back to in-memory rate limiter');
    redisClient = createInMemoryRedis();
  }
  return redisClient;
}

export function createRateLimiter(config?: Partial<RateLimitConfig>) {
  const cfg = AuthEnv.getConfig();
  const windowMs = config?.windowMs ?? cfg.rateLimitWindowMs;
  const max = config?.maxAttempts ?? cfg.maxLoginAttempts;
  const keyGen = config?.keyGenerator ?? ((req: Request) => {
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
    return `${req.path}:${ip}`;
  });

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const redis = await getRedis();
      const now = Date.now();
      const key = keyGen(req);
      const windowBucket = Math.floor(now / windowMs);
      const windowKey = `${key}:${windowBucket}`;

      const count = await redis.incr(windowKey);
      if (count === 1) {
        await redis.pexpire(windowKey, windowMs);
      }

      if (count > max) {
        res.setHeader('Retry-After', Math.ceil(windowMs / 1000).toString());
        return res.status(429).json({
          success: false,
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests, please try again later.'
        });
      }

      return next();
    } catch (err) {
      console.warn('Rate limiter error:', err);
      return next();
    }
  };
}

export default { createRateLimiter };