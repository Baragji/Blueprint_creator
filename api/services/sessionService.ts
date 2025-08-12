/**
 * Redis Session Service for JWT token management
 * Handles session storage, token blacklisting, and refresh token validation
 */
import { AuthEnv } from '../utils/jwt.js';
import { SessionData, RefreshTokenPayload } from '../types/auth.js';

// Define Redis-like interface to avoid direct ioredis dependency at module level
interface RedisLike {
  set(key: string, value: string, exMode?: string, ttl?: number): Promise<string | null>;
  get(key: string): Promise<string | null>;
  del(key: string): Promise<number>;
  exists(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<number>;
  quit(): Promise<void>;
}

// In-memory fallback for development
class InMemoryRedis implements RedisLike {
  private store = new Map<string, { value: string; expiry?: number }>();

  async set(key: string, value: string, exMode?: string, ttl?: number): Promise<string | null> {
    const expiry = ttl ? Date.now() + ttl * 1000 : undefined;
    this.store.set(key, { value, expiry });
    return 'OK';
  }

  async get(key: string): Promise<string | null> {
    const item = this.store.get(key);
    if (!item) return null;
    if (item.expiry && Date.now() > item.expiry) {
      this.store.delete(key);
      return null;
    }
    return item.value;
  }

  async del(key: string): Promise<number> {
    return this.store.delete(key) ? 1 : 0;
  }

  async exists(key: string): Promise<number> {
    const item = this.store.get(key);
    if (!item) return 0;
    if (item.expiry && Date.now() > item.expiry) {
      this.store.delete(key);
      return 0;
    }
    return 1;
  }

  async expire(key: string, seconds: number): Promise<number> {
    const item = this.store.get(key);
    if (!item) return 0;
    item.expiry = Date.now() + seconds * 1000;
    return 1;
  }

  async quit(): Promise<void> {
    // No-op for in-memory
  }
}

export class SessionService {
  private redis: RedisLike | null = null;
  private readonly PREFIX = {
    SESSION: 'session:',
    REFRESH_TOKEN: 'refresh:',
    BLACKLIST: 'blacklist:',
    USER_SESSIONS: 'user_sessions:'
  };

  private async getRedisClient(): Promise<RedisLike> {
    if (this.redis) return this.redis;

    const { sessionRedisUrl } = AuthEnv.getConfig();
    
    try {
      // Dynamic import to avoid dependency issues
      const moduleName: string = 'ioredis';
      const mod = await import(moduleName);
      const RedisCtor = mod?.default ?? mod;
      this.redis = new RedisCtor(sessionRedisUrl) as RedisLike;
      console.log('Connected to Redis for session management');
    } catch (error) {
      console.warn('Redis not available, using in-memory session store:', error instanceof Error ? error.message : String(error));
      this.redis = new InMemoryRedis();
    }

    return this.redis;
  }

  /**
   * Store session data with TTL
   */
  async storeSession(userId: string, sessionData: SessionData, ttlSeconds: number): Promise<void> {
    try {
      const redis = await this.getRedisClient();
      const key = `${this.PREFIX.SESSION}${userId}`;
      await redis.set(key, JSON.stringify(sessionData), 'EX', ttlSeconds);
    } catch (error) {
      console.error('Failed to store session:', error);
      throw new Error('Session storage failed');
    }
  }

  /**
   * Retrieve session data
   */
  async getSession(userId: string): Promise<SessionData | null> {
    try {
      const redis = await this.getRedisClient();
      const key = `${this.PREFIX.SESSION}${userId}`;
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to retrieve session:', error);
      return null;
    }
  }

  /**
   * Store refresh token with TTL
   */
  async storeRefreshToken(tokenId: string, payload: RefreshTokenPayload, ttlSeconds: number): Promise<void> {
    try {
      const redis = await this.getRedisClient();
      const key = `${this.PREFIX.REFRESH_TOKEN}${tokenId}`;
      await redis.set(key, JSON.stringify(payload), 'EX', ttlSeconds);
    } catch (error) {
      console.error('Failed to store refresh token:', error);
      throw new Error('Refresh token storage failed');
    }
  }

  /**
   * Validate refresh token exists and not expired
   */
  async validateRefreshToken(tokenId: string): Promise<RefreshTokenPayload | null> {
    try {
      const redis = await this.getRedisClient();
      const key = `${this.PREFIX.REFRESH_TOKEN}${tokenId}`;
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to validate refresh token:', error);
      return null;
    }
  }

  /**
   * Invalidate refresh token (logout or rotation)
   */
  async invalidateRefreshToken(tokenId: string): Promise<void> {
    try {
      const redis = await this.getRedisClient();
      const key = `${this.PREFIX.REFRESH_TOKEN}${tokenId}`;
      await redis.del(key);
    } catch (error) {
      console.error('Failed to invalidate refresh token:', error);
    }
  }

  /**
   * Blacklist access token (for logout)
   */
  async blacklistToken(jti: string, expiryTimestamp: number): Promise<void> {
    try {
      const redis = await this.getRedisClient();
      const key = `${this.PREFIX.BLACKLIST}${jti}`;
      const ttl = Math.max(0, expiryTimestamp - Math.floor(Date.now() / 1000));
      if (ttl > 0) {
        await redis.set(key, '1', 'EX', ttl);
      }
    } catch (error) {
      console.error('Failed to blacklist token:', error);
    }
  }

  /**
   * Check if token is blacklisted
   */
  async isTokenBlacklisted(jti: string): Promise<boolean> {
    try {
      const redis = await this.getRedisClient();
      const key = `${this.PREFIX.BLACKLIST}${jti}`;
      const exists = await redis.exists(key);
      return exists === 1;
    } catch (error) {
      console.error('Failed to check blacklist:', error);
      return false; // Fail open for availability
    }
  }

  /**
   * Clear all sessions for a user (security logout)
   */
  async clearUserSessions(userId: string): Promise<void> {
    try {
      const redis = await this.getRedisClient();
      
      // Clear main session
      const sessionKey = `${this.PREFIX.SESSION}${userId}`;
      await redis.del(sessionKey);

      // Mark user sessions as cleared (for refresh token validation)
      const userSessionKey = `${this.PREFIX.USER_SESSIONS}${userId}`;
      await redis.set(userSessionKey, Date.now().toString(), 'EX', 7 * 24 * 60 * 60); // 7 days
    } catch (error) {
      console.error('Failed to clear user sessions:', error);
    }
  }

  /**
   * Check if user sessions were cleared after token issue time
   */
  async wereSessionsCleared(userId: string, tokenIssuedAt: number): Promise<boolean> {
    try {
      const redis = await this.getRedisClient();
      const userSessionKey = `${this.PREFIX.USER_SESSIONS}${userId}`;
      const clearTime = await redis.get(userSessionKey);
      
      if (!clearTime) return false;
      
      const clearTimestamp = parseInt(clearTime, 10);
      return clearTimestamp > tokenIssuedAt * 1000; // Convert token iat to ms
    } catch (error) {
      console.error('Failed to check session clear status:', error);
      return false;
    }
  }

  /**
   * Clean up expired entries (maintenance)
   */
  async cleanup(): Promise<void> {
    // Redis handles TTL automatically, but we could implement custom cleanup here
    console.log('Session cleanup completed');
  }

  /**
   * Close Redis connection
   */
  async close(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
      this.redis = null;
    }
  }

  /**
   * Health check for Redis connection
   */
  async healthCheck(): Promise<boolean> {
    try {
      const redis = await this.getRedisClient();
      await redis.set('health_check', '1', 'EX', 10);
      const result = await redis.get('health_check');
      return result === '1';
    } catch (error) {
      console.error('Session service health check failed:', error);
      return false;
    }
  }
}

export const sessionService = new SessionService();