import { Injectable } from "@nestjs/common";

interface CacheEntry {
  key: string;
  result: any;
  expiresAt: Date;
}

interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  evictions: number;
  totalEntries: number;
}

@Injectable()
export class CacheService {
  private cache: Map<string, CacheEntry> = new Map();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    evictions: 0,
    totalEntries: 0,
  };

  async getCache(key: string): Promise<any | null> {
    const entry = this.cache.get(key);
    if (!entry) {
      this.stats.misses++;
      return null;
    }
    if (new Date() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.evictions++;
      this.stats.misses++;
      this.stats.totalEntries = this.cache.size;
      return null;
    }
    this.stats.hits++;
    return entry.result;
  }

  async setCache(key: string, result: any, ttlSeconds: number): Promise<void> {
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
    this.cache.set(key, { key, result, expiresAt });
    this.stats.sets++;
    this.stats.totalEntries = this.cache.size;
  }

  async deleteCache(key: string): Promise<boolean> {
    const existed = this.cache.has(key);
    this.cache.delete(key);
    this.stats.totalEntries = this.cache.size;
    return existed;
  }

  async invalidateByPattern(pattern: string): Promise<number> {
    const regex = new RegExp(
      "^" + pattern.replace(/\*/g, ".*").replace(/\?/g, ".") + "$"
    );
    let count = 0;
    for (const [key] of this.cache) {
      if (regex.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }
    this.stats.totalEntries = this.cache.size;
    return count;
  }

  async getCacheStats(): Promise<CacheStats> {
    return {
      ...this.stats,
      totalEntries: this.cache.size,
    };
  }

  generateCacheKey(
    query: string,
    params: any[],
    connectionId: string
  ): string {
    const normalizedParams = JSON.stringify(params, (_, value) =>
      typeof value === "object" && value !== null
        ? Object.keys(value)
            .sort()
            .reduce((sorted: Record<string, any>, key) => {
              sorted[key] = (value as Record<string, any>)[key];
              return sorted;
            }, {})
        : value
    );
    const parts = [connectionId, query, normalizedParams];
    return parts.join("::");
  }
}
