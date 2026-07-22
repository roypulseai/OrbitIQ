import { Injectable } from "@nestjs/common";
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
  private logs: AuditLogRecord[] = [];

  async log(input: AuditLogInput): Promise<void> {
    const log: AuditLogRecord = {
      id: crypto.randomUUID(),
      orgId: input.orgId || "system",
      actorId: input.actorId || "system",
      action: input.action,
      target: input.target,
      metadata: input.metadata || {},
      timestamp: new Date(),
    };
    this.logs.push(log);
  }

  async findAll(orgId: string, limit: number = 100): Promise<AuditLogRecord[]> {
    return this.logs
      .filter((l) => l.orgId === orgId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async findByAction(action: string, limit: number = 100): Promise<AuditLogRecord[]> {
    return this.logs
      .filter((l) => l.action === action)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async findByTarget(target: string, limit: number = 100): Promise<AuditLogRecord[]> {
    return this.logs
      .filter((l) => l.target === target)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }
}
