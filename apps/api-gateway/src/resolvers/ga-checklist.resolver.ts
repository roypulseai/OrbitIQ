import { Resolver, Query, Mutation, Args, ID } from "@nestjs/graphql";
import {
  GAReport,
  CompliancePackGQL,
  ConnectorCatalogEntry,
  EmbeddingSDKConfig,
  SecurityAuditResult,
  CreateEmbeddingConfigInput,
} from "../schema";
import { GAChecklistService } from "../services/ga-checklist.service";

@Resolver()
export class GAChecklistResolver {
  constructor(private readonly gaChecklistService: GAChecklistService) {}

  @Query(() => GAReport, { name: "gaReport" })
  async getGAReport(): Promise<GAReport> {
    return this.gaChecklistService.generateGAReport() as any;
  }

  @Query(() => [CompliancePackGQL], { name: "compliancePacks" })
  async getCompliancePacks(): Promise<CompliancePackGQL[]> {
    return this.gaChecklistService.getCompliancePacks() as any;
  }

  @Query(() => CompliancePackGQL, { name: "compliancePack", nullable: true })
  async getCompliancePack(
    @Args("id", { type: () => ID }) id: string
  ): Promise<CompliancePackGQL | undefined> {
    return this.gaChecklistService.getCompliancePack(id) as any;
  }

  @Query(() => [ConnectorCatalogEntry], { name: "connectorCatalog" })
  async getConnectorCatalog(): Promise<ConnectorCatalogEntry[]> {
    return this.gaChecklistService.getConnectorCatalog() as any;
  }

  @Query(() => [EmbeddingSDKConfig], { name: "embeddingSDKConfigs" })
  async getEmbeddingSDKConfigs(): Promise<EmbeddingSDKConfig[]> {
    return this.gaChecklistService.getEmbeddingSDKConfigs() as any;
  }

  @Query(() => [SecurityAuditResult], { name: "securityAudit" })
  async getSecurityAudit(): Promise<SecurityAuditResult[]> {
    return this.gaChecklistService.runSecurityAudit() as any;
  }

  @Mutation(() => EmbeddingSDKConfig)
  async createEmbeddingConfig(
    @Args("config") config: CreateEmbeddingConfigInput
  ): Promise<EmbeddingSDKConfig> {
    return this.gaChecklistService.createEmbeddingConfig({
      name: config.name,
      domain: config.domain,
      rlsEnabled: config.rlsEnabled,
      tokenSigning: config.tokenSigning,
      maxConcurrentSessions: config.maxConcurrentSessions,
      customTheme: config.customTheme,
    }) as any;
  }

  @Mutation(() => [SecurityAuditResult])
  async runSecurityAudit(): Promise<SecurityAuditResult[]> {
    return this.gaChecklistService.runSecurityAudit() as any;
  }
}
