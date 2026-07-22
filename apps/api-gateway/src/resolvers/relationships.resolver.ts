import { Resolver, Query, Mutation, Args, ID } from "@nestjs/graphql";
import {
  Relationship,
  RelationshipSuggestion,
  DataPipeline,
  TransformStep,
  Cardinality,
  CreateRelationshipInput,
  UpdateRelationshipInput,
  CreateDataPipelineInput,
  UpdateDataPipelineInput,
  AddTransformStepInput,
  UpdateTransformStepInput,
} from "../schema";
import { RelationshipsService } from "../services/relationships.service";
import { DataPrepService } from "../services/data-prep.service";
import { AuditService } from "../services/audit.service";

@Resolver()
export class RelationshipsResolver {
  constructor(
    private readonly relationshipsService: RelationshipsService,
    private readonly dataPrepService: DataPrepService,
    private readonly auditService: AuditService
  ) {}

  // Relationship Queries
  @Query(() => [Relationship])
  async getRelationships(
    @Args("modelId") modelId: string
  ): Promise<Relationship[]> {
    return this.relationshipsService.findAllByModel(modelId);
  }

  @Query(() => Relationship)
  async getRelationship(
    @Args("id", { type: () => ID }) id: string
  ): Promise<Relationship> {
    return this.relationshipsService.findOne(id);
  }

  @Query(() => [RelationshipSuggestion])
  async suggestRelationships(
    @Args("modelId") modelId: string,
    @Args("tables") tables: string
  ): Promise<RelationshipSuggestion[]> {
    const parsedTables = JSON.parse(tables);
    return this.relationshipsService.suggestRelationships(modelId, parsedTables);
  }

  @Query(() => String)
  async buildJoinSQL(
    @Args("relationships") relationshipsJson: string,
    @Args("tables") tablesJson: string
  ): Promise<string> {
    const relationships = JSON.parse(relationshipsJson);
    const tables = JSON.parse(tablesJson);
    return this.relationshipsService.buildJoinSQL(relationships, tables);
  }

  // Relationship Mutations
  @Mutation(() => Relationship)
  async createRelationship(
    @Args("input") input: CreateRelationshipInput
  ): Promise<Relationship> {
    const relationship = await this.relationshipsService.create(input);
    await this.auditService.log({
      action: "relationship.create",
      target: relationship.id,
      metadata: { modelId: relationship.modelId, name: relationship.name },
    });
    return relationship;
  }

  @Mutation(() => Relationship)
  async updateRelationship(
    @Args("id", { type: () => ID }) id: string,
    @Args("input") input: UpdateRelationshipInput
  ): Promise<Relationship> {
    const relationship = await this.relationshipsService.update(id, input);
    await this.auditService.log({
      action: "relationship.update",
      target: id,
      metadata: { changes: input },
    });
    return relationship;
  }

  @Mutation(() => Boolean)
  async deleteRelationship(
    @Args("id", { type: () => ID }) id: string
  ): Promise<boolean> {
    const result = await this.relationshipsService.delete(id);
    await this.auditService.log({
      action: "relationship.delete",
      target: id,
      metadata: { success: result },
    });
    return result;
  }

  // Data Pipeline Queries
  @Query(() => [DataPipeline])
  async getDataPipelines(
    @Args("workspaceId") workspaceId: string
  ): Promise<DataPipeline[]> {
    return this.dataPrepService.findAllByWorkspace(workspaceId);
  }

  @Query(() => DataPipeline)
  async getDataPipeline(
    @Args("id", { type: () => ID }) id: string
  ): Promise<DataPipeline> {
    return this.dataPrepService.findOne(id);
  }

  @Query(() => [TransformStep])
  async getTransformSteps(
    @Args("pipelineId") pipelineId: string
  ): Promise<TransformStep[]> {
    return this.dataPrepService.getSteps(pipelineId);
  }

  @Query(() => String)
  async compilePipeline(
    @Args("pipelineId") pipelineId: string
  ): Promise<string> {
    return this.dataPrepService.compilePipeline(pipelineId);
  }

  @Query(() => String)
  async previewStep(
    @Args("stepId") stepId: string
  ): Promise<string> {
    const result = await this.dataPrepService.previewStep(stepId);
    return JSON.stringify(result);
  }

  // Data Pipeline Mutations
  @Mutation(() => DataPipeline)
  async createDataPipeline(
    @Args("input") input: CreateDataPipelineInput
  ): Promise<DataPipeline> {
    const pipeline = await this.dataPrepService.create(input);
    await this.auditService.log({
      action: "data_pipeline.create",
      target: pipeline.id,
      metadata: { name: pipeline.name, workspaceId: pipeline.workspaceId },
    });
    return pipeline;
  }

  @Mutation(() => DataPipeline)
  async updateDataPipeline(
    @Args("id", { type: () => ID }) id: string,
    @Args("input") input: UpdateDataPipelineInput
  ): Promise<DataPipeline> {
    const pipeline = await this.dataPrepService.update(id, input);
    await this.auditService.log({
      action: "data_pipeline.update",
      target: id,
      metadata: { changes: input },
    });
    return pipeline;
  }

  @Mutation(() => Boolean)
  async deleteDataPipeline(
    @Args("id", { type: () => ID }) id: string
  ): Promise<boolean> {
    const result = await this.dataPrepService.delete(id);
    await this.auditService.log({
      action: "data_pipeline.delete",
      target: id,
      metadata: { success: result },
    });
    return result;
  }

  // Transform Step Mutations
  @Mutation(() => TransformStep)
  async addTransformStep(
    @Args("input") input: AddTransformStepInput
  ): Promise<TransformStep> {
    const step = await this.dataPrepService.addStep(input);
    await this.auditService.log({
      action: "data_pipeline.step.add",
      target: input.pipelineId,
      metadata: { stepId: step.id, type: step.type },
    });
    return step;
  }

  @Mutation(() => TransformStep)
  async updateTransformStep(
    @Args("id", { type: () => ID }) id: string,
    @Args("input") input: UpdateTransformStepInput
  ): Promise<TransformStep> {
    const step = await this.dataPrepService.updateStep(id, input);
    await this.auditService.log({
      action: "data_pipeline.step.update",
      target: id,
      metadata: { changes: input },
    });
    return step;
  }

  @Mutation(() => Boolean)
  async removeTransformStep(
    @Args("id", { type: () => ID }) id: string
  ): Promise<boolean> {
    const result = await this.dataPrepService.removeStep(id);
    await this.auditService.log({
      action: "data_pipeline.step.remove",
      target: id,
      metadata: { success: result },
    });
    return result;
  }
}
