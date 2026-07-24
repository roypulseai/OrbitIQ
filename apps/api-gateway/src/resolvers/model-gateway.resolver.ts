import { Resolver, Query, Mutation, Args, ID } from "@nestjs/graphql";
import {
  AIProvider as AIProviderGQL,
  AIRequest as AIRequestGQL,
  ModelConfig as ModelConfigGQL,
  CostSummary as CostSummaryGQL,
  CreateAIProviderInput,
  UpdateAIProviderInput,
  SendAIPromptInput,
  UpdateModelConfigInput,
} from "../schema";
import { ModelGatewayService } from "../services/model-gateway.service";

@Resolver()
export class ModelGatewayResolver {
  constructor(private readonly gatewayService: ModelGatewayService) {}

  @Query(() => [AIProviderGQL], { name: "aiProviders" })
  async getProviders(): Promise<AIProviderGQL[]> {
    return this.gatewayService.getProviders() as any;
  }

  @Query(() => AIProviderGQL, { name: "aiProvider", nullable: true })
  async getProvider(
    @Args("id", { type: () => ID }) id: string
  ): Promise<AIProviderGQL | null> {
    return (this.gatewayService.getProvider(id) as any) || null;
  }

  @Query(() => [AIRequestGQL], { name: "aiRequestHistory" })
  async get_requestHistory(
    @Args("providerId", { nullable: true }) providerId?: string
  ): Promise<AIRequestGQL[]> {
    return this.gatewayService.getRequestHistory(providerId) as any;
  }

  @Query(() => AIRequestGQL, { name: "aiRequest", nullable: true })
  async getRequest(
    @Args("id", { type: () => ID }) id: string
  ): Promise<AIRequestGQL | null> {
    return (this.gatewayService.getRequest(id) as any) || null;
  }

  @Query(() => ModelConfigGQL, { name: "modelConfig" })
  async getConfig(): Promise<ModelConfigGQL> {
    return this.gatewayService.getConfig() as any;
  }

  @Query(() => CostSummaryGQL, { name: "costSummary" })
  async getCostSummary(
    @Args("providerId", { nullable: true }) providerId?: string
  ): Promise<CostSummaryGQL> {
    return this.gatewayService.getCostSummary(providerId) as any;
  }

  @Mutation(() => AIProviderGQL)
  async createAIProvider(
    @Args("input") input: CreateAIProviderInput
  ): Promise<AIProviderGQL> {
    return this.gatewayService.createProvider(input as any) as any;
  }

  @Mutation(() => AIProviderGQL, { nullable: true })
  async updateAIProvider(
    @Args("id", { type: () => ID }) id: string,
    @Args("input") input: UpdateAIProviderInput
  ): Promise<AIProviderGQL | null> {
    return (this.gatewayService.updateProvider(id, input as any) as any) || null;
  }

  @Mutation(() => Boolean)
  async deleteAIProvider(
    @Args("id", { type: () => ID }) id: string
  ): Promise<boolean> {
    return this.gatewayService.deleteProvider(id);
  }

  @Mutation(() => String)
  async testAIConnection(
    @Args("id", { type: () => ID }) id: string
  ): Promise<string> {
    const result = await this.gatewayService.testConnection(id);
    return JSON.stringify(result);
  }

  @Mutation(() => AIRequestGQL)
  async sendAIPrompt(
    @Args("input") input: SendAIPromptInput
  ): Promise<AIRequestGQL> {
    return this.gatewayService.sendPrompt(
      input.providerId,
      input.model,
      input.prompt,
      {
        systemPrompt: input.systemPrompt || undefined,
        maxTokens: input.maxTokens || undefined,
        temperature: input.temperature || undefined,
      }
    ) as any;
  }

  @Mutation(() => ModelConfigGQL)
  async updateModelConfig(
    @Args("input") input: UpdateModelConfigInput
  ): Promise<ModelConfigGQL> {
    return this.gatewayService.updateConfig(input as any) as any;
  }
}
