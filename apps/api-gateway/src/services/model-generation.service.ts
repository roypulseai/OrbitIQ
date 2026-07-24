import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";

interface GeneratedDimension {
  name: string;
  sourceTable: string;
  sourceColumn: string;
  dataType: string;
  description: string;
  suggestedAs: "dimension" | "time_dimension" | "geographic";
  confidence: number;
}

interface GeneratedMeasure {
  name: string;
  sourceTable: string;
  sourceColumn: string;
  dataType: string;
  aggregation: "SUM" | "COUNT" | "AVG" | "MIN" | "MAX" | "COUNT_DISTINCT";
  description: string;
  format: "number" | "currency" | "percentage";
  confidence: number;
}

interface GeneratedModel {
  id: string;
  name: string;
  sourceConnectionId: string;
  status: "draft" | "reviewing" | "approved" | "published";
  dimensions: GeneratedDimension[];
  measures: GeneratedMeasure[];
  relationships: string[];
  generatedAt: Date;
  reviewedAt?: Date;
}

interface ModelDiff {
  field: string;
  currentValue: string;
  proposedValue: string;
  action: "added" | "modified" | "removed";
}

@Injectable()
export class ModelGenerationService {
  private generatedModels: Map<string, GeneratedModel> = new Map();

  constructor() {
    this.seedMockData();
  }

  private seedMockData(): void {
    const modelId = "mg-001";
    const model: GeneratedModel = {
      id: modelId,
      name: "Sales Analytics Model",
      sourceConnectionId: "conn-sales-analytics",
      status: "draft",
      dimensions: [
        {
          name: "Customer",
          sourceTable: "orders",
          sourceColumn: "customer_id",
          dataType: "integer",
          description: "Unique customer identifier for segmentation and analysis",
          suggestedAs: "dimension",
          confidence: 0.95,
        },
        {
          name: "Region",
          sourceTable: "customers",
          sourceColumn: "region",
          dataType: "varchar",
          description: "Geographic region for regional sales analysis",
          suggestedAs: "geographic",
          confidence: 0.92,
        },
        {
          name: "Product",
          sourceTable: "order_items",
          sourceColumn: "product_id",
          dataType: "integer",
          description: "Product identifier for product-level analysis",
          suggestedAs: "dimension",
          confidence: 0.97,
        },
        {
          name: "OrderDate",
          sourceTable: "orders",
          sourceColumn: "order_date",
          dataType: "timestamp",
          description: "Date and time of order placement for temporal analysis",
          suggestedAs: "time_dimension",
          confidence: 0.99,
        },
        {
          name: "Status",
          sourceTable: "orders",
          sourceColumn: "status",
          dataType: "varchar",
          description: "Order status for workflow and fulfillment tracking",
          suggestedAs: "dimension",
          confidence: 0.88,
        },
        {
          name: "Category",
          sourceTable: "products",
          sourceColumn: "category",
          dataType: "varchar",
          description: "Product category for category-level aggregation",
          suggestedAs: "dimension",
          confidence: 0.94,
        },
      ],
      measures: [
        {
          name: "revenue",
          sourceTable: "order_items",
          sourceColumn: "line_total",
          dataType: "decimal",
          aggregation: "SUM",
          description: "Total revenue from all order line items",
          format: "currency",
          confidence: 0.96,
        },
        {
          name: "order_count",
          sourceTable: "orders",
          sourceColumn: "id",
          dataType: "integer",
          aggregation: "COUNT",
          description: "Total number of orders placed",
          format: "number",
          confidence: 0.98,
        },
        {
          name: "avg_order_value",
          sourceTable: "orders",
          sourceColumn: "total_amount",
          dataType: "decimal",
          aggregation: "AVG",
          description: "Average order value across all orders",
          format: "currency",
          confidence: 0.93,
        },
        {
          name: "unique_customers",
          sourceTable: "orders",
          sourceColumn: "customer_id",
          dataType: "integer",
          aggregation: "COUNT_DISTINCT",
          description: "Count of unique customers who placed orders",
          format: "number",
          confidence: 0.97,
        },
        {
          name: "total_quantity",
          sourceTable: "order_items",
          sourceColumn: "quantity",
          dataType: "integer",
          aggregation: "SUM",
          description: "Total quantity of items sold across all orders",
          format: "number",
          confidence: 0.95,
        },
      ],
      relationships: [
        "orders.customer_id → customers.id (N:1)",
        "order_items.order_id → orders.id (N:1)",
        "order_items.product_id → products.id (N:1)",
      ],
      generatedAt: new Date(Date.now() - 3600000),
    };
    this.generatedModels.set(modelId, model);
  }

  async generateModel(
    connectionId: string,
    profilingJobId: string
  ): Promise<GeneratedModel> {
    const model: GeneratedModel = {
      id: crypto.randomUUID(),
      name: `Auto-generated Model — ${connectionId.slice(0, 8)}`,
      sourceConnectionId: connectionId,
      status: "draft",
      dimensions: [
        {
          name: "id",
          sourceTable: "main_table",
          sourceColumn: "id",
          dataType: "integer",
          description: "Primary identifier",
          suggestedAs: "dimension",
          confidence: 0.9,
        },
      ],
      measures: [
        {
          name: "record_count",
          sourceTable: "main_table",
          sourceColumn: "id",
          dataType: "integer",
          aggregation: "COUNT",
          description: "Total record count",
          format: "number",
          confidence: 0.95,
        },
      ],
      relationships: [],
      generatedAt: new Date(),
    };
    this.generatedModels.set(model.id, model);
    return model;
  }

  async getModel(id: string): Promise<GeneratedModel> {
    const model = this.generatedModels.get(id);
    if (!model) {
      throw new NotFoundException(`Generated model ${id} not found`);
    }
    return model;
  }

  async listModels(connectionId?: string): Promise<GeneratedModel[]> {
    const all = Array.from(this.generatedModels.values());
    if (connectionId) {
      return all.filter((m) => m.sourceConnectionId === connectionId);
    }
    return all;
  }

  async getDiff(id: string): Promise<ModelDiff[]> {
    const model = await this.getModel(id);
    const diffs: ModelDiff[] = [];
    for (const dim of model.dimensions) {
      diffs.push({
        field: `dimension.${dim.name}`,
        currentValue: "",
        proposedValue: `${dim.sourceTable}.${dim.sourceColumn} as ${dim.suggestedAs}`,
        action: "added",
      });
    }
    for (const meas of model.measures) {
      diffs.push({
        field: `measure.${meas.name}`,
        currentValue: "",
        proposedValue: `${meas.aggregation}(${meas.sourceTable}.${meas.sourceColumn})`,
        action: "added",
      });
    }
    for (const rel of model.relationships) {
      diffs.push({
        field: `relationship`,
        currentValue: "",
        proposedValue: rel,
        action: "added",
      });
    }
    return diffs;
  }

  async approveModel(id: string): Promise<GeneratedModel> {
    const model = await this.getModel(id);
    if (model.status !== "draft" && model.status !== "reviewing") {
      throw new BadRequestException(
        `Cannot approve model in "${model.status}" status`
      );
    }
    model.status = "reviewing";
    model.reviewedAt = new Date();
    this.generatedModels.set(id, model);
    return model;
  }

  async rejectModel(id: string): Promise<GeneratedModel> {
    const model = await this.getModel(id);
    if (model.status !== "draft" && model.status !== "reviewing") {
      throw new BadRequestException(
        `Cannot reject model in "${model.status}" status`
      );
    }
    this.generatedModels.delete(id);
    return model;
  }

  async publishModel(id: string): Promise<GeneratedModel> {
    const model = await this.getModel(id);
    if (model.status !== "reviewing" && model.status !== "approved") {
      throw new BadRequestException(
        `Cannot publish model in "${model.status}" status`
      );
    }
    model.status = "published";
    this.generatedModels.set(id, model);
    return model;
  }

  async updateDimension(
    id: string,
    dimIndex: number,
    updates: { description?: string; suggestedAs?: string; name?: string }
  ): Promise<GeneratedModel> {
    const model = await this.getModel(id);
    if (dimIndex < 0 || dimIndex >= model.dimensions.length) {
      throw new BadRequestException(`Invalid dimension index ${dimIndex}`);
    }
    const dim = model.dimensions[dimIndex];
    if (updates.description !== undefined) dim.description = updates.description;
    if (updates.suggestedAs !== undefined)
      dim.suggestedAs = updates.suggestedAs as GeneratedDimension["suggestedAs"];
    if (updates.name !== undefined) dim.name = updates.name;
    this.generatedModels.set(id, model);
    return model;
  }

  async updateMeasure(
    id: string,
    measIndex: number,
    updates: { description?: string; aggregation?: string; format?: string; name?: string }
  ): Promise<GeneratedModel> {
    const model = await this.getModel(id);
    if (measIndex < 0 || measIndex >= model.measures.length) {
      throw new BadRequestException(`Invalid measure index ${measIndex}`);
    }
    const meas = model.measures[measIndex];
    if (updates.description !== undefined) meas.description = updates.description;
    if (updates.aggregation !== undefined)
      meas.aggregation = updates.aggregation as GeneratedMeasure["aggregation"];
    if (updates.format !== undefined)
      meas.format = updates.format as GeneratedMeasure["format"];
    if (updates.name !== undefined) meas.name = updates.name;
    this.generatedModels.set(id, model);
    return model;
  }

  async getGenerationStats(connectionId?: string): Promise<{
    total: number;
    draft: number;
    reviewing: number;
    approved: number;
    published: number;
  }> {
    const models = await this.listModels(connectionId);
    return {
      total: models.length,
      draft: models.filter((m) => m.status === "draft").length,
      reviewing: models.filter((m) => m.status === "reviewing").length,
      approved: models.filter((m) => m.status === "approved").length,
      published: models.filter((m) => m.status === "published").length,
    };
  }
}
