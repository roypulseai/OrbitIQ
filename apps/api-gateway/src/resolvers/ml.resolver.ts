import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  Int,
  Float,
} from "@nestjs/graphql";
import {
  MLExperiment as MLExperimentGQL,
  MLModel as MLModelGQL,
  FeatureImportanceGQL,
  ClusteringResult as ClusteringResultGQL,
  ModelRegistryEntry,
  CreateMLExperimentInput,
  RunClusteringInput,
  RegisterModelInput,
} from "../schema";
import { MLService } from "../services/ml.service";

@Resolver()
export class MLResolver {
  constructor(private readonly mlService: MLService) {}

  @Query(() => [MLExperimentGQL], { name: "mlExperiments" })
  async getMLExperiments(): Promise<MLExperimentGQL[]> {
    return this.mlService.listExperiments() as any;
  }

  @Query(() => MLExperimentGQL, { name: "mlExperiment", nullable: true })
  async getMLExperiment(
    @Args("id", { type: () => ID }) id: string,
  ): Promise<MLExperimentGQL | null> {
    return (this.mlService.getExperiment(id) as any) || null;
  }

  @Query(() => MLModelGQL, { name: "mlModel", nullable: true })
  async getMLModel(
    @Args("id", { type: () => ID }) id: string,
  ): Promise<MLModelGQL | null> {
    return (this.mlService.getModel(id) as any) || null;
  }

  @Query(() => [ClusteringResultGQL], { name: "clusteringResults" })
  async getClusteringResults(): Promise<ClusteringResultGQL[]> {
    return this.mlService.listClusteringResults() as any;
  }

  @Query(() => ClusteringResultGQL, {
    name: "clusteringResult",
    nullable: true,
  })
  async getClusteringResult(
    @Args("id", { type: () => ID }) id: string,
  ): Promise<ClusteringResultGQL | null> {
    return (this.mlService.getClusteringResult(id) as any) || null;
  }

  @Query(() => [ModelRegistryEntry], { name: "modelRegistry" })
  async getModelRegistry(): Promise<ModelRegistryEntry[]> {
    return this.mlService.getModelRegistry() as any;
  }

  @Query(() => [FeatureImportanceGQL], { name: "featureImportance" })
  async getFeatureImportance(
    @Args("modelId") modelId: string,
  ): Promise<FeatureImportanceGQL[]> {
    return this.mlService.getFeatureImportance(modelId) as any;
  }

  @Mutation(() => MLExperimentGQL)
  async createMLExperiment(
    @Args("config") config: CreateMLExperimentInput,
  ): Promise<MLExperimentGQL> {
    return this.mlService.createExperiment(config as any) as any;
  }

  @Mutation(() => ClusteringResultGQL)
  async runClustering(
    @Args("config") config: RunClusteringInput,
  ): Promise<ClusteringResultGQL> {
    return this.mlService.runClustering(config as any) as any;
  }

  @Mutation(() => ModelRegistryEntry)
  async registerModel(
    @Args("config") config: RegisterModelInput,
  ): Promise<ModelRegistryEntry> {
    return this.mlService.registerModel(config as any) as any;
  }

  @Mutation(() => ModelRegistryEntry, { nullable: true })
  async promoteModel(
    @Args("id", { type: () => ID }) id: string,
    @Args("stage") stage: string,
  ): Promise<ModelRegistryEntry | null> {
    return this.mlService.promoteModel(id, stage) as any;
  }

  @Mutation(() => ModelRegistryEntry, { nullable: true })
  async archiveModel(
    @Args("id", { type: () => ID }) id: string,
  ): Promise<ModelRegistryEntry | null> {
    return this.mlService.archiveModel(id) as any;
  }
}
