import { Resolver, Query, Mutation, Args, ID } from "@nestjs/graphql";
import {
  DashboardShare,
  PublicLink,
  ShareDashboardInput,
  CreatePublicLinkInput,
  UpdateShareInput,
} from "../schema";
import { SharingService } from "../services/sharing.service";
import { AuditService } from "../services/audit.service";

@Resolver()
export class SharingResolver {
  constructor(
    private readonly sharingService: SharingService,
    private readonly auditService: AuditService
  ) {}

  @Query(() => [DashboardShare])
  async getDashboardShares(
    @Args("dashboardId") dashboardId: string
  ): Promise<DashboardShare[]> {
    return this.sharingService.getDashboardShares(dashboardId) as any;
  }

  @Query(() => [DashboardShare])
  async getSharedDashboards(
    @Args("userId") userId: string,
    @Args("workspaceId") workspaceId: string
  ): Promise<DashboardShare[]> {
    return this.sharingService.getSharedDashboards(userId, workspaceId) as any;
  }

  @Query(() => [PublicLink])
  async getPublicLinks(
    @Args("dashboardId") dashboardId: string
  ): Promise<PublicLink[]> {
    return this.sharingService.getPublicLinks(dashboardId) as any;
  }

  @Mutation(() => DashboardShare)
  async shareDashboard(
    @Args("input") input: ShareDashboardInput
  ): Promise<DashboardShare> {
    const share = await this.sharingService.shareDashboard({
      dashboardId: input.dashboardId,
      userId: input.userId,
      workspaceId: (input as any).workspaceId ?? "",
      permissionLevel: input.permissionLevel as any,
      sharedBy: (input as any).sharedBy ?? "",
    });
    await this.auditService.log({
      action: "dashboard.share",
      target: input.dashboardId,
      metadata: { userId: input.userId, permissionLevel: input.permissionLevel },
    });
    return share as any;
  }

  @Mutation(() => Boolean)
  async removeShare(
    @Args("id", { type: () => ID }) id: string
  ): Promise<boolean> {
    await this.sharingService.removeShare(id);
    await this.auditService.log({
      action: "dashboard.unshare",
      target: id,
      metadata: {},
    });
    return true;
  }

  @Mutation(() => DashboardShare)
  async updateShare(
    @Args("id", { type: () => ID }) id: string,
    @Args("input") input: UpdateShareInput
  ): Promise<DashboardShare> {
    const share = await this.sharingService.updateShare(id, input.permissionLevel as any);
    await this.auditService.log({
      action: "dashboard.share.update",
      target: id,
      metadata: { permissionLevel: input.permissionLevel },
    });
    return share as any;
  }

  @Mutation(() => PublicLink)
  async createPublicLink(
    @Args("input") input: CreatePublicLinkInput
  ): Promise<PublicLink> {
    const link = await this.sharingService.createPublicLink({
      dashboardId: input.dashboardId,
      expiresInHours: input.expiresInHours,
      password: input.password,
      createdBy: "",
    });
    await this.auditService.log({
      action: "dashboard.public_link.create",
      target: input.dashboardId,
      metadata: { linkId: link.id },
    });
    return link as any;
  }

  @Mutation(() => Boolean)
  async revokePublicLink(
    @Args("id", { type: () => ID }) id: string
  ): Promise<boolean> {
    await this.sharingService.revokePublicLink(id);
    await this.auditService.log({
      action: "dashboard.public_link.revoke",
      target: id,
      metadata: {},
    });
    return true;
  }
}
