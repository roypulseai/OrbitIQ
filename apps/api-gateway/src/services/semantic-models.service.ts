import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";

interface SemanticModelRecord {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  gitRef?: string;
  status: "draft" | "published";
  createdAt: Date;
  updatedAt: Date;
}

interface ModelTable {
  id: string;
  modelId: string;
  connectionId: string;
  physicalName: string;
  logicalName: string;
  schema: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ModelColumn {
  id: string;
  tableId: string;
  physicalName: string;
  logicalName: string;
  dataType: string;
  isDimension: boolean;
  isMeasure: boolean;
  isPii: boolean;
  maskRule?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

interface ModelMeasure {
  id: string;
  modelId: string;
  name: string;
  expression: string;
  format?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class SemanticModelsService {
  private models: Map<string, SemanticModelRecord> = new Map();
  private tables: Map<string, ModelTable> = new Map();
  private columns: Map<string, ModelColumn> = new Map();
  private measures: Map<string, ModelMeasure> = new Map();

  // Model CRUD
  async findAllByWorkspace(workspaceId: string): Promise<SemanticModelRecord[]> {
    return Array.from(this.models.values()).filter(
      (m) => m.workspaceId === workspaceId
    );
  }

  async findOne(id: string): Promise<SemanticModelRecord> {
    const model = this.models.get(id);
    if (!model) {
      throw new NotFoundException(`Semantic Model ${id} not found`);
    }
    return model;
  }

  async create(input: {
    workspaceId: string;
    name: string;
    description?: string;
  }): Promise<SemanticModelRecord> {
    const model: SemanticModelRecord = {
      id: crypto.randomUUID(),
      workspaceId: input.workspaceId,
      name: input.name,
      description: input.description,
      status: "draft",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.models.set(model.id, model);
    return model;
  }

  async update(
    id: string,
    input: { name?: string; description?: string }
  ): Promise<SemanticModelRecord> {
    const model = await this.findOne(id);
    const updated = {
      ...model,
      ...input,
      updatedAt: new Date(),
    };
    this.models.set(id, updated);
    return updated;
  }

  async publish(id: string): Promise<SemanticModelRecord> {
    const model = await this.findOne(id);
    const updated = {
      ...model,
      status: "published" as const,
      updatedAt: new Date(),
    };
    this.models.set(id, updated);
    return updated;
  }

  async unpublish(id: string): Promise<SemanticModelRecord> {
    const model = await this.findOne(id);
    const updated = {
      ...model,
      status: "draft" as const,
      updatedAt: new Date(),
    };
    this.models.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    await this.findOne(id);
    this.models.delete(id);
    // Cascade delete tables, columns, measures
    for (const [tableId, table] of this.tables) {
      if (table.modelId === id) {
        for (const [colId, col] of this.columns) {
          if (col.tableId === tableId) {
            this.columns.delete(colId);
          }
        }
        this.tables.delete(tableId);
      }
    }
    for (const [measureId, measure] of this.measures) {
      if (measure.modelId === id) {
        this.measures.delete(measureId);
      }
    }
    return true;
  }

  // Table CRUD
  async getTables(modelId: string): Promise<ModelTable[]> {
    return Array.from(this.tables.values()).filter(
      (t) => t.modelId === modelId
    );
  }

  async addTable(input: {
    modelId: string;
    connectionId: string;
    physicalName: string;
    logicalName: string;
    schema: string;
  }): Promise<ModelTable> {
    await this.findOne(input.modelId);
    const table: ModelTable = {
      id: crypto.randomUUID(),
      ...input,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.tables.set(table.id, table);
    return table;
  }

  async removeTable(id: string): Promise<boolean> {
    this.tables.delete(id);
    // Cascade delete columns
    for (const [colId, col] of this.columns) {
      if (col.tableId === id) {
        this.columns.delete(colId);
      }
    }
    return true;
  }

  // Column CRUD
  async getColumns(tableId: string): Promise<ModelColumn[]> {
    return Array.from(this.columns.values()).filter(
      (c) => c.tableId === tableId
    );
  }

  async addColumn(input: {
    tableId: string;
    physicalName: string;
    logicalName: string;
    dataType: string;
    isDimension?: boolean;
    isMeasure?: boolean;
    isPii?: boolean;
  }): Promise<ModelColumn> {
    const column: ModelColumn = {
      id: crypto.randomUUID(),
      ...input,
      isDimension: input.isDimension ?? true,
      isMeasure: input.isMeasure ?? false,
      isPii: input.isPii ?? false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.columns.set(column.id, column);
    return column;
  }

  async updateColumn(
    id: string,
    input: {
      logicalName?: string;
      isDimension?: boolean;
      isMeasure?: boolean;
      isPii?: boolean;
      maskRule?: Record<string, unknown>;
    }
  ): Promise<ModelColumn> {
    const column = this.columns.get(id);
    if (!column) {
      throw new NotFoundException(`Column ${id} not found`);
    }
    const updated = {
      ...column,
      ...input,
      updatedAt: new Date(),
    };
    this.columns.set(id, updated);
    return updated;
  }

  async removeColumn(id: string): Promise<boolean> {
    this.columns.delete(id);
    return true;
  }

  // Measure CRUD
  async getMeasures(modelId: string): Promise<ModelMeasure[]> {
    return Array.from(this.measures.values()).filter(
      (m) => m.modelId === modelId
    );
  }

  async addMeasure(input: {
    modelId: string;
    name: string;
    expression: string;
    format?: string;
    description?: string;
  }): Promise<ModelMeasure> {
    await this.findOne(input.modelId);
    const measure: ModelMeasure = {
      id: crypto.randomUUID(),
      ...input,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.measures.set(measure.id, measure);
    return measure;
  }

  async updateMeasure(
    id: string,
    input: {
      name?: string;
      expression?: string;
      format?: string;
      description?: string;
    }
  ): Promise<ModelMeasure> {
    const measure = this.measures.get(id);
    if (!measure) {
      throw new NotFoundException(`Measure ${id} not found`);
    }
    const updated = {
      ...measure,
      ...input,
      updatedAt: new Date(),
    };
    this.measures.set(id, updated);
    return updated;
  }

  async removeMeasure(id: string): Promise<boolean> {
    this.measures.delete(id);
    return true;
  }

  // Build SQL from semantic model
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
    const modelTables = await this.getTables(modelId);
    const modelColumns: ModelColumn[] = [];
    const modelMeasures = await this.getMeasures(modelId);

    for (const table of modelTables) {
      const columns = await this.getColumns(table.id);
      modelColumns.push(...columns);
    }

    // Build SELECT clause
    const selectParts: string[] = [];

    for (const colName of selectedColumns) {
      const col = modelColumns.find(
        (c) => c.logicalName === colName || c.physicalName === colName
      );
      if (col) {
        const table = modelTables.find((t) => t.id === col.tableId);
        if (table) {
          selectParts.push(`"${table.physicalName}"."${col.physicalName}"`);
        }
      }
    }

    for (const measureName of measures) {
      const measure = modelMeasures.find((m) => m.name === measureName);
      if (measure) {
        selectParts.push(`(${measure.expression}) AS "${measureName}"`);
      }
    }

    // Build FROM clause
    const primaryTable = modelTables[0];
    if (!primaryTable) {
      throw new BadRequestException("No tables in semantic model");
    }

    let sql = `SELECT ${selectParts.join(", ")}\nFROM "${primaryTable.physicalName}"`;

    // Build WHERE clause
    if (filters.length > 0) {
      const filterConditions = filters.map((f) => {
        const col = modelColumns.find(
          (c) => c.logicalName === f.column || c.physicalName === f.column
        );
        if (col) {
          const table = modelTables.find((t) => t.id === col.tableId);
          if (table) {
            return `"${table.physicalName}"."${col.physicalName}" ${f.operator || "="} ${f.value}`;
          }
        }
        return "1=1";
      });
      sql += `\nWHERE ${filterConditions.join(" AND ")}`;
    }

    // Build GROUP BY clause
    if (groupBy.length > 0) {
      const groupByParts = groupBy.map((colName) => {
        const col = modelColumns.find(
          (c) => c.logicalName === colName || c.physicalName === colName
        );
        if (col) {
          const table = modelTables.find((t) => t.id === col.tableId);
          if (table) {
            return `"${table.physicalName}"."${col.physicalName}"`;
          }
        }
        return colName;
      });
      sql += `\nGROUP BY ${groupByParts.join(", ")}`;
    }

    // Build ORDER BY clause
    if (orderBy) {
      sql += `\nORDER BY ${orderBy}`;
    }

    // Build LIMIT clause
    if (limit) {
      sql += `\nLIMIT ${limit}`;
    }

    return sql;
  }
}
