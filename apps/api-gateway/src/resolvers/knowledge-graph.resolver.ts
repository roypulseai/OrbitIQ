import { Resolver, Query, Mutation, Args, ID } from "@nestjs/graphql";
import {
  KGEntity,
  KGRelationship,
  KGMatch,
  KGStats,
  VerticalInfo,
  CreateKGEntityInput,
  CreateKGRelationshipInput,
} from "../schema";
import { KnowledgeGraphService } from "../services/knowledge-graph.service";

@Resolver()
export class KnowledgeGraphResolver {
  constructor(private readonly kgService: KnowledgeGraphService) {}

  // ─── Queries ────────────────────────────────────────────────────────────

  @Query(() => [KGEntity], { name: "kgEntities" })
  async getKGEntities(
    @Args("vertical", { nullable: true }) vertical?: string,
    @Args("type", { nullable: true }) type?: string
  ): Promise<KGEntity[]> {
    return this.kgService.listEntities(vertical, type) as any;
  }

  @Query(() => KGEntity, { name: "kgEntity" })
  async getKGEntity(
    @Args("id", { type: () => ID }) id: string
  ): Promise<KGEntity> {
    return this.kgService.getEntity(id) as any;
  }

  @Query(() => [KGRelationship], { name: "kgRelationships" })
  async getKGRelationships(
    @Args("vertical", { nullable: true }) vertical?: string
  ): Promise<KGRelationship[]> {
    return this.kgService.listRelationships(vertical) as any;
  }

  @Query(() => [KGEntity], { name: "kgSearchEntities" })
  async searchKGEntities(
    @Args("query") query: string,
    @Args("vertical", { nullable: true }) vertical?: string
  ): Promise<KGEntity[]> {
    return this.kgService.searchEntities(query, vertical) as any;
  }

  @Query(() => [VerticalInfo], { name: "kgVerticals" })
  async getKGVerticals(): Promise<VerticalInfo[]> {
    return this.kgService.getVerticals() as any;
  }

  @Query(() => String, { name: "kgStats" })
  async getKGStats(): Promise<string> {
    const stats = this.kgService.getGraphStats();
    return JSON.stringify(stats);
  }

  @Query(() => String, { name: "discoveryRun" })
  async getDiscoveryRun(
    @Args("id", { type: () => ID }) id: string
  ): Promise<string> {
    const run = this.kgService.getDiscoveryRun(id);
    return JSON.stringify(run);
  }

  @Query(() => [String], { name: "discoveryRuns" })
  async getDiscoveryRuns(
    @Args("connectionId", { nullable: true }) connectionId?: string
  ): Promise<string[]> {
    const runs = this.kgService.listDiscoveryRuns(connectionId);
    return runs.map((r) => JSON.stringify(r));
  }

  @Query(() => [KGMatch], { name: "kgMatchResults" })
  async getKGMatchResults(
    @Args("jobId") jobId: string
  ): Promise<KGMatch[]> {
    return this.kgService["matches"]
      ? Array.from(this.kgService["matches"].values())
      : [];
  }

  // ─── Mutations ──────────────────────────────────────────────────────────

  @Mutation(() => KGEntity)
  async createKGEntity(
    @Args("input") input: CreateKGEntityInput
  ): Promise<KGEntity> {
    return this.kgService.createEntity({
      name: input.name,
      description: input.description,
      type: input.type as any,
      vertical: input.vertical as any,
      synonyms: input.synonyms,
      exampleColumns: input.exampleColumns,
    }) as any;
  }

  @Mutation(() => KGEntity)
  async updateKGEntity(
    @Args("id", { type: () => ID }) id: string,
    @Args("input") input: CreateKGEntityInput
  ): Promise<KGEntity> {
    return this.kgService.updateEntity(id, {
      name: input.name,
      description: input.description,
      type: input.type as any,
      vertical: input.vertical as any,
      synonyms: input.synonyms,
      exampleColumns: input.exampleColumns,
    }) as any;
  }

  @Mutation(() => Boolean)
  async deleteKGEntity(
    @Args("id", { type: () => ID }) id: string
  ): Promise<boolean> {
    return this.kgService.deleteEntity(id);
  }

  @Mutation(() => KGRelationship)
  async createKGRelationship(
    @Args("input") input: CreateKGRelationshipInput
  ): Promise<KGRelationship> {
    return this.kgService.createRelationship({
      fromEntityId: input.fromEntityId,
      toEntityId: input.toEntityId,
      relationshipType: input.relationshipType,
      description: input.relationshipType,
      cardinality: input.cardinality as any,
      typicalIn: input.typicalIn,
    }) as any;
  }

  @Mutation(() => String)
  async runDiscovery(
    @Args("connectionId") connectionId: string
  ): Promise<string> {
    const run = this.kgService.runDiscovery(connectionId);
    return JSON.stringify(run);
  }
}
