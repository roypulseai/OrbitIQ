import { Resolver, Query, Mutation, Args } from "@nestjs/graphql";
import {
  EmbedConfig,
  EmbedToken,
  CreateEmbedTokenInput,
  UpdateEmbedConfigInput,
} from "../schema";
import { EmbeddingService } from "../services/embedding.service";
import { AuditService } from "../services/audit.service";

@Resolver()
export class EmbeddingResolver {
  constructor(
    private readonly embeddingService: EmbeddingService,
    private readonly auditService: AuditService
  ) {}

  @Query(() => EmbedConfig)
  async getEmbedConfig(
    @Args("dashboardId") dashboardId: string
  ): Promise<EmbedConfig> {
    return this.embeddingService.getEmbedConfig(dashboardId) as any;
  }

  @Query(() => [EmbedConfig])
  async getActiveEmbeds(
    @Args("workspaceId") workspaceId: string
  ): Promise<EmbedConfig[]> {
    return this.embeddingService.getActiveEmbeds(workspaceId) as any;
  }

  @Mutation(() => EmbedToken)
  async createEmbedToken(
    @Args("input") input: CreateEmbedTokenInput
  ): Promise<EmbedToken> {
    const result = await this.embeddingService.createEmbedToken({
      dashboardId: input.dashboardId,
      userId: input.userId,
      workspaceId: (input as any).workspaceId ?? "",
      filters: (input as any).filters ?? {},
      theme: (input as any).theme ?? "auto",
      expiresInSeconds: (input as any).expiresInSeconds ?? 3600,
    });
    await this.auditService.log({
      action: "embed.token.create",
      target: input.dashboardId,
      metadata: { expiresInSeconds: (input as any).expiresInSeconds },
    });
    return { token: result.token, expiresAt: result.expiresAt.toISOString() } as any;
  }

  @Mutation(() => EmbedConfig)
  async createOrUpdateEmbedConfig(
    @Args("dashboardId") dashboardId: string,
    @Args("workspaceId") workspaceId: string,
    @Args("input") input: UpdateEmbedConfigInput
  ): Promise<EmbedConfig> {
    const config = await this.embeddingService.createEmbedConfig({
      dashboardId,
      workspaceId,
      allowedDomains: (input as any).allowedDomains,
      theme: (input as any).theme,
      showHeader: (input as any).showHeader,
      showFilters: (input as any).showFilters,
      showSidebar: (input as any).showSidebar,
      fontSize: (input as any).fontSize,
    });
    await this.auditService.log({
      action: "embed.config.update",
      target: dashboardId,
      metadata: { changes: input },
    });
    return config as any;
  }
}
