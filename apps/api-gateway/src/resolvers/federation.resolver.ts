import { Resolver, Query, Mutation, Args, ID, Int, Float } from "@nestjs/graphql";
import {
  FederationEngineGQL,
  FederatedQueryGQL,
  QueryPlanCacheEntryGQL,
  FederationCacheStatsGQL,
  EngineHealthGQL,
} from "../schema";
import { FederationService } from "../services/federation.service";

@Resolver()
export class FederationResolver {
  constructor(private readonly federationService: FederationService) {}

  @Query(() => [FederationEngineGQL], { name: "federationEngines" })
  async getEngines(): Promise<FederationEngineGQL[]> {
    return this.federationService.getEngines() as any;
  }

  @Query(() => FederationEngineGQL, { name: "federationEngine", nullable: true })
  async getEngine(
    @Args("id", { type: () => ID }) id: string,
  ): Promise<FederationEngineGQL | null> {
    return (this.federationService.getEngine(id) as any) || null;
  }

  @Query(() => FederatedQueryGQL, { name: "federatedQuery", nullable: true })
  async getQuery(
    @Args("id", { type: () => ID }) id: string,
  ): Promise<FederatedQueryGQL | null> {
    return (this.federationService as any).queries?.find((q: any) => q.id === id) || null;
  }

  @Query(() => [QueryPlanCacheEntryGQL], { name: "queryPlanCache" })
  async getQueryCache(): Promise<QueryPlanCacheEntryGQL[]> {
    return this.federationService.getQueryCache() as any;
  }

  @Query(() => FederationCacheStatsGQL, { name: "federationCacheStats" })
  async getCacheStats(): Promise<FederationCacheStatsGQL> {
    return this.federationService.getCacheStats() as any;
  }

  @Query(() => [EngineHealthGQL], { name: "engineHealth" })
  async getEngineHealth(): Promise<EngineHealthGQL[]> {
    return this.federationService.getEngineHealth() as any;
  }

  @Mutation(() => FederatedQueryGQL)
  async executeFederatedQuery(
    @Args("query") query: string,
    @Args("engine", { type: () => String, nullable: true }) engine?: string,
  ): Promise<FederatedQueryGQL> {
    return this.federationService.executeFederatedQuery(query, engine || undefined) as any;
  }

  @Mutation(() => Boolean)
  async invalidateQueryCache(
    @Args("id", { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.federationService.invalidateCache(id);
  }

  @Mutation(() => Int)
  async clearQueryCache(): Promise<number> {
    return this.federationService.clearCache();
  }
}
