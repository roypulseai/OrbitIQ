import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";

interface RefreshScheduleRecord {
  id: string;
  dashboardId: string;
  workspaceId: string;
  cronExpression: string;
  enabled: boolean;
  lastRunAt: Date | null;
  nextRunAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateScheduleInput {
  dashboardId: string;
  workspaceId: string;
  cronExpression: string;
  enabled?: boolean;
}

interface UpdateScheduleInput {
  cronExpression?: string;
  enabled?: boolean;
}

@Injectable()
export class ScheduledRefreshService {
  private schedules: Map<string, RefreshScheduleRecord> = new Map();

  async createSchedule(
    input: CreateScheduleInput
  ): Promise<RefreshScheduleRecord> {
    if (!input.cronExpression || input.cronExpression.trim().length === 0) {
      throw new BadRequestException("cronExpression is required");
    }
    const now = new Date();
    const schedule: RefreshScheduleRecord = {
      id: crypto.randomUUID(),
      dashboardId: input.dashboardId,
      workspaceId: input.workspaceId,
      cronExpression: input.cronExpression,
      enabled: input.enabled ?? true,
      lastRunAt: null,
      nextRunAt: this.computeNextRun(input.cronExpression, now),
      createdAt: now,
      updatedAt: now,
    };
    this.schedules.set(schedule.id, schedule);
    return schedule;
  }

  async updateSchedule(
    id: string,
    input: UpdateScheduleInput
  ): Promise<RefreshScheduleRecord> {
    const schedule = this.schedules.get(id);
    if (!schedule) {
      throw new NotFoundException(`Schedule ${id} not found`);
    }
    const updated: RefreshScheduleRecord = {
      ...schedule,
      ...input,
      nextRunAt:
        input.cronExpression !== undefined
          ? this.computeNextRun(input.cronExpression, new Date())
          : schedule.nextRunAt,
      updatedAt: new Date(),
    };
    this.schedules.set(id, updated);
    return updated;
  }

  async deleteSchedule(id: string): Promise<boolean> {
    if (!this.schedules.has(id)) {
      throw new NotFoundException(`Schedule ${id} not found`);
    }
    this.schedules.delete(id);
    return true;
  }

  async getSchedulesByWorkspace(
    workspaceId: string
  ): Promise<RefreshScheduleRecord[]> {
    return Array.from(this.schedules.values()).filter(
      (s) => s.workspaceId === workspaceId
    );
  }

  async getSchedule(id: string): Promise<RefreshScheduleRecord> {
    const schedule = this.schedules.get(id);
    if (!schedule) {
      throw new NotFoundException(`Schedule ${id} not found`);
    }
    return schedule;
  }

  async getSchedulesByDashboard(
    dashboardId: string
  ): Promise<RefreshScheduleRecord[]> {
    return Array.from(this.schedules.values()).filter(
      (s) => s.dashboardId === dashboardId
    );
  }

  async toggleSchedule(
    id: string,
    enabled: boolean
  ): Promise<RefreshScheduleRecord> {
    const schedule = this.schedules.get(id);
    if (!schedule) {
      throw new NotFoundException(`Schedule ${id} not found`);
    }
    const updated: RefreshScheduleRecord = {
      ...schedule,
      enabled,
      updatedAt: new Date(),
    };
    this.schedules.set(id, updated);
    return updated;
  }

  async runNow(id: string): Promise<RefreshScheduleRecord> {
    const schedule = this.schedules.get(id);
    if (!schedule) {
      throw new NotFoundException(`Schedule ${id} not found`);
    }
    if (!schedule.enabled) {
      throw new BadRequestException(`Schedule ${id} is disabled`);
    }
    const now = new Date();
    const updated: RefreshScheduleRecord = {
      ...schedule,
      lastRunAt: now,
      nextRunAt: this.computeNextRun(schedule.cronExpression, now),
      updatedAt: now,
    };
    this.schedules.set(id, updated);
    return updated;
  }

  private computeNextRun(cronExpression: string, from: Date): Date {
    const parts = cronExpression.trim().split(/\s+/);
    if (parts.length < 5) {
      return new Date(from.getTime() + 60 * 60 * 1000);
    }
    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
    const next = new Date(from);
    next.setSeconds(0, 0);

    if (minute !== "*") {
      const m = parseInt(minute, 10);
      if (!isNaN(m)) {
        next.setMinutes(m);
        if (next <= from) {
          next.setHours(next.getHours() + 1);
        }
      }
    } else {
      next.setMinutes(next.getMinutes() + 1);
    }

    if (hour !== "*") {
      const h = parseInt(hour, 10);
      if (!isNaN(h)) {
        next.setHours(h);
        if (next <= from) {
          next.setDate(next.getDate() + 1);
        }
      }
    }

    if (dayOfMonth !== "*") {
      const d = parseInt(dayOfMonth, 10);
      if (!isNaN(d)) {
        next.setDate(d);
        if (next <= from) {
          next.setMonth(next.getMonth() + 1);
        }
      }
    }

    if (month !== "*") {
      const mo = parseInt(month, 10);
      if (!isNaN(mo)) {
        next.setMonth(mo - 1);
        if (next <= from) {
          next.setFullYear(next.getFullYear() + 1);
        }
      }
    }

    if (dayOfWeek !== "*") {
      const dw = parseInt(dayOfWeek, 10);
      if (!isNaN(dw)) {
        while (next.getDay() !== dw || next <= from) {
          next.setDate(next.getDate() + 1);
        }
      }
    }

    return next;
  }
}
