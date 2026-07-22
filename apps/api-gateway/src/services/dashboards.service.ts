import { Injectable, NotFoundException } from "@nestjs/common";

interface DashboardRecord {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  layout: DashboardLayout;
  gitRef?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface DashboardLayout {
  columns: number;
  rowHeight: number;
  tiles: TileConfig[];
}

interface TileConfig {
  id: string;
  type: "chart" | "kpi" | "table" | "text";
  position: { x: number; y: number; w: number; h: number };
  config: Record<string, unknown>;
}

interface TileRecord {
  id: string;
  dashboardId: string;
  chartSpec: Record<string, unknown>;
  oqlQuery: Record<string, unknown>;
  position: { x: number; y: number; w: number; h: number };
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class DashboardsService {
  private dashboards: Map<string, DashboardRecord> = new Map();
  private tiles: Map<string, TileRecord> = new Map();

  async findAllByWorkspace(workspaceId: string): Promise<DashboardRecord[]> {
    return Array.from(this.dashboards.values()).filter(
      (d) => d.workspaceId === workspaceId
    );
  }

  async findOne(id: string): Promise<DashboardRecord> {
    const dashboard = this.dashboards.get(id);
    if (!dashboard) {
      throw new NotFoundException(`Dashboard ${id} not found`);
    }
    return dashboard;
  }

  async create(input: {
    workspaceId: string;
    name: string;
    description?: string;
  }): Promise<DashboardRecord> {
    const dashboard: DashboardRecord = {
      id: crypto.randomUUID(),
      workspaceId: input.workspaceId,
      name: input.name,
      description: input.description,
      layout: {
        columns: 12,
        rowHeight: 80,
        tiles: [],
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.dashboards.set(dashboard.id, dashboard);
    return dashboard;
  }

  async update(
    id: string,
    input: {
      name?: string;
      description?: string;
      layout?: DashboardLayout;
    }
  ): Promise<DashboardRecord> {
    const dashboard = await this.findOne(id);
    const updated = {
      ...dashboard,
      ...input,
      updatedAt: new Date(),
    };
    this.dashboards.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    await this.findOne(id);
    this.dashboards.delete(id);
    // Cascade delete tiles
    for (const [tileId, tile] of this.tiles) {
      if (tile.dashboardId === id) {
        this.tiles.delete(tileId);
      }
    }
    return true;
  }

  // Tile CRUD
  async getTiles(dashboardId: string): Promise<TileRecord[]> {
    return Array.from(this.tiles.values()).filter(
      (t) => t.dashboardId === dashboardId
    );
  }

  async addTile(input: {
    dashboardId: string;
    chartSpec: Record<string, unknown>;
    oqlQuery: Record<string, unknown>;
    position: { x: number; y: number; w: number; h: number };
  }): Promise<TileRecord> {
    await this.findOne(input.dashboardId);
    const tile: TileRecord = {
      id: crypto.randomUUID(),
      ...input,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.tiles.set(tile.id, tile);

    // Update dashboard layout
    const dashboard = await this.findOne(input.dashboardId);
    dashboard.layout.tiles.push({
      id: tile.id,
      type: (tile.chartSpec.type as "chart") || "chart",
      position: tile.position,
      config: tile.chartSpec,
    });
    this.dashboards.set(input.dashboardId, {
      ...dashboard,
      updatedAt: new Date(),
    });

    return tile;
  }

  async updateTile(
    id: string,
    input: {
      chartSpec?: Record<string, unknown>;
      oqlQuery?: Record<string, unknown>;
      position?: { x: number; y: number; w: number; h: number };
    }
  ): Promise<TileRecord> {
    const tile = this.tiles.get(id);
    if (!tile) {
      throw new NotFoundException(`Tile ${id} not found`);
    }
    const updated = {
      ...tile,
      ...input,
      updatedAt: new Date(),
    };
    this.tiles.set(id, updated);
    return updated;
  }

  async removeTile(id: string): Promise<boolean> {
    const tile = this.tiles.get(id);
    if (!tile) {
      throw new NotFoundException(`Tile ${id} not found`);
    }

    // Update dashboard layout
    const dashboard = await this.findOne(tile.dashboardId);
    dashboard.layout.tiles = dashboard.layout.tiles.filter(
      (t) => t.id !== id
    );
    this.dashboards.set(tile.dashboardId, {
      ...dashboard,
      updatedAt: new Date(),
    });

    this.tiles.delete(id);
    return true;
  }
}
