import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

@Injectable()
export class SemanticModelsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByWorkspace(workspaceId: string) {
    return this.prisma.semanticModel.findMany({
      where: { workspaceId },
      include: { tables: { include: { columns: true } }, measures: true, relationships: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: string) {
    const model = await this.prisma.semanticModel.findUnique({
      where: { id },
      include: { tables: { include: { columns: true } }, measures: true, relationships: true },
    });
    if (!model) throw new NotFoundException(`Semantic Model ${id} not found`);
    return model;
  }

  async create(input: { workspaceId: string; name: string; description?: string }) {
    return this.prisma.semanticModel.create({
      data: { workspaceId: input.workspaceId, name: input.name, status: "draft" },
    });
  }

  async update(id: string, input: { name?: string; description?: string }) {
    await this.findOne(id);
    return this.prisma.semanticModel.update({ where: { id }, data: { name: input.name } });
  }

  async publish(id: string) {
    await this.findOne(id);
    return this.prisma.semanticModel.update({ where: { id }, data: { status: "published" } });
  }

  async unpublish(id: string) {
    await this.findOne(id);
    return this.prisma.semanticModel.update({ where: { id }, data: { status: "draft" } });
  }

  async delete(id: string): Promise<boolean> {
    await this.findOne(id);
    await this.prisma.measure.deleteMany({ where: { modelId: id } });
    await this.prisma.relationship.deleteMany({ where: { modelId: id } });
    const tables = await this.prisma.table.findMany({ where: { modelId: id } });
    for (const table of tables) {
      await this.prisma.column.deleteMany({ where: { tableId: table.id } });
    }
    await this.prisma.table.deleteMany({ where: { modelId: id } });
    await this.prisma.semanticModel.delete({ where: { id } });
    return true;
  }

  async getTables(modelId: string) {
    return this.prisma.table.findMany({ where: { modelId }, include: { columns: true } });
  }

  async addTable(input: { modelId: string; connectionId: string; physicalName: string; logicalName: string; schema?: string }) {
    await this.findOne(input.modelId);
    return this.prisma.table.create({
      data: {
        modelId: input.modelId,
        connectionId: input.connectionId,
        physicalName: input.physicalName,
        logicalName: input.logicalName,
      },
    });
  }

  async removeTable(id: string): Promise<boolean> {
    await this.prisma.column.deleteMany({ where: { tableId: id } });
    await this.prisma.table.delete({ where: { id } });
    return true;
  }

  async getColumns(tableId: string) {
    return this.prisma.column.findMany({ where: { tableId } });
  }

  async addColumn(input: { tableId: string; physicalName: string; logicalName: string; dataType: string; isPii?: boolean }) {
    return this.prisma.column.create({
      data: {
        tableId: input.tableId,
        physicalName: input.physicalName,
        logicalName: input.logicalName,
        dataType: input.dataType,
        isPii: input.isPii ? 1 : 0,
      },
    });
  }

  async updateColumn(id: string, input: { logicalName?: string; isPii?: boolean; maskRule?: Record<string, unknown> }) {
    await this.prisma.column.findUniqueOrThrow({ where: { id } });
    const data: Record<string, unknown> = {};
    if (input.logicalName) data.logicalName = input.logicalName;
    if (input.isPii !== undefined) data.isPii = input.isPii ? 1 : 0;
    if (input.maskRule) data.maskRule = JSON.stringify(input.maskRule);
    return this.prisma.column.update({ where: { id }, data });
  }

  async removeColumn(id: string): Promise<boolean> {
    await this.prisma.column.delete({ where: { id } });
    return true;
  }

  async getMeasures(modelId: string) {
    return this.prisma.measure.findMany({ where: { modelId } });
  }

  async addMeasure(input: { modelId: string; name: string; expression: string; format?: string; description?: string }) {
    await this.findOne(input.modelId);
    return this.prisma.measure.create({
      data: {
        modelId: input.modelId,
        name: input.name,
        oqlExpression: input.expression,
        format: input.format,
      },
    });
  }

  async updateMeasure(id: string, input: { name?: string; expression?: string; format?: string }) {
    await this.prisma.measure.findUniqueOrThrow({ where: { id } });
    const data: Record<string, unknown> = {};
    if (input.name) data.name = input.name;
    if (input.expression) data.oqlExpression = input.expression;
    if (input.format) data.format = input.format;
    return this.prisma.measure.update({ where: { id }, data });
  }

  async removeMeasure(id: string): Promise<boolean> {
    await this.prisma.measure.delete({ where: { id } });
    return true;
  }

  async buildQuery(
    modelId: string,
    selectedColumns: string[],
    measures: string[],
    filters: Record<string, unknown>[],
    groupBy: string[],
    orderBy?: string,
    limit?: number
  ): Promise<string> {
    const model = await this.findOne(modelId);
    const modelTables = model.tables;
    const allColumns = modelTables.flatMap(t => t.columns);
    const modelMeasures = model.measures;

    const selectParts: string[] = [];
    for (const colName of selectedColumns) {
      const col = allColumns.find(c => c.logicalName === colName || c.physicalName === colName);
      if (col) {
        const table = modelTables.find(t => t.id === col.tableId);
        if (table) selectParts.push(`"${table.physicalName}"."${col.physicalName}"`);
      }
    }
    for (const measureName of measures) {
      const measure = modelMeasures.find(m => m.name === measureName);
      if (measure) selectParts.push(`(${measure.oqlExpression}) AS "${measureName}"`);
    }

    const primaryTable = modelTables[0];
    if (!primaryTable) throw new BadRequestException("No tables in semantic model");

    let sql = `SELECT ${selectParts.join(", ")}\nFROM "${primaryTable.physicalName}"`;

    if (filters.length > 0) {
      const filterConditions = filters.map(f => {
        const col = allColumns.find(c => c.logicalName === f.column || c.physicalName === f.column);
        if (col) {
          const table = modelTables.find(t => t.id === col.tableId);
          if (table) return `"${table.physicalName}"."${col.physicalName}" ${f.operator || "="} ${f.value}`;
        }
        return "1=1";
      });
      sql += `\nWHERE ${filterConditions.join(" AND ")}`;
    }

    if (groupBy.length > 0) {
      const groupByParts = groupBy.map(colName => {
        const col = allColumns.find(c => c.logicalName === colName || c.physicalName === colName);
        if (col) {
          const table = modelTables.find(t => t.id === col.tableId);
          if (table) return `"${table.physicalName}"."${col.physicalName}"`;
        }
        return colName;
      });
      sql += `\nGROUP BY ${groupByParts.join(", ")}`;
    }

    if (orderBy) sql += `\nORDER BY ${orderBy}`;
    if (limit) sql += `\nLIMIT ${limit}`;

    return sql;
  }
}
