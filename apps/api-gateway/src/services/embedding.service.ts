import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from "@nestjs/common";
import { createHmac, createHash } from "crypto";

const EMBED_SECRET = "orbitiq-dev-embed-secret-key";

interface EmbedConfigRecord {
  id: string;
  dashboardId: string;
  workspaceId: string;
  allowedDomains: string[];
  theme: "light" | "dark" | "auto";
  showHeader: boolean;
  showFilters: boolean;
  showSidebar: boolean;
  fontSize: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface EmbedTokenPayload {
  dashboardId: string;
  userId: string;
  workspaceId: string;
  filters: Record<string, unknown>;
  theme: string;
  iat: number;
  exp: number;
}

interface CreateEmbedTokenInput {
  dashboardId: string;
  userId: string;
  workspaceId: string;
  expiresInSeconds?: number;
  filters?: Record<string, unknown>;
  theme?: string;
}

interface UpdateEmbedConfigInput {
  allowedDomains?: string[];
  theme?: "light" | "dark" | "auto";
  showHeader?: boolean;
  showFilters?: boolean;
  showSidebar?: boolean;
  fontSize?: string;
}

@Injectable()
export class EmbeddingService {
  private embedConfigs: Map<string, EmbedConfigRecord> = new Map();
  private tokens: Map<string, EmbedTokenPayload> = new Map();

  async createEmbedToken(input: CreateEmbedTokenInput): Promise<{
    token: string;
    expiresAt: Date;
  }> {
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = input.expiresInSeconds ?? 3600;
    const payload: EmbedTokenPayload = {
      dashboardId: input.dashboardId,
      userId: input.userId,
      workspaceId: input.workspaceId,
      filters: input.filters ?? {},
      theme: input.theme ?? "auto",
      iat: now,
      exp: now + expiresIn,
    };

    const payloadJson = JSON.stringify(payload);
    const signature = createHmac("sha256", EMBED_SECRET)
      .update(payloadJson)
      .digest("hex");
    const token = Buffer.from(payloadJson).toString("base64") + "." + signature;

    this.tokens.set(token, payload);

    return {
      token,
      expiresAt: new Date(payload.exp * 1000),
    };
  }

  async validateEmbedToken(
    token: string
  ): Promise<EmbedTokenPayload & { valid: boolean }> {
    const stored = this.tokens.get(token);
    if (!stored) {
      try {
        const [payloadB64, signature] = token.split(".");
        if (!payloadB64 || !signature) {
          throw new Error("malformed");
        }
        const payloadJson = Buffer.from(payloadB64, "base64").toString(
          "utf-8"
        );
        const expectedSig = createHmac("sha256", EMBED_SECRET)
          .update(payloadJson)
          .digest("hex");

        if (signature !== expectedSig) {
          throw new UnauthorizedException("Invalid token signature");
        }

        const payload: EmbedTokenPayload = JSON.parse(payloadJson);
        if (Math.floor(Date.now() / 1000) > payload.exp) {
          throw new UnauthorizedException("Token expired");
        }

        return { ...payload, valid: true };
      } catch (err) {
        if (err instanceof UnauthorizedException) throw err;
        throw new BadRequestException("Invalid token format");
      }
    }

    if (Math.floor(Date.now() / 1000) > stored.exp) {
      this.tokens.delete(token);
      throw new UnauthorizedException("Token expired");
    }

    return { ...stored, valid: true };
  }

  async getEmbedConfig(
    dashboardId: string
  ): Promise<EmbedConfigRecord | null> {
    return (
      Array.from(this.embedConfigs.values()).find(
        (c) => c.dashboardId === dashboardId && c.isActive
      ) ?? null
    );
  }

  async updateEmbedConfig(
    dashboardId: string,
    config: UpdateEmbedConfigInput
  ): Promise<EmbedConfigRecord> {
    const existing = Array.from(this.embedConfigs.values()).find(
      (c) => c.dashboardId === dashboardId && c.isActive
    );

    if (!existing) {
      throw new NotFoundException(
        `Embed config for dashboard ${dashboardId} not found`
      );
    }

    const updated: EmbedConfigRecord = {
      ...existing,
      ...config,
      updatedAt: new Date(),
    };
    this.embedConfigs.set(existing.id, updated);
    return updated;
  }

  async getActiveEmbeds(
    workspaceId: string
  ): Promise<EmbedConfigRecord[]> {
    return Array.from(this.embedConfigs.values()).filter(
      (c) => c.workspaceId === workspaceId && c.isActive
    );
  }

  async createEmbedConfig(input: {
    dashboardId: string;
    workspaceId: string;
    allowedDomains?: string[];
    theme?: "light" | "dark" | "auto";
    showHeader?: boolean;
    showFilters?: boolean;
    showSidebar?: boolean;
    fontSize?: string;
  }): Promise<EmbedConfigRecord> {
    const now = new Date();
    const config: EmbedConfigRecord = {
      id: crypto.randomUUID(),
      dashboardId: input.dashboardId,
      workspaceId: input.workspaceId,
      allowedDomains: input.allowedDomains ?? [],
      theme: input.theme ?? "auto",
      showHeader: input.showHeader ?? true,
      showFilters: input.showFilters ?? true,
      showSidebar: input.showSidebar ?? false,
      fontSize: input.fontSize ?? "14px",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    this.embedConfigs.set(config.id, config);
    return config;
  }
}
