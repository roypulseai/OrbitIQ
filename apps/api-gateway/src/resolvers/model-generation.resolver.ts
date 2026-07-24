import { Resolver, Query, Mutation, Args, ID, Int } from "@nestjs/graphql";
import {
  GeneratedModel,
  GeneratedDimension,
  GeneratedMeasure,
  ModelDiff,
  GenerationStats,
  UpdateGeneratedDimensionInput,
  UpdateGeneratedMeasureInput,
} from "../schema";
import { ModelGenerationService } from "../services/model-generation.service";

@Resolver()
export class ModelGenerationResolver {
  constructor(private readonly modelGenerationService: ModelGenerationService) {}

  @Query(() => [GeneratedModel], { name: "generatedModels" })
  async getGeneratedModels(
    @Args("connectionId", { nullable: true }) connectionId?: string
  ): Promise<GeneratedModel[]> {
    return this.modelGenerationService.listModels(connectionId) as any;
  }

  @Query(() => GeneratedModel, { name: "generatedModel" })
  async getGeneratedModel(
    @Args("id", { type: () => ID }) id: string
  ): Promise<GeneratedModel> {
    return this.modelGenerationService.getModel(id) as any;
  }

  @Query(() => [ModelDiff], { name: "modelDiff" })
  async getModelDiff(
    @Args("id", { type: () => ID }) id: string
  ): Promise<ModelDiff[]> {
    return this.modelGenerationService.getDiff(id);
  }

  @Query(() => GenerationStats, { name: "generationStats" })
  async getGenerationStats(
    @Args("connectionId", { nullable: true }) connectionId?: string
  ): Promise<GenerationStats> {
    return this.modelGenerationService.getGenerationStats(connectionId);
  }

  @Mutation(() => GeneratedModel)
  async generateModel(
    @Args("connectionId") connectionId: string,
    @Args("profilingJobId") profilingJobId: string
  ): Promise<GeneratedModel> {
    return this.modelGenerationService.generateModel(
      connectionId,
      profilingJobId
    ) as any;
  }

  @Mutation(() => GeneratedModel)
  async approveModel(
    @Args("id", { type: () => ID }) id: string
  ): Promise<GeneratedModel> {
    return this.modelGenerationService.approveModel(id) as any;
  }

  @Mutation(() => GeneratedModel)
  async publishModel(
    @Args("id", { type: () => ID }) id: string
  ): Promise<GeneratedModel> {
    return this.modelGenerationService.publishModel(id) as any;
  }

  @Mutation(() => GeneratedModel)
  async updateGeneratedDimension(
    @Args("id", { type: () => ID }) id: string,
    @Args("dimIndex", { type: () => Int }) dimIndex: number,
    @Args("updates") updates: UpdateGeneratedDimensionInput
  ): Promise<GeneratedModel> {
    return this.modelGenerationService.updateDimension(id, dimIndex, updates) as any;
  }

  @Mutation(() => GeneratedModel)
  async updateGeneratedMeasure(
    @Args("id", { type: () => ID }) id: string,
    @Args("measIndex", { type: () => Int }) measIndex: number,
    @Args("updates") updates: UpdateGeneratedMeasureInput
  ): Promise<GeneratedModel> {
    return this.modelGenerationService.updateMeasure(id, measIndex, updates) as any;
  }
}
