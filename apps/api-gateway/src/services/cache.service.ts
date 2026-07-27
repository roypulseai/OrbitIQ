import { Injectable, OnModuleDestroy, Logger } from "@nestjs/common";

interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  evictions: number;
  totalEntries: number;
}

@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private redis: any = null;
  private fallbackCache: Map<string, { result: any; expiresAt: number }> = new Map();
  private stats: CacheStats = { hits: 0, misses: 0, sets: 0, evictions: 0, totalEntries: 0 };
  private readonly prefix = "orbitiq:cache:";
  private ready = false;

  constructor() {
    this.initRedis();
  }

  private async initRedis() {
    try {
      const Redis = require("ioredis");
      const redisUrl = process.env.REDIS_URL || "redis://localhost:6380";
      this.redis = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        retryStrategy(times: number) {
          if (times > 3) return null;
          return Math.min(times * 200, 2000);
        },
        lazyConnect: true,
        connectTimeout: 3000,
      });
      this.redis.on("connect", () => {
        this.ready = true;
        this.logger.log("Redis connected — using Redis for cache");
      });
      this.redis.on("error", (err: Error) => {
        if (this.ready) {
          this.logger.warn(`Redis error, falling back to in-memory: ${err.message}`);
        }
        this.ready = false;
      });
      this.redis.on("close", () => {
        this.ready = false;
      });
      await Promise.race([
        this.redis.connect(),
        new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 3000)),
      ]);
    } catch {
      this.logger.warn("Redis unavailable — using in-memory cache fallback");
      this.redis = null;
      this.ready = false;
    }
  }

  async onModuleDestroy() {
    if (this.redis) {
      try { await this.redis.quit(); } catch { /* ignore */ }
    }
  }

  private useRedis(): boolean {
    return this.ready && this.redis !== null;
  }

  async getCache(key: string): Promise<any | null> {
    if (this.useRedis()) {
      try {
        const raw = await this.redis.get(this.prefix + key);
        if (raw === null) { this.stats.misses++; return null; }
        this.stats.hits++;
        return JSON.parse(raw);
      } catch {
        this.stats.misses++;
        return null;
      }
    }
    const entry = this.fallbackCache.get(key);
    if (!entry) { this.stats.misses++; return null; }
    if (Date.now() > entry.expiresAt) {
      this.fallbackCache.delete(key);
      this.stats.evictions++;
      this.stats.misses++;
      return null;
    }
    this.stats.hits++;
    return entry.result;
  }

  async setCache(key: string, result: any, ttlSeconds: number): Promise<void> {
    if (this.useRedis()) {
      try {
        await this.redis.setex(this.prefix + key, ttlSeconds, JSON.stringify(result));
        this.stats.sets++;
        return;
      } catch { /* fall through to in-memory */ }
    }
    this.fallbackCache.set(key, { result, expiresAt: Date.now() + ttlSeconds * 1000 });
    this.stats.sets++;
    this.stats.totalEntries = this.fallbackCache.size;
  }

  async deleteCache(key: string): Promise<boolean> {
    if (this.useRedis()) {
      try {
        const count = await this.redis.del(this.prefix + key);
        return count > 0;
      } catch { return false; }
    }
    const existed = this.fallbackCache.has(key);
    this.fallbackCache.delete(key);
    this.stats.totalEntries = this.fallbackCache.size;
    return existed;
  }

  async invalidateByPattern(pattern: string): Promise<number> {
    if (this.useRedis()) {
      try {
        const scanPattern = this.prefix + pattern.replace(/\*/g, "*").replace(/\?/g, ".");
        let cursor = "0";
        let count = 0;
        do {
          const [nextCursor, keys] = await this.redis.scan(cursor, "MATCH", scanPattern, "COUNT", 100);
          cursor = nextCursor;
          if (keys.length > 0) {
            await this.redis.del(...keys);
            count += keys.length;
          }
        } while (cursor !== "0");
        return count;
      } catch { return 0; }
    }
    const regex = new RegExp("^" + pattern.replace(/\*/g, ".*").replace(/\?/g, ".") + "$");
    let count = 0;
    for (const [key] of this.fallbackCache) {
      if (regex.test(key)) { this.fallbackCache.delete(key); count++; }
    }
    this.stats.totalEntries = this.fallbackCache.size;
    return count;
  }

  async getCacheStats(): Promise<CacheStats & { backend: string }> {
    const backend = this.useRedis() ? "redis" : "in-memory";
    if (this.useRedis()) {
      try {
        const keys = await this.redis.keys(this.prefix + "*");
        return { ...this.stats, totalEntries: keys.length, backend };
      } catch { /* ignore */ }
    }
    return { ...this.stats, totalEntries: this.fallbackCache.size, backend };
  }

  generateCacheKey(query: string, params: any[], connectionId: string): string {
    const normalizedParams = JSON.stringify(params, (_, value) =>
      typeof value === "object" && value !== null
        ? Object.keys(value).sort().reduce((sorted: Record<string, any>, key) => {
            sorted[key] = (value as Record<string, any>)[key];
            return sorted;
          }, {})
        : value
    );
    return [connectionId, query, normalizedParams].join("::");
  }
}
