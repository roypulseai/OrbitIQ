import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { createHash } from "crypto";

type PermissionLevel = "view" | "edit" | "admin";

interface DashboardShareRecord {
  id: string;
  dashboardId: string;
  userId: string;
  workspaceId: string;
  permissionLevel: PermissionLevel;
  sharedBy: string;
  createdAt: Date;
}

interface PublicLinkRecord {
  id: string;
  dashboardId: string;
  token: string;
  expiresAt: Date | null;
  passwordHash: string | null;
  createdAt: Date;
  createdBy: string;
  isActive: boolean;
}

interface ShareInput {
  dashboardId: string;
  userId: string;
  workspaceId: string;
  permissionLevel: PermissionLevel;
  sharedBy: string;
}

interface PublicLinkInput {
  dashboardId: string;
  createdBy: string;
  expiresInHours?: number;
  password?: string;
}

@Injectable()
export class SharingService {
  private shares: Map<string, DashboardShareRecord> = new Map();
  private publicLinks: Map<string, PublicLinkRecord> = new Map();

  async shareDashboard(input: ShareInput): Promise<DashboardShareRecord> {
    if (!["view", "edit", "admin"].includes(input.permissionLevel)) {
      throw new BadRequestException(
        `Invalid permission level: ${input.permissionLevel}`
      );
    }
    const share: DashboardShareRecord = {
      id: crypto.randomUUID(),
      dashboardId: input.dashboardId,
      userId: input.userId,
      workspaceId: input.workspaceId,
      permissionLevel: input.permissionLevel,
      sharedBy: input.sharedBy,
      createdAt: new Date(),
    };
    this.shares.set(share.id, share);
    return share;
  }

  async getDashboardShares(
    dashboardId: string
  ): Promise<DashboardShareRecord[]> {
    return Array.from(this.shares.values()).filter(
      (s) => s.dashboardId === dashboardId
    );
  }

  async removeShare(shareId: string): Promise<boolean> {
    if (!this.shares.has(shareId)) {
      throw new NotFoundException(`Share ${shareId} not found`);
    }
    this.shares.delete(shareId);
    return true;
  }

  async updateShare(
    shareId: string,
    permissionLevel: PermissionLevel
  ): Promise<DashboardShareRecord> {
    const share = this.shares.get(shareId);
    if (!share) {
      throw new NotFoundException(`Share ${shareId} not found`);
    }
    if (!["view", "edit", "admin"].includes(permissionLevel)) {
      throw new BadRequestException(
        `Invalid permission level: ${permissionLevel}`
      );
    }
    const updated: DashboardShareRecord = {
      ...share,
      permissionLevel,
    };
    this.shares.set(shareId, updated);
    return updated;
  }

  async getSharedDashboards(
    userId: string,
    workspaceId: string
  ): Promise<DashboardShareRecord[]> {
    return Array.from(this.shares.values()).filter(
      (s) => s.userId === userId && s.workspaceId === workspaceId
    );
  }

  async getPublicLinks(
    dashboardId: string
  ): Promise<PublicLinkRecord[]> {
    return Array.from(this.publicLinks.values()).filter(
      (l) => l.dashboardId === dashboardId
    );
  }

  async createPublicLink(
    input: PublicLinkInput
  ): Promise<PublicLinkRecord> {
    const now = new Date();
    const link: PublicLinkRecord = {
      id: crypto.randomUUID(),
      dashboardId: input.dashboardId,
      token: crypto.randomUUID(),
      expiresAt: input.expiresInHours
        ? new Date(now.getTime() + input.expiresInHours * 60 * 60 * 1000)
        : null,
      passwordHash: input.password
        ? createHash("sha256").update(input.password).digest("hex")
        : null,
      createdAt: now,
      createdBy: input.createdBy,
      isActive: true,
    };
    this.publicLinks.set(link.id, link);
    return link;
  }

  async revokePublicLink(linkId: string): Promise<boolean> {
    const link = this.publicLinks.get(linkId);
    if (!link) {
      throw new NotFoundException(`Public link ${linkId} not found`);
    }
    link.isActive = false;
    this.publicLinks.set(linkId, link);
    return true;
  }

  async checkAccess(
    dashboardId: string,
    userId: string
  ): Promise<{ hasAccess: boolean; permissionLevel: PermissionLevel | null }> {
    const share = Array.from(this.shares.values()).find(
      (s) => s.dashboardId === dashboardId && s.userId === userId
    );
    if (!share) {
      return { hasAccess: false, permissionLevel: null };
    }
    return { hasAccess: true, permissionLevel: share.permissionLevel };
  }
}
