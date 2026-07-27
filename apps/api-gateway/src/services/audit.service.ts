import { Injectable } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { AuditLog } from "../schema";

interface AuditLogRecord {
  id: string;
  orgId: string;
  actorId: string;
  action: string;
  target: string;
  metadata: Record<string, unknown>;
  timestamp: Date;
}

interface AuditLogInput {
  orgId?: string;
  actorId?: string;
  action: string;
  target: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(input: AuditLogInput): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        orgId: input.orgId || "system",
        actorId: input.actorId || "system",
        action: input.action,
        target: input.target,
        metadata: JSON.stringify(input.metadata || {}),
      },
    });
  }

  async findAll(orgId: string, limit: number = 100): Promise<AuditLogRecord[]> {
    const logs = await this.prisma.auditLog.findMany({
      where: { orgId },
      orderBy: { timestamp: "desc" },
      take: limit,
    });
    return logs.map((l) => ({ ...l, metadata: JSON.parse(l.metadata || "{}") }));
  }

  async findByAction(action: string, limit: number = 100): Promise<AuditLogRecord[]> {
    const logs = await this.prisma.auditLog.findMany({
      where: { action },
      orderBy: { timestamp: "desc" },
      take: limit,
    });
    return logs.map((l) => ({ ...l, metadata: JSON.parse(l.metadata || "{}") }));
  }

  async findByTarget(target: string, limit: number = 100): Promise<AuditLogRecord[]> {
    const logs = await this.prisma.auditLog.findMany({
      where: { target },
      orderBy: { timestamp: "desc" },
      take: limit,
    });
    return logs.map((l) => ({ ...l, metadata: JSON.parse(l.metadata || "{}") }));
  }
}
