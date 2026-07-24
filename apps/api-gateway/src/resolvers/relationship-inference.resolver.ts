import { Resolver, Query, Mutation, Args, ID } from "@nestjs/graphql";
import {
  InferredRelationship,
  InferenceJob,
  InferenceStats,
  StartInferenceInput,
} from "../schema";
import { RelationshipInferenceService } from "../services/relationship-inference.service";

@Resolver()
export class RelationshipInferenceResolver {
  constructor(private readonly inferenceService: RelationshipInferenceService) {}

  // ─── Queries ────────────────────────────────────────────────────────────

  @Query(() => [InferenceJob], { name: "inferenceJobs" })
  async getInferenceJobs(
    @Args("connectionId") connectionId: string
  ): Promise<InferenceJob[]> {
    return this.inferenceService.listJobs(connectionId) as any;
  }

  @Query(() => InferenceJob, { name: "inferenceJob" })
  async getInferenceJob(
    @Args("id", { type: () => ID }) id: string
  ): Promise<InferenceJob> {
    return this.inferenceService.getJob(id) as any;
  }

  @Query(() => [InferredRelationship], { name: "inferredRelationships" })
  async getInferredRelationships(
    @Args("jobId") jobId: string
  ): Promise<InferredRelationship[]> {
    return this.inferenceService.getRelationships(jobId) as any;
  }

  @Query(() => InferenceStats, { name: "inferenceStats" })
  async getInferenceStats(
    @Args("connectionId") connectionId: string
  ): Promise<InferenceStats> {
    return this.inferenceService.getInferenceStats(connectionId) as any;
  }

  // ─── Mutations ──────────────────────────────────────────────────────────

  @Mutation(() => InferenceJob)
  async startInference(
    @Args("input") input: StartInferenceInput
  ): Promise<InferenceJob> {
    return this.inferenceService.startInference(
      input.connectionId,
      input.tableNames
    ) as any;
  }

  @Mutation(() => InferredRelationship)
  async approveRelationship(
    @Args("id", { type: () => ID }) id: string
  ): Promise<InferredRelationship> {
    return this.inferenceService.approveRelationship(id) as any;
  }

  @Mutation(() => InferredRelationship)
  async rejectRelationship(
    @Args("id", { type: () => ID }) id: string
  ): Promise<InferredRelationship> {
    return this.inferenceService.rejectRelationship(id) as any;
  }

  @Mutation(() => InferredRelationship)
  async updateInferredRelationship(
    @Args("id", { type: () => ID }) id: string,
    @Args("status", { nullable: true }) status?: string,
    @Args("cardinality", { nullable: true }) cardinality?: string,
    @Args("confidence", { nullable: true }) confidence?: number
  ): Promise<InferredRelationship> {
    return this.inferenceService.updateRelationship(id, {
      status: status as any,
      cardinality: cardinality as any,
      confidence,
    }) as any;
  }
}
