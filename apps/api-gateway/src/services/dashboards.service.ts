import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

@Injectable()
export class DashboardsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByWorkspace(workspaceId: string) {
    return this.prisma.dashboard.findMany({
      where: { workspaceId },
      include: { tiles: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: string) {
    const dashboard = await this.prisma.dashboard.findUnique({
      where: { id },
      include: { tiles: true },
    });
    if (!dashboard) throw new NotFoundException(`Dashboard ${id} not found`);
    return dashboard;
  }

  async create(input: { workspaceId: string; name: string; description?: string }) {
    return this.prisma.dashboard.create({
      data: {
        workspaceId: input.workspaceId,
        name: input.name,
        description: input.description,
        layout: JSON.stringify({ columns: 12, rowHeight: 80, tiles: [] }),
      },
    });
  }

  async update(id: string, input: { name?: string; description?: string; layout?: Record<string, unknown> }) {
    await this.findOne(id);
    const data: Record<string, unknown> = {};
    if (input.name) data.name = input.name;
    if (input.description !== undefined) data.description = input.description;
    if (input.layout) data.layout = JSON.stringify(input.layout);
    return this.prisma.dashboard.update({ where: { id }, data });
  }

  async delete(id: string): Promise<boolean> {
    await this.findOne(id);
    await this.prisma.tile.deleteMany({ where: { dashboardId: id } });
    await this.prisma.dashboard.delete({ where: { id } });
    return true;
  }

  async getTiles(dashboardId: string) {
    return this.prisma.tile.findMany({ where: { dashboardId } });
  }

  async addTile(input: {
    dashboardId: string;
    chartSpec: Record<string, unknown>;
    oqlQuery: Record<string, unknown>;
    position: { x: number; y: number; w: number; h: number };
  }) {
    await this.findOne(input.dashboardId);
    return this.prisma.tile.create({
      data: {
        dashboardId: input.dashboardId,
        chartSpec: JSON.stringify(input.chartSpec),
        oqlQuery: JSON.stringify(input.oqlQuery),
        position: JSON.stringify(input.position),
      },
    });
  }

  async updateTile(id: string, input: {
    chartSpec?: Record<string, unknown>;
    oqlQuery?: Record<string, unknown>;
    position?: { x: number; y: number; w: number; h: number };
  }) {
    await this.prisma.tile.findUniqueOrThrow({ where: { id } });
    const data: Record<string, unknown> = {};
    if (input.chartSpec) data.chartSpec = JSON.stringify(input.chartSpec);
    if (input.oqlQuery) data.oqlQuery = JSON.stringify(input.oqlQuery);
    if (input.position) data.position = JSON.stringify(input.position);
    return this.prisma.tile.update({ where: { id }, data });
  }

  async removeTile(id: string): Promise<boolean> {
    await this.prisma.tile.delete({ where: { id } });
    return true;
  }
}
