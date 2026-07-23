import { Resolver, Query, Mutation, Args, ID } from "@nestjs/graphql";
import {
  RLSPolicy,
  UserAttributes,
  CreateRLSPolicyInput,
  UpdateRLSPolicyInput,
  SetUserAttributesInput,
} from "../schema";
import { RLSService } from "../services/rls.service";
import { UserAttributesService } from "../services/user-attributes.service";

@Resolver()
export class RLSResolver {
  constructor(
    private readonly rlsService: RLSService,
    private readonly userAttrsService: UserAttributesService
  ) {}

  // ─── RLS Policy Queries ─────────────────────────────────────────────────

  @Query(() => [RLSPolicy], { name: "rlsPolicies" })
  async getRLSPolicies(
    @Args("modelId", { nullable: true }) modelId?: string
  ): Promise<RLSPolicy[]> {
    if (modelId) {
      return this.rlsService.listPoliciesForModel(modelId) as any;
    }
    return this.rlsService.listPolicies() as any;
  }

  @Query(() => RLSPolicy, { name: "rlsPolicy" })
  async getRLSPolicy(
    @Args("id", { type: () => ID }) id: string
  ): Promise<RLSPolicy> {
    return this.rlsService.getPolicy(id) as any;
  }

  @Query(() => [RLSPolicy], { name: "effectivePolicies" })
  async getEffectivePolicies(
    @Args("userId") userId: string,
    @Args("tableId") tableId: string,
    @Args("modelId") modelId: string
  ): Promise<RLSPolicy[]> {
    return this.rlsService.getEffectivePolicies(userId, tableId, modelId) as any;
  }

  // ─── RLS Policy Mutations ──────────────────────────────────────────────

  @Mutation(() => RLSPolicy)
  async createRLSPolicy(
    @Args("input") input: CreateRLSPolicyInput
  ): Promise<RLSPolicy> {
    return this.rlsService.createPolicy({
      modelId: input.modelId,
      tableId: input.tableId,
      oqlExpression: input.oqlExpression,
      appliesToRoles: input.appliesToRoles,
      priority: input.priority,
      description: input.description,
    }) as any;
  }

  @Mutation(() => RLSPolicy)
  async updateRLSPolicy(
    @Args("id", { type: () => ID }) id: string,
    @Args("input") input: UpdateRLSPolicyInput
  ): Promise<RLSPolicy> {
    return this.rlsService.updatePolicy(id, {
      oqlExpression: input.oqlExpression,
      appliesToRoles: input.appliesToRoles,
      isEnabled: input.isEnabled,
      priority: input.priority,
      description: input.description,
    }) as any;
  }

  @Mutation(() => Boolean)
  async deleteRLSPolicy(
    @Args("id", { type: () => ID }) id: string
  ): Promise<boolean> {
    return this.rlsService.deletePolicy(id);
  }

  @Mutation(() => RLSPolicy)
  async toggleRLSPolicy(
    @Args("id", { type: () => ID }) id: string
  ): Promise<RLSPolicy> {
    const policy = this.rlsService.getPolicy(id);
    return this.rlsService.updatePolicy(id, { isEnabled: !policy.isEnabled }) as any;
  }

  // ─── User Attribute Queries ─────────────────────────────────────────────

  @Query(() => UserAttributes, { name: "userAttributes", nullable: true })
  async getUserAttributes(
    @Args("userId") userId: string
  ): Promise<UserAttributes | null> {
    const record = this.userAttrsService.getUserAttributes(userId);
    if (!record) return null;
    return record as any;
  }

  @Query(() => [String], { name: "attributeKeys" })
  async getAttributeKeys(): Promise<string[]> {
    return this.userAttrsService.getAttributeKeys();
  }

  // ─── User Attribute Mutations ───────────────────────────────────────────

  @Mutation(() => UserAttributes)
  async setUserAttributes(
    @Args("input") input: SetUserAttributesInput
  ): Promise<UserAttributes> {
    return this.userAttrsService.bulkSetAttributes(
      input.userId,
      input.attributes
    ) as any;
  }
}
