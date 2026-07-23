import { Resolver, Query, Mutation, Args } from "@nestjs/graphql";
import { CacheStats, InvalidateCacheInput } from "../schema";
import { CacheService } from "../services/cache.service";
import { AuditService } from "../services/audit.service";

@Resolver()
export class CacheResolver {
  constructor(
    private readonly cacheService: CacheService,
    private readonly auditService: AuditService
  ) {}

  @Query(() => CacheStats)
  async getCacheStats(): Promise<CacheStats> {
    return this.cacheService.getCacheStats() as any;
  }

  @Mutation(() => Boolean)
  async invalidateCache(
    @Args("input") input: InvalidateCacheInput
  ): Promise<boolean> {
    if (input.key) {
      this.cacheService.deleteCache(input.key);
    } else if (input.pattern) {
      this.cacheService.invalidateByPattern(input.pattern);
    }
    await this.auditService.log({
      action: "cache.invalidate",
      target: input.key || input.pattern || "all",
      metadata: { connectionId: input.connectionId },
    });
    return true;
  }

  @Mutation(() => Boolean)
  async clearAllCache(): Promise<boolean> {
    this.cacheService.invalidateByPattern("*");
    await this.auditService.log({
      action: "cache.clear_all",
      target: "all",
      metadata: {},
    });
    return true;
  }
}
