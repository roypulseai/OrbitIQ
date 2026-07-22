import { Resolver, Query, Mutation, Args, ID } from "@nestjs/graphql";
import {
  SemanticModel,
  ModelTable,
  ModelColumn,
  ModelMeasure,
  Dashboard,
  Tile,
  RoleDefinition,
  PermissionCheck,
  CreateSemanticModelInput,
  UpdateSemanticModelInput,
  AddModelTableInput,
  AddModelColumnInput,
  UpdateModelColumnInput,
  AddModelMeasureInput,
  UpdateModelMeasureInput,
  CreateDashboardInput,
  UpdateDashboardInput,
  AddTileInput,
  UpdateTileInput,
  BuildQueryInput,
  CheckPermissionInput,
} from "../schema";
import { SemanticModelsService } from "../services/semantic-models.service";
import { DashboardsService } from "../services/dashboards.service";
import { RBACService } from "../services/rbac.service";
import { AuditService } from "../services/audit.service";

@Resolver()
export class SemanticModelsResolver {
  constructor(
    private readonly semanticModelsService: SemanticModelsService,
    private readonly dashboardsService: DashboardsService,
    private readonly rbacService: RBACService,
    private readonly auditService: AuditService
  ) {}

  // Semantic Model Queries
  @Query(() => [SemanticModel], { name: "semanticModels" })
  async getSemanticModels(
    @Args("workspaceId") workspaceId: string
  ): Promise<SemanticModel[]> {
    return this.semanticModelsService.findAllByWorkspace(workspaceId);
  }

  @Query(() => SemanticModel, { name: "semanticModel" })
  async getSemanticModel(
    @Args("id", { type: () => ID }) id: string
  ): Promise<SemanticModel> {
    return this.semanticModelsService.findOne(id);
  }

  @Query(() => [ModelTable])
  async getModelTables(
    @Args("modelId") modelId: string
  ): Promise<ModelTable[]> {
    return this.semanticModelsService.getTables(modelId);
  }

  @Query(() => [ModelColumn])
  async getModelColumns(
    @Args("tableId") tableId: string
  ): Promise<ModelColumn[]> {
    return this.semanticModelsService.getColumns(tableId);
  }

  @Query(() => [ModelMeasure])
  async getModelMeasures(
    @Args("modelId") modelId: string
  ): Promise<ModelMeasure[]> {
    return this.semanticModelsService.getMeasures(modelId);
  }

  // Semantic Model Mutations
  @Mutation(() => SemanticModel)
  async createSemanticModel(
    @Args("input") input: CreateSemanticModelInput
  ): Promise<SemanticModel> {
    const model = await this.semanticModelsService.create(input);
    await this.auditService.log({
      action: "semantic_model.create",
      target: model.id,
      metadata: { name: model.name, workspaceId: model.workspaceId },
    });
    return model;
  }

  @Mutation(() => SemanticModel)
  async updateSemanticModel(
    @Args("id", { type: () => ID }) id: string,
    @Args("input") input: UpdateSemanticModelInput
  ): Promise<SemanticModel> {
    const model = await this.semanticModelsService.update(id, input);
    await this.auditService.log({
      action: "semantic_model.update",
      target: id,
      metadata: { changes: input },
    });
    return model;
  }

  @Mutation(() => SemanticModel)
  async publishSemanticModel(
    @Args("id", { type: () => ID }) id: string
  ): Promise<SemanticModel> {
    const model = await this.semanticModelsService.publish(id);
    await this.auditService.log({
      action: "semantic_model.publish",
      target: id,
      metadata: { name: model.name },
    });
    return model;
  }

  @Mutation(() => SemanticModel)
  async unpublishSemanticModel(
    @Args("id", { type: () => ID }) id: string
  ): Promise<SemanticModel> {
    const model = await this.semanticModelsService.unpublish(id);
    await this.auditService.log({
      action: "semantic_model.unpublish",
      target: id,
      metadata: { name: model.name },
    });
    return model;
  }

  @Mutation(() => Boolean)
  async deleteSemanticModel(
    @Args("id", { type: () => ID }) id: string
  ): Promise<boolean> {
    const result = await this.semanticModelsService.delete(id);
    await this.auditService.log({
      action: "semantic_model.delete",
      target: id,
      metadata: { success: result },
    });
    return result;
  }

  // Table Mutations
  @Mutation(() => ModelTable)
  async addModelTable(
    @Args("input") input: AddModelTableInput
  ): Promise<ModelTable> {
    const table = await this.semanticModelsService.addTable(input);
    await this.auditService.log({
      action: "semantic_model.table.add",
      target: input.modelId,
      metadata: { tableName: table.logicalName },
    });
    return table;
  }

  @Mutation(() => Boolean)
  async removeModelTable(
    @Args("id", { type: () => ID }) id: string
  ): Promise<boolean> {
    const result = await this.semanticModelsService.removeTable(id);
    await this.auditService.log({
      action: "semantic_model.table.remove",
      target: id,
      metadata: { success: result },
    });
    return result;
  }

  // Column Mutations
  @Mutation(() => ModelColumn)
  async addModelColumn(
    @Args("input") input: AddModelColumnInput
  ): Promise<ModelColumn> {
    const column = await this.semanticModelsService.addColumn(input);
    await this.auditService.log({
      action: "semantic_model.column.add",
      target: input.tableId,
      metadata: { columnName: column.logicalName },
    });
    return column;
  }

  @Mutation(() => ModelColumn)
  async updateModelColumn(
    @Args("id", { type: () => ID }) id: string,
    @Args("input") input: UpdateModelColumnInput
  ): Promise<ModelColumn> {
    const column = await this.semanticModelsService.updateColumn(id, input);
    await this.auditService.log({
      action: "semantic_model.column.update",
      target: id,
      metadata: { changes: input },
    });
    return column;
  }

  @Mutation(() => Boolean)
  async removeModelColumn(
    @Args("id", { type: () => ID }) id: string
  ): Promise<boolean> {
    const result = await this.semanticModelsService.removeColumn(id);
    await this.auditService.log({
      action: "semantic_model.column.remove",
      target: id,
      metadata: { success: result },
    });
    return result;
  }

  // Measure Mutations
  @Mutation(() => ModelMeasure)
  async addModelMeasure(
    @Args("input") input: AddModelMeasureInput
  ): Promise<ModelMeasure> {
    const measure = await this.semanticModelsService.addMeasure(input);
    await this.auditService.log({
      action: "semantic_model.measure.add",
      target: input.modelId,
      metadata: { measureName: measure.name },
    });
    return measure;
  }

  @Mutation(() => ModelMeasure)
  async updateModelMeasure(
    @Args("id", { type: () => ID }) id: string,
    @Args("input") input: UpdateModelMeasureInput
  ): Promise<ModelMeasure> {
    const measure = await this.semanticModelsService.updateMeasure(id, input);
    await this.auditService.log({
      action: "semantic_model.measure.update",
      target: id,
      metadata: { changes: input },
    });
    return measure;
  }

  @Mutation(() => Boolean)
  async removeModelMeasure(
    @Args("id", { type: () => ID }) id: string
  ): Promise<boolean> {
    const result = await this.semanticModelsService.removeMeasure(id);
    await this.auditService.log({
      action: "semantic_model.measure.remove",
      target: id,
      metadata: { success: result },
    });
    return result;
  }

  // Build Query
  @Mutation(() => String)
  async buildQuery(
    @Args("input") input: BuildQueryInput
  ): Promise<string> {
    const sql = await this.semanticModelsService.buildQuery(
      input.modelId,
      input.selectedColumns,
      input.measures,
      input.filters,
      input.groupBy,
      input.orderBy,
      input.limit
    );
    await this.auditService.log({
      action: "semantic_model.query.build",
      target: input.modelId,
      metadata: { sql },
    });
    return sql;
  }

  // Dashboard Queries
  @Query(() => [Dashboard], { name: "dashboards" })
  async getDashboards(
    @Args("workspaceId") workspaceId: string
  ): Promise<Dashboard[]> {
    return this.dashboardsService.findAllByWorkspace(workspaceId);
  }

  @Query(() => Dashboard, { name: "dashboard" })
  async getDashboard(
    @Args("id", { type: () => ID }) id: string
  ): Promise<Dashboard> {
    return this.dashboardsService.findOne(id);
  }

  @Query(() => [Tile])
  async getDashboardTiles(
    @Args("dashboardId") dashboardId: string
  ): Promise<Tile[]> {
    return this.dashboardsService.getTiles(dashboardId);
  }

  // Dashboard Mutations
  @Mutation(() => Dashboard)
  async createDashboard(
    @Args("input") input: CreateDashboardInput
  ): Promise<Dashboard> {
    const dashboard = await this.dashboardsService.create(input);
    await this.auditService.log({
      action: "dashboard.create",
      target: dashboard.id,
      metadata: { name: dashboard.name, workspaceId: dashboard.workspaceId },
    });
    return dashboard;
  }

  @Mutation(() => Dashboard)
  async updateDashboard(
    @Args("id", { type: () => ID }) id: string,
    @Args("input") input: UpdateDashboardInput
  ): Promise<Dashboard> {
    const dashboard = await this.dashboardsService.update(id, input);
    await this.auditService.log({
      action: "dashboard.update",
      target: id,
      metadata: { changes: input },
    });
    return dashboard;
  }

  @Mutation(() => Boolean)
  async deleteDashboard(
    @Args("id", { type: () => ID }) id: string
  ): Promise<boolean> {
    const result = await this.dashboardsService.delete(id);
    await this.auditService.log({
      action: "dashboard.delete",
      target: id,
      metadata: { success: result },
    });
    return result;
  }

  // Tile Mutations
  @Mutation(() => Tile)
  async addTile(
    @Args("input") input: AddTileInput
  ): Promise<Tile> {
    const tile = await this.dashboardsService.addTile(input);
    await this.auditService.log({
      action: "dashboard.tile.add",
      target: input.dashboardId,
      metadata: { tileId: tile.id },
    });
    return tile;
  }

  @Mutation(() => Tile)
  async updateTile(
    @Args("id", { type: () => ID }) id: string,
    @Args("input") input: UpdateTileInput
  ): Promise<Tile> {
    const tile = await this.dashboardsService.updateTile(id, input);
    await this.auditService.log({
      action: "dashboard.tile.update",
      target: id,
      metadata: { changes: input },
    });
    return tile;
  }

  @Mutation(() => Boolean)
  async removeTile(
    @Args("id", { type: () => ID }) id: string
  ): Promise<boolean> {
    const result = await this.dashboardsService.removeTile(id);
    await this.auditService.log({
      action: "dashboard.tile.remove",
      target: id,
      metadata: { success: result },
    });
    return result;
  }

  // RBAC Queries
  @Query(() => [String])
  async getAllRoles(): Promise<string[]> {
    return this.rbacService.getAllRoles();
  }

  @Query(() => [String])
  async getRolePermissions(
    @Args("role") role: string
  ): Promise<string[]> {
    return this.rbacService.getRolePermissions(
      role as "admin" | "editor" | "viewer" | "data_steward" | "security_admin"
    );
  }

  @Mutation(() => PermissionCheck)
  async checkPermission(
    @Args("input") input: CheckPermissionInput
  ): Promise<PermissionCheck> {
    const granted = this.rbacService.hasPermission(
      input.roles as ("admin" | "editor" | "viewer" | "data_steward" | "security_admin")[],
      input.permission as "workspaces.create" | "workspaces.read" | "workspaces.update" | "workspaces.delete" | "connections.create" | "connections.read" | "connections.update" | "connections.delete" | "connections.test" | "models.create" | "models.read" | "models.update" | "models.delete" | "models.publish" | "dashboards.create" | "dashboards.read" | "dashboards.update" | "dashboards.delete" | "queries.execute" | "users.create" | "users.read" | "users.update" | "users.delete" | "roles.create" | "roles.read" | "roles.update" | "roles.delete" | "audit.read" | "settings.read" | "settings.update"
    );
    return {
      granted,
      permission: input.permission,
      reason: granted ? undefined : "Insufficient permissions",
    };
  }
}
