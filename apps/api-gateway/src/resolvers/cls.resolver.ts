import { Resolver, Query, Mutation, Args, ID, Float } from "@nestjs/graphql";
import {
  ColumnSecurityRule,
  PIITag,
  CreateColumnSecurityRuleInput,
  UpdateColumnSecurityRuleInput,
  UpdatePIITagInput,
} from "../schema";
import { CLSService } from "../services/cls.service";
import { AuditService } from "../services/audit.service";

@Resolver()
export class CLSResolver {
  constructor(
    private readonly clsService: CLSService,
    private readonly auditService: AuditService
  ) {}

  @Query(() => [ColumnSecurityRule])
  async columnSecurityRules(
    @Args("modelId") modelId: string,
    @Args({ name: "tableId", type: () => String, nullable: true }) tableId?: string
  ): Promise<ColumnSecurityRule[]> {
    if (tableId) {
      return this.clsService.listRulesForTable(modelId, tableId) as any;
    }
    return this.clsService.listRulesForModel(modelId) as any;
  }

  @Query(() => ColumnSecurityRule, { nullable: true })
  async columnSecurityRule(
    @Args("id", { type: () => ID }) id: string
  ): Promise<ColumnSecurityRule | null> {
    return this.clsService.getRule(id) as any;
  }

  @Query(() => [PIITag])
  async piitags(
    @Args("modelId") modelId: string
  ): Promise<PIITag[]> {
    return this.clsService.getPIITags(modelId) as any;
  }

  @Mutation(() => ColumnSecurityRule)
  async createColumnSecurityRule(
    @Args("input") input: CreateColumnSecurityRuleInput
  ): Promise<ColumnSecurityRule> {
    const rule = await this.clsService.createRule({
      modelId: input.modelId,
      tableId: input.tableId,
      columnName: input.columnName,
      maskType: input.maskType as any,
      maskConfig: input.maskConfig,
      appliesToRoles: input.appliesToRoles,
    });
    await this.auditService.log({
      action: "cls.rule.create",
      target: `${input.tableId}.${input.columnName}`,
      metadata: { maskType: input.maskType },
    });
    return rule as any;
  }

  @Mutation(() => ColumnSecurityRule)
  async updateColumnSecurityRule(
    @Args("id", { type: () => ID }) id: string,
    @Args("input") input: UpdateColumnSecurityRuleInput
  ): Promise<ColumnSecurityRule> {
    const rule = await this.clsService.updateRule(id, input as any);
    await this.auditService.log({
      action: "cls.rule.update",
      target: id,
      metadata: { changes: input },
    });
    return rule as any;
  }

  @Mutation(() => Boolean)
  async deleteColumnSecurityRule(
    @Args("id", { type: () => ID }) id: string
  ): Promise<boolean> {
    await this.clsService.deleteRule(id);
    await this.auditService.log({
      action: "cls.rule.delete",
      target: id,
      metadata: {},
    });
    return true;
  }

  @Mutation(() => ColumnSecurityRule)
  async toggleColumnSecurityRule(
    @Args("id", { type: () => ID }) id: string
  ): Promise<ColumnSecurityRule> {
    const rule = await this.clsService.toggleRule(id);
    await this.auditService.log({
      action: "cls.rule.toggle",
      target: id,
      metadata: { isEnabled: rule.isEnabled },
    });
    return rule as any;
  }
}
