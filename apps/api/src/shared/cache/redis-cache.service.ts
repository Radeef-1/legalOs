import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class RedisCacheService {
  private readonly logger = new Logger(RedisCacheService.name);

  // In-memory Redis Cache simulation store
  private readonly memoryCache: Map<string, { value: any; expiresAt?: number }> = new Map();

  /**
   * Sets a cache key with optional TTL in seconds.
   */
  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined;
    this.memoryCache.set(key, { value, expiresAt });
    this.logger.log(`[RedisCacheService] Cached key: "${key}" (TTL: ${ttlSeconds || 'unlimited'}s)`);
  }

  /**
   * Gets a cached value by key.
   */
  async get<T = any>(key: string): Promise<T | null> {
    const item = this.memoryCache.get(key);
    if (!item) return null;

    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.memoryCache.delete(key);
      return null;
    }

    return item.value as T;
  }

  /**
   * Deletes a cache key.
   */
  async del(key: string): Promise<void> {
    this.memoryCache.delete(key);
  }

  /**
   * Flushes all cached keys.
   */
  async flush(): Promise<void> {
    this.memoryCache.clear();
    this.logger.log('[RedisCacheService] Cache flushed 🟢');
  }
}
