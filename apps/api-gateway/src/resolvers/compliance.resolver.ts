import { Resolver, Query, Mutation, Args, ID } from "@nestjs/graphql";
import {
  CompliancePack,
  DataResidencyRule,
  ConsentRecord,
  DSARRequest,
  CreateCompliancePackInput,
  UpdateDataResidencyInput,
  CreateConsentRecordInput,
  CreateDSARRequestInput,
} from "../schema";
import { ComplianceService } from "../services/compliance.service";
import { AuditTrailService } from "../services/audit-trail.service";

@Resolver()
export class ComplianceResolver {
  constructor(
    private readonly complianceService: ComplianceService,
    private readonly auditTrailService: AuditTrailService
  ) {}

  // ─── Queries ───────────────────────────────────────────────────────────

  @Query(() => [CompliancePack], { name: "compliancePacks" })
  async getCompliancePacks(): Promise<CompliancePack[]> {
    return this.complianceService.listPacks() as any;
  }

  @Query(() => CompliancePack, { name: "compliancePack" })
  async getCompliancePack(
    @Args("id", { type: () => ID }) id: string
  ): Promise<CompliancePack> {
    return this.complianceService.getPack(id) as any;
  }

  @Query(() => [DataResidencyRule], { name: "dataResidencyRules" })
  async getDataResidencyRules(
    @Args("connectionId", { nullable: true }) connectionId?: string
  ): Promise<DataResidencyRule[]> {
    if (connectionId) {
      return this.complianceService.listResidencyForConnection(connectionId) as any;
    }
    return this.complianceService.listResidencyRules() as any;
  }

  @Query(() => [ConsentRecord], { name: "consentRecords" })
  async getConsentRecords(
    @Args("userId", { nullable: true }) userId?: string
  ): Promise<ConsentRecord[]> {
    if (userId) {
      return this.complianceService.listConsentForUser(userId) as any;
    }
    return this.complianceService.listConsentRecords() as any;
  }

  @Query(() => [DSARRequest], { name: "dsarRequests" })
  async getDSARRequests(
    @Args("status", { nullable: true }) status?: string
  ): Promise<DSARRequest[]> {
    if (status) {
      return this.complianceService.listDSARRequestsByStatus(status) as any;
    }
    return this.complianceService.listDSARRequests() as any;
  }

  // ─── Mutations ─────────────────────────────────────────────────────────

  @Mutation(() => CompliancePack)
  async createCompliancePack(
    @Args("input") input: CreateCompliancePackInput
  ): Promise<CompliancePack> {
    const pack = this.complianceService.createPack({
      name: input.name,
      jurisdiction: input.jurisdiction,
      description: input.description,
    });
    this.auditTrailService.log({
      eventType: "compliance.pack.create",
      actorId: "system",
      actorEmail: "system@orbitiq.io",
      targetType: "compliance_pack",
      targetId: pack.id,
      action: "create",
      details: { name: pack.name, jurisdiction: pack.jurisdiction },
      ipAddress: "127.0.0.1",
      userAgent: "OrbitIQ/1.0",
      severity: "info",
      complianceRelevant: true,
    });
    return pack as any;
  }

  @Mutation(() => CompliancePack)
  async toggleCompliancePack(
    @Args("id", { type: () => ID }) id: string
  ): Promise<CompliancePack> {
    const pack = this.complianceService.togglePack(id);
    this.auditTrailService.log({
      eventType: "compliance.pack.toggle",
      actorId: "system",
      actorEmail: "system@orbitiq.io",
      targetType: "compliance_pack",
      targetId: pack.id,
      action: "toggle",
      details: { name: pack.name, isEnabled: pack.isEnabled },
      ipAddress: "127.0.0.1",
      userAgent: "OrbitIQ/1.0",
      severity: "warning",
      complianceRelevant: true,
    });
    return pack as any;
  }

  @Mutation(() => DataResidencyRule)
  async updateDataResidency(
    @Args("input") input: UpdateDataResidencyInput
  ): Promise<DataResidencyRule> {
    const existing = this.complianceService
      .listResidencyForConnection(input.connectionId)
      .shift();
    let rule;
    if (existing) {
      rule = this.complianceService.updateResidencyRule(existing.id, {
        allowedRegions: input.allowedRegions,
        defaultRegion: input.defaultRegion,
        enforcementLevel: input.enforcementLevel,
      });
    } else {
      rule = this.complianceService.createResidencyRule({
        connectionId: input.connectionId,
        allowedRegions: input.allowedRegions,
        defaultRegion: input.defaultRegion,
        enforcementLevel: input.enforcementLevel,
      });
    }
    this.auditTrailService.log({
      eventType: "compliance.residency.update",
      actorId: "system",
      actorEmail: "system@orbitiq.io",
      targetType: "data_residency",
      targetId: rule.id,
      action: "upsert",
      details: {
        connectionId: input.connectionId,
        allowedRegions: input.allowedRegions,
        enforcementLevel: input.enforcementLevel,
      },
      ipAddress: "127.0.0.1",
      userAgent: "OrbitIQ/1.0",
      severity: "info",
      complianceRelevant: true,
    });
    return rule as any;
  }

  @Mutation(() => ConsentRecord)
  async createConsentRecord(
    @Args("input") input: CreateConsentRecordInput
  ): Promise<ConsentRecord> {
    const record = this.complianceService.createConsentRecord({
      userId: input.userId,
      purpose: input.purpose,
      granted: input.granted,
      expiresAt: input.expiresAt,
    });
    this.auditTrailService.log({
      eventType: "compliance.consent.create",
      actorId: input.userId,
      actorEmail: `${input.userId}@orbitiq.io`,
      targetType: "consent",
      targetId: record.id,
      action: "create",
      details: { purpose: input.purpose, granted: input.granted },
      ipAddress: "127.0.0.1",
      userAgent: "OrbitIQ/1.0",
      severity: "info",
      complianceRelevant: true,
    });
    return record as any;
  }

  @Mutation(() => ConsentRecord)
  async revokeConsent(
    @Args("id", { type: () => ID }) id: string
  ): Promise<ConsentRecord> {
    const record = this.complianceService.revokeConsent(id);
    this.auditTrailService.log({
      eventType: "compliance.consent.revoke",
      actorId: record.userId,
      actorEmail: `${record.userId}@orbitiq.io`,
      targetType: "consent",
      targetId: record.id,
      action: "revoke",
      details: { purpose: record.purpose, userId: record.userId },
      ipAddress: "127.0.0.1",
      userAgent: "OrbitIQ/1.0",
      severity: "warning",
      complianceRelevant: true,
    });
    return record as any;
  }

  @Mutation(() => DSARRequest)
  async createDSARRequest(
    @Args("input") input: CreateDSARRequestInput
  ): Promise<DSARRequest> {
    const request = this.complianceService.createDSARRequest({
      userId: input.userId,
      type: input.type,
      requestedBy: input.userId,
    });
    this.auditTrailService.log({
      eventType: "dsar.request",
      actorId: input.userId,
      actorEmail: `${input.userId}@orbitiq.io`,
      targetType: "dsar",
      targetId: request.id,
      action: "create",
      details: { userId: input.userId, type: input.type },
      ipAddress: "127.0.0.1",
      userAgent: "OrbitIQ/1.0",
      severity: "info",
      complianceRelevant: true,
    });
    return request as any;
  }

  @Mutation(() => DSARRequest)
  async updateDSARStatus(
    @Args("id", { type: () => ID }) id: string,
    @Args("status") status: string
  ): Promise<DSARRequest> {
    const request = this.complianceService.updateDSARStatus(id, status);
    this.auditTrailService.log({
      eventType: "dsar.status_update",
      actorId: "system",
      actorEmail: "system@orbitiq.io",
      targetType: "dsar",
      targetId: request.id,
      action: "update_status",
      details: { userId: request.userId, type: request.type, newStatus: status },
      ipAddress: "127.0.0.1",
      userAgent: "OrbitIQ/1.0",
      severity: status === "denied" ? "warning" : "info",
      complianceRelevant: true,
    });
    return request as any;
  }
}
