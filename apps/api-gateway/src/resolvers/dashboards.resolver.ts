import { Resolver, Query, Mutation, Args, ID } from "@nestjs/graphql";
import { ObjectType, Field, InputType } from "@nestjs/graphql";
import { DashboardsService } from "../services/dashboards.service";
import { IngestionService } from "../services/ingestion.service";
import { CacheService } from "../services/cache.service";
import { IngestedTable } from "@prisma/client";

@ObjectType()
export class GQLTile {
  @Field(() => ID) id: string;
  @Field() dashboardId: string;
  @Field() chartSpec: string;
  @Field() oqlQuery: string;
  @Field() position: string;
}

@ObjectType()
export class GQLDashboard {
  @Field(() => ID) id: string;
  @Field() workspaceId: string;
  @Field() name: string;
  @Field({ nullable: true }) description?: string;
  @Field() layout: string;
  @Field(() => [GQLTile]) tiles: GQLTile[];
  @Field() createdAt: Date;
  @Field() updatedAt: Date;
}

@InputType()
export class CreateDashboardInput {
  @Field() workspaceId: string;
  @Field() name: string;
  @Field({ nullable: true }) description?: string;
}

@InputType()
export class UpdateDashboardInput {
  @Field({ nullable: true }) name?: string;
  @Field({ nullable: true }) description?: string;
}

@InputType()
export class AddTileInput {
  @Field() dashboardId: string;
  @Field() chartSpec: string;
  @Field() oqlQuery: string;
  @Field() position: string;
}

@InputType()
export class UpdateTileInput {
  @Field({ nullable: true }) chartSpec?: string;
  @Field({ nullable: true }) oqlQuery?: string;
  @Field({ nullable: true }) position?: string;
}

@ObjectType()
export class GQLTileResult {
  @Field({ nullable: true }) columns?: string;
  @Field({ nullable: true }) rows?: string;
  @Field() rowCount: number;
  @Field() executionTimeMs: number;
  @Field() sql: string;
}

@Resolver()
export class DashboardsResolver {
  constructor(
    private readonly dashboardsService: DashboardsService,
    private readonly ingestionService: IngestionService,
    private readonly cacheService: CacheService,
  ) {}

  @Query(() => [GQLDashboard])
  async dashboards(@Args("workspaceId") workspaceId: string) {
    const dashboards = await this.dashboardsService.findAllByWorkspace(workspaceId);
    return dashboards.map((d: any) => ({
      ...d,
      layout: typeof d.layout === "string" ? d.layout : JSON.stringify(d.layout),
      tiles: (d.tiles || []).map((t: any) => ({
        ...t,
        chartSpec: typeof t.chartSpec === "string" ? t.chartSpec : JSON.stringify(t.chartSpec),
        oqlQuery: typeof t.oqlQuery === "string" ? t.oqlQuery : JSON.stringify(t.oqlQuery),
        position: typeof t.position === "string" ? t.position : JSON.stringify(t.position),
      })),
    }));
  }

  @Query(() => GQLDashboard)
  async dashboard(@Args("id") id: string) {
    const d = await this.dashboardsService.findOne(id) as any;
    return {
      ...d,
      layout: typeof d.layout === "string" ? d.layout : JSON.stringify(d.layout),
      tiles: (d.tiles || []).map((t: any) => ({
        ...t,
        chartSpec: typeof t.chartSpec === "string" ? t.chartSpec : JSON.stringify(t.chartSpec),
        oqlQuery: typeof t.oqlQuery === "string" ? t.oqlQuery : JSON.stringify(t.oqlQuery),
        position: typeof t.position === "string" ? t.position : JSON.stringify(t.position),
      })),
    };
  }

  @Mutation(() => GQLDashboard)
  async createDashboard(@Args("input") input: CreateDashboardInput) {
    const d = await this.dashboardsService.create(input) as any;
    return { ...d, layout: typeof d.layout === "string" ? d.layout : JSON.stringify(d.layout), tiles: [] };
  }

  @Mutation(() => GQLDashboard)
  async updateDashboard(
    @Args("id") id: string,
    @Args("input") input: UpdateDashboardInput
  ) {
    const d = await this.dashboardsService.update(id, input) as any;
    return {
      ...d,
      layout: typeof d.layout === "string" ? d.layout : JSON.stringify(d.layout),
      tiles: [],
    };
  }

  @Mutation(() => Boolean)
  async deleteDashboard(@Args("id") id: string) {
    return this.dashboardsService.delete(id);
  }

  @Mutation(() => GQLTile)
  async addTile(@Args("input") input: AddTileInput) {
    const t = await this.dashboardsService.addTile({
      dashboardId: input.dashboardId,
      chartSpec: JSON.parse(input.chartSpec),
      oqlQuery: JSON.parse(input.oqlQuery),
      position: JSON.parse(input.position),
    }) as any;
    return {
      ...t,
      chartSpec: typeof t.chartSpec === "string" ? t.chartSpec : JSON.stringify(t.chartSpec),
      oqlQuery: typeof t.oqlQuery === "string" ? t.oqlQuery : JSON.stringify(t.oqlQuery),
      position: typeof t.position === "string" ? t.position : JSON.stringify(t.position),
    };
  }

  @Mutation(() => GQLTile)
  async updateTile(
    @Args("id") id: string,
    @Args("input") input: UpdateTileInput
  ) {
    const update: any = {};
    if (input.chartSpec) update.chartSpec = JSON.parse(input.chartSpec);
    if (input.oqlQuery) update.oqlQuery = JSON.parse(input.oqlQuery);
    if (input.position) update.position = JSON.parse(input.position);
    const t = await this.dashboardsService.updateTile(id, update) as any;
    return {
      ...t,
      chartSpec: typeof t.chartSpec === "string" ? t.chartSpec : JSON.stringify(t.chartSpec),
      oqlQuery: typeof t.oqlQuery === "string" ? t.oqlQuery : JSON.stringify(t.oqlQuery),
      position: typeof t.position === "string" ? t.position : JSON.stringify(t.position),
    };
  }

  @Mutation(() => Boolean)
  async removeTile(@Args("id") id: string) {
    return this.dashboardsService.removeTile(id);
  }

  @Mutation(() => GQLTileResult)
  async executeTileQuery(
    @Args("tileId") tileId: string,
    @Args("tableId", { nullable: true }) tableId?: string,
  ) {
    const tile = await (this.dashboardsService as any).prisma.tile.findUnique({ where: { id: tileId } });
    if (!tile) throw new Error(`Tile ${tileId} not found`);

    const oqlQuery = typeof tile.oqlQuery === "string" ? JSON.parse(tile.oqlQuery) : tile.oqlQuery;
    const sql = oqlQuery.sql || oqlQuery.query || "SELECT 1";

    let dbPath: string | undefined;
    if (tableId) {
      const tableRecord = await (this.ingestionService as any).prisma.ingestedTable.findUnique({ where: { id: tableId } });
      if (tableRecord) dbPath = tableRecord.databasePath;
    }

    const cacheKey = this.cacheService.generateCacheKey(sql, [], tileId);
    const cached = await this.cacheService.getCache(cacheKey);
    if (cached) return { ...cached, sql };

    const result = await this.ingestionService.executeSQL(sql, dbPath);
    const response = {
      columns: JSON.stringify(result.columns),
      rows: JSON.stringify(result.rows),
      rowCount: result.rowCount,
      executionTimeMs: result.executionTimeMs,
      sql,
    };
    await this.cacheService.setCache(cacheKey, response, 120);
    return response;
  }
}
