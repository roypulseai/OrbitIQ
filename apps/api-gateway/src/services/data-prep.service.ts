import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";

interface TransformStepRecord {
  id: string;
  pipelineId: string;
  type: "filter" | "join" | "pivot" | "unpivot" | "group" | "rename" | "cast" | "add_column" | "remove_column" | "sort" | "deduplicate" | "sample";
  order: number;
  config: Record<string, unknown>;
  isActive: boolean;
  sqlOutput?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface DataPipelineRecord {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  sourceConnectionId: string;
  sourceSchema: string;
  sourceTable: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class DataPrepService {
  private pipelines: Map<string, DataPipelineRecord> = new Map();
  private steps: Map<string, TransformStepRecord> = new Map();

  // Pipeline CRUD
  async findAllByWorkspace(workspaceId: string): Promise<DataPipelineRecord[]> {
    return Array.from(this.pipelines.values()).filter(
      (p) => p.workspaceId === workspaceId
    );
  }

  async findOne(id: string): Promise<DataPipelineRecord> {
    const pipeline = this.pipelines.get(id);
    if (!pipeline) {
      throw new NotFoundException(`Pipeline ${id} not found`);
    }
    return pipeline;
  }

  async create(input: {
    workspaceId: string;
    name: string;
    description?: string;
    sourceConnectionId: string;
    sourceSchema: string;
    sourceTable: string;
  }): Promise<DataPipelineRecord> {
    const pipeline: DataPipelineRecord = {
      id: crypto.randomUUID(),
      ...input,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.pipelines.set(pipeline.id, pipeline);
    return pipeline;
  }

  async update(
    id: string,
    input: {
      name?: string;
      description?: string;
    }
  ): Promise<DataPipelineRecord> {
    const pipeline = await this.findOne(id);
    const updated = {
      ...pipeline,
      ...input,
      updatedAt: new Date(),
    };
    this.pipelines.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    await this.findOne(id);
    this.pipelines.delete(id);
    // Delete associated steps
    for (const [stepId, step] of this.steps) {
      if (step.pipelineId === id) {
        this.steps.delete(stepId);
      }
    }
    return true;
  }

  // Step CRUD
  async getSteps(pipelineId: string): Promise<TransformStepRecord[]> {
    return Array.from(this.steps.values())
      .filter((s) => s.pipelineId === pipelineId)
      .sort((a, b) => a.order - b.order);
  }

  async addStep(input: {
    pipelineId: string;
    type: TransformStepRecord["type"];
    config: Record<string, unknown>;
    order?: number;
  }): Promise<TransformStepRecord> {
    await this.findOne(input.pipelineId);

    const existingSteps = await this.getSteps(input.pipelineId);
    const order = input.order ?? existingSteps.length;

    const step: TransformStepRecord = {
      id: crypto.randomUUID(),
      ...input,
      order,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.steps.set(step.id, step);
    return step;
  }

  async updateStep(
    id: string,
    input: {
      config?: Record<string, unknown>;
      isActive?: boolean;
      order?: number;
    }
  ): Promise<TransformStepRecord> {
    const step = this.steps.get(id);
    if (!step) {
      throw new NotFoundException(`Step ${id} not found`);
    }
    const updated = {
      ...step,
      ...input,
      updatedAt: new Date(),
    };
    this.steps.set(id, updated);
    return updated;
  }

  async removeStep(id: string): Promise<boolean> {
    const step = this.steps.get(id);
    if (!step) {
      throw new NotFoundException(`Step ${id} not found`);
    }
    this.steps.delete(id);
    return true;
  }

  async reorderSteps(pipelineId: string, stepIds: string[]): Promise<void> {
    for (let i = 0; i < stepIds.length; i++) {
      const step = this.steps.get(stepIds[i]);
      if (step && step.pipelineId === pipelineId) {
        this.steps.set(stepIds[i], { ...step, order: i, updatedAt: new Date() });
      }
    }
  }

  // SQL Compilation
  async compilePipeline(pipelineId: string): Promise<string> {
    const pipeline = await this.findOne(pipelineId);
    const steps = await this.getSteps(pipelineId);

    let sql = `SELECT * FROM "${pipeline.sourceSchema}"."${pipeline.sourceTable}"`;

    for (const step of steps.filter((s) => s.isActive)) {
      sql = this.compileStep(sql, step);
    }

    return sql;
  }

  private compileStep(inputSQL: string, step: TransformStepRecord): string {
    switch (step.type) {
      case "filter":
        return this.compileFilter(inputSQL, step.config);
      case "join":
        return this.compileJoin(inputSQL, step.config);
      case "pivot":
        return this.compilePivot(inputSQL, step.config);
      case "unpivot":
        return this.compileUnpivot(inputSQL, step.config);
      case "group":
        return this.compileGroup(inputSQL, step.config);
      case "rename":
        return this.compileRename(inputSQL, step.config);
      case "cast":
        return this.compileCast(inputSQL, step.config);
      case "add_column":
        return this.compileAddColumn(inputSQL, step.config);
      case "remove_column":
        return this.compileRemoveColumn(inputSQL, step.config);
      case "sort":
        return this.compileSort(inputSQL, step.config);
      case "deduplicate":
        return this.compileDeduplicate(inputSQL, step.config);
      case "sample":
        return this.compileSample(inputSQL, step.config);
      default:
        return inputSQL;
    }
  }

  private compileFilter(inputSQL: string, config: Record<string, unknown>): string {
    const column = config.column as string;
    const operator = config.operator as string;
    const value = config.value;

    if (!column || !operator) {
      return inputSQL;
    }

    let condition: string;
    switch (operator) {
      case "eq":
        condition = `"${column}" = '${value}'`;
        break;
      case "neq":
        condition = `"${column}" != '${value}'`;
        break;
      case "gt":
        condition = `"${column}" > ${value}`;
        break;
      case "gte":
        condition = `"${column}" >= ${value}`;
        break;
      case "lt":
        condition = `"${column}" < ${value}`;
        break;
      case "lte":
        condition = `"${column}" <= ${value}`;
        break;
      case "contains":
        condition = `"${column}" LIKE '%${value}%'`;
        break;
      case "starts_with":
        condition = `"${column}" LIKE '${value}%'`;
        break;
      case "ends_with":
        condition = `"${column}" LIKE '%${value}'`;
        break;
      case "is_null":
        condition = `"${column}" IS NULL`;
        break;
      case "is_not_null":
        condition = `"${column}" IS NOT NULL`;
        break;
      default:
        return inputSQL;
    }

    return `SELECT * FROM (${inputSQL}) AS _filtered WHERE ${condition}`;
  }

  private compileJoin(inputSQL: string, config: Record<string, unknown>): string {
    const joinTable = config.joinTable as string;
    const joinType = (config.joinType as string) || "LEFT";
    const leftColumn = config.leftColumn as string;
    const rightColumn = config.rightColumn as string;

    if (!joinTable || !leftColumn || !rightColumn) {
      return inputSQL;
    }

    return `SELECT _left.* FROM (${inputSQL}) AS _left ${joinType} JOIN "${joinTable}" AS _right ON _left."${leftColumn}" = _right."${rightColumn}"`;
  }

  private compilePivot(inputSQL: string, config: Record<string, unknown>): string {
    const indexColumn = config.indexColumn as string;
    const pivotColumn = config.pivotColumn as string;
    const valueColumn = config.valueColumn as string;
    const aggregates = (config.aggregates as string[]) || ["SUM"];

    if (!indexColumn || !pivotColumn || !valueColumn) {
      return inputSQL;
    }

    // Simplified pivot - in reality this would need dynamic SQL generation
    return `SELECT "${indexColumn}", ${aggregates[0]}(CASE WHEN "${pivotColumn}" = ? THEN "${valueColumn}" END) FROM (${inputSQL}) AS _pivoted GROUP BY "${indexColumn}"`;
  }

  private compileUnpivot(inputSQL: string, config: Record<string, unknown>): string {
    const columns = (config.columns as string[]) || [];
    const nameColumn = config.nameColumn || "metric_name";
    const valueColumn = config.valueColumn || "metric_value";

    if (columns.length === 0) {
      return inputSQL;
    }

    const unpivotClauses = columns.map(
      (col) => `SELECT *, '${col}' AS "${nameColumn}", "${col}" AS "${valueColumn}" FROM (${inputSQL}) WHERE "${col}" IS NOT NULL`
    );

    return unpivotClauses.join("\n UNION ALL\n");
  }

  private compileGroup(inputSQL: string, config: Record<string, unknown>): string {
    const groupBy = (config.groupBy as string[]) || [];
    const aggregates = config.aggregates as Record<string, string> || {};

    if (groupBy.length === 0) {
      return inputSQL;
    }

    const groupByClause = groupBy.map((col) => `"${col}"`).join(", ");
    const aggregateClause = Object.entries(aggregates)
      .map(([col, agg]) => `${agg}("${col}") AS "${agg.toLowerCase()}_${col}"`)
      .join(", ");

    return `SELECT ${groupByClause}${aggregateClause ? ", " + aggregateClause : ""} FROM (${inputSQL}) AS _grouped GROUP BY ${groupByClause}`;
  }

  private compileRename(inputSQL: string, config: Record<string, unknown>): string {
    const renames = config.renames as Record<string, string> || {};

    if (Object.keys(renames).length === 0) {
      return inputSQL;
    }

    const selectClause = Object.entries(renames)
      .map(([old, newCol]) => `"${old}" AS "${newCol}"`)
      .join(", ");

    return `SELECT ${selectClause} FROM (${inputSQL}) AS _renamed`;
  }

  private compileCast(inputSQL: string, config: Record<string, unknown>): string {
    const casts = config.casts as Record<string, string> || {};

    if (Object.keys(casts).length === 0) {
      return inputSQL;
    }

    const selectClause = Object.entries(casts)
      .map(([col, type]) => `"${col}"::${type} AS "${col}"`)
      .join(", ");

    return `SELECT ${selectClause} FROM (${inputSQL}) AS _casted`;
  }

  private compileAddColumn(inputSQL: string, config: Record<string, unknown>): string {
    const columnName = config.columnName as string;
    const expression = config.expression as string;

    if (!columnName || !expression) {
      return inputSQL;
    }

    return `SELECT *, (${expression}) AS "${columnName}" FROM (${inputSQL}) AS _with_column`;
  }

  private compileRemoveColumn(inputSQL: string, config: Record<string, unknown>): string {
    const columns = (config.columns as string[]) || [];

    if (columns.length === 0) {
      return inputSQL;
    }

    // This is simplified - in reality we'd need to parse the SQL to remove columns
    return inputSQL;
  }

  private compileSort(inputSQL: string, config: Record<string, unknown>): string {
    const column = config.column as string;
    const direction = (config.direction as string) || "ASC";

    if (!column) {
      return inputSQL;
    }

    return `SELECT * FROM (${inputSQL}) AS _sorted ORDER BY "${column}" ${direction}`;
  }

  private compileDeduplicate(inputSQL: string, config: Record<string, unknown>): string {
    const columns = (config.columns as string[]) || [];

    if (columns.length === 0) {
      return inputSQL;
    }

    const partitionBy = columns.map((col) => `"${col}"`).join(", ");

    return `SELECT * FROM (SELECT *, ROW_NUMBER() OVER (PARTITION BY ${partitionBy} ORDER BY (SELECT NULL)) AS _row_num FROM (${inputSQL}) AS _dedup_input) AS _dedup WHERE _row_num = 1`;
  }

  private compileSample(inputSQL: string, config: Record<string, unknown>): string {
    const sampleSize = (config.sampleSize as number) || 100;
    const method = (config.method as string) || "random";

    if (method === "random") {
      return `SELECT * FROM (${inputSQL}) AS _sample ORDER BY RANDOM() LIMIT ${sampleSize}`;
    }

    return `SELECT * FROM (${inputSQL}) AS _sample LIMIT ${sampleSize}`;
  }

  // Preview
  async previewStep(stepId: string): Promise<{ sql: string; preview: Record<string, unknown>[] }> {
    const step = this.steps.get(stepId);
    if (!step) {
      throw new NotFoundException(`Step ${id} not found`);
    }

    const pipeline = await this.findOne(step.pipelineId);
    const steps = await this.getSteps(step.pipelineId);
    
    let sql = `SELECT * FROM "${pipeline.sourceSchema}"."${pipeline.sourceTable}"`;
    
    for (const s of steps.filter((s) => s.isActive && s.order <= step.order)) {
      sql = this.compileStep(sql, s);
    }

    sql += " LIMIT 100";

    return {
      sql,
      preview: [], // In real implementation, would execute query
    };
  }
}
