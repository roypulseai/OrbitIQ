import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

interface RelationshipRecord {
  id: string;
  modelId: string;
  name: string;
  fromTableId: string;
  fromColumnId: string;
  toTableId: string;
  toColumnId: string;
  cardinality: string;
  joinType?: string;
  isActive: boolean;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface RelationshipSuggestion {
  fromTable: string;
  fromColumn: string;
  toTable: string;
  toColumn: string;
  suggestedCardinality: string;
  confidence: number;
  reason: string;
}

@Injectable()
export class RelationshipsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByModel(modelId: string): Promise<RelationshipRecord[]> {
    return this.prisma.relationship.findMany({ where: { modelId } }) as any;
  }

  async findOne(id: string): Promise<RelationshipRecord> {
    const rel = await this.prisma.relationship.findUnique({ where: { id } });
    if (!rel) throw new NotFoundException(`Relationship ${id} not found`);
    return rel as any;
  }

  async create(input: {
    modelId: string;
    name: string;
    fromTableId: string;
    fromColumnId: string;
    toTableId: string;
    toColumnId: string;
    cardinality: string;
    joinType?: string;
    description?: string;
  }): Promise<RelationshipRecord> {
    return this.prisma.relationship.create({
      data: {
        modelId: input.modelId,
        fromTableId: input.fromTableId,
        toTableId: input.toTableId,
        cardinality: input.cardinality,
        joinExpr: input.joinType || "LEFT JOIN",
      },
    }) as any;
  }

  async update(
    id: string,
    input: {
      name?: string;
      cardinality?: string;
      joinType?: string;
      isActive?: boolean;
      description?: string;
    }
  ): Promise<RelationshipRecord> {
    await this.findOne(id);
    return this.prisma.relationship.update({
      where: { id },
      data: {
        ...(input.cardinality && { cardinality: input.cardinality }),
        ...(input.joinType && { joinExpr: input.joinType }),
      },
    }) as any;
  }

  async delete(id: string): Promise<boolean> {
    await this.findOne(id);
    await this.prisma.relationship.delete({ where: { id } });
    return true;
  }

  async suggestRelationships(
    modelId: string,
    tables: { id: string; name: string; columns: { id: string; name: string }[] }[]
  ): Promise<RelationshipSuggestion[]> {
    const suggestions: RelationshipSuggestion[] = [];

    for (let i = 0; i < tables.length; i++) {
      for (let j = i + 1; j < tables.length; j++) {
        const tableA = tables[i];
        const tableB = tables[j];

        for (const colA of tableA.columns) {
          for (const colB of tableB.columns) {
            const suggestion = this.analyzeColumnPair(
              tableA.name, colA.name, tableB.name, colB.name
            );
            if (suggestion) suggestions.push(suggestion);
          }
        }
      }
    }

    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  private analyzeColumnPair(
    tableA: string, colA: string, tableB: string, colB: string
  ): RelationshipSuggestion | null {
    const colALower = colA.toLowerCase();
    const colBLower = colB.toLowerCase();

    if (colALower === colBLower) {
      const isForeignKey = colALower.endsWith("_id");
      return {
        fromTable: tableA, fromColumn: colA, toTable: tableB, toColumn: colB,
        suggestedCardinality: "N:1",
        confidence: isForeignKey ? 0.9 : 0.7,
        reason: isForeignKey ? "Column names match and appear to be foreign keys" : "Column names match exactly",
      };
    }

    if (colALower.endsWith("_id") && colBLower === "id") {
      const baseName = colALower.replace("_id", "");
      if (tableB.toLowerCase().includes(baseName) || baseName.includes(tableB.toLowerCase().replace(/s$/, ""))) {
        return {
          fromTable: tableA, fromColumn: colA, toTable: tableB, toColumn: colB,
          suggestedCardinality: "N:1", confidence: 0.85,
          reason: `Foreign key pattern detected: ${colA} likely references ${tableB}.id`,
        };
      }
    }

    if (colBLower.endsWith("_id") && colALower === "id") {
      const baseName = colBLower.replace("_id", "");
      if (tableA.toLowerCase().includes(baseName) || baseName.includes(tableA.toLowerCase().replace(/s$/, ""))) {
        return {
          fromTable: tableB, fromColumn: colB, toTable: tableA, toColumn: colA,
          suggestedCardinality: "N:1", confidence: 0.85,
          reason: `Foreign key pattern detected: ${colB} likely references ${tableA}.id`,
        };
      }
    }

    if (colALower.includes(colBLower) || colBLower.includes(colALower)) {
      return {
        fromTable: tableA, fromColumn: colA, toTable: tableB, toColumn: colB,
        suggestedCardinality: "1:N", confidence: 0.6,
        reason: `Column names are similar: ${colA} and ${colB}`,
      };
    }

    return null;
  }

  async buildJoinSQL(
    relationships: RelationshipRecord[],
    tables: { alias: string; name: string }[]
  ): Promise<string> {
    if (relationships.length === 0) return "";

    const joins: string[] = [];
    for (const rel of relationships) {
      const fromTable = tables.find((t) => t.alias === rel.fromTableId || t.name === rel.fromTableId);
      const toTable = tables.find((t) => t.alias === rel.toTableId || t.name === rel.toTableId);

      if (fromTable && toTable) {
        const joinType = rel.joinType || "LEFT JOIN";
        joins.push(
          `${joinType} "${toTable.name}" AS "${toTable.alias}" ON "${fromTable.alias}"."${rel.fromColumnId}" = "${toTable.alias}"."${rel.toColumnId}"`
        );
      }
    }

    return joins.join("\n");
  }
}
