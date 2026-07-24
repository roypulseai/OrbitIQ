import { Resolver, Query, Mutation, Args, ID } from "@nestjs/graphql";
import {
  CatalogEntry as CatalogEntryGQL,
  CatalogStats as CatalogStatsGQL,
} from "../schema";
import { DataCatalogService } from "../services/data-catalog.service";

@Resolver()
export class DataCatalogResolver {
  constructor(private readonly catalogService: DataCatalogService) {}

  // ─── Queries ────────────────────────────────────────────────────────────

  @Query(() => [CatalogEntryGQL], { name: "catalogEntries" })
  async getCatalogEntries(
    @Args("connectionId", { nullable: true }) connectionId?: string,
    @Args("type", { nullable: true }) type?: string,
    @Args("query", { nullable: true }) query?: string
  ): Promise<CatalogEntryGQL[]> {
    if (query) {
      const results = this.catalogService.search(query, { connectionId, type });
      return results.map((r) => r.entry) as any;
    }
    return this.catalogService.listEntries(connectionId, type) as any;
  }

  @Query(() => CatalogEntryGQL, { name: "catalogEntry" })
  async getCatalogEntry(
    @Args("id", { type: () => ID }) id: string
  ): Promise<CatalogEntryGQL> {
    return this.catalogService.getEntry(id) as any;
  }

  @Query(() => CatalogEntryGQL, { name: "catalogEntryLineage" })
  async getCatalogEntryLineage(
    @Args("id", { type: () => ID }) id: string
  ): Promise<CatalogEntryGQL> {
    return this.catalogService.getEntryLineage(id) as any;
  }

  @Query(() => String, { name: "catalogStats" })
  async getCatalogStats(
    @Args("connectionId", { nullable: true }) connectionId?: string
  ): Promise<string> {
    const stats = this.catalogService.getStats(connectionId);
    return JSON.stringify(stats);
  }

  // ─── Mutations ──────────────────────────────────────────────────────────

  @Mutation(() => CatalogEntryGQL)
  async addCatalogTag(
    @Args("id", { type: () => ID }) id: string,
    @Args("tag") tag: string
  ): Promise<CatalogEntryGQL> {
    return this.catalogService.addTag(id, tag) as any;
  }

  @Mutation(() => CatalogEntryGQL)
  async removeCatalogTag(
    @Args("id", { type: () => ID }) id: string,
    @Args("tag") tag: string
  ): Promise<CatalogEntryGQL> {
    return this.catalogService.removeTag(id, tag) as any;
  }

  @Mutation(() => String)
  async indexConnectionToCatalog(
    @Args("connectionId") connectionId: string
  ): Promise<string> {
    const entries = this.catalogService.indexConnection(connectionId);
    return JSON.stringify({ indexed: entries.length, connectionId });
  }
}
