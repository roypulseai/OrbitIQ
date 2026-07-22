import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";

interface RelationshipRecord {
  id: string;
  modelId: string;
  name: string;
  fromTableId: string;
  fromColumnId: string;
  toTableId: string;
  toColumnId: string;
  cardinality: "1:1" | "1:N" | "N:1" | "N:N";
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
  suggestedCardinality: "1:1" | "1:N" | "N:1" | "N:N";
  confidence: number;
  reason: string;
}

@Injectable()
export class RelationshipsService {
  private relationships: Map<string, RelationshipRecord> = new Map();

  async findAllByModel(modelId: string): Promise<RelationshipRecord[]> {
    return Array.from(this.relationships.values()).filter(
      (r) => r.modelId === modelId
    );
  }

  async findOne(id: string): Promise<RelationshipRecord> {
    const relationship = this.relationships.get(id);
    if (!relationship) {
      throw new NotFoundException(`Relationship ${id} not found`);
    }
    return relationship;
  }

  async create(input: {
    modelId: string;
    name: string;
    fromTableId: string;
    fromColumnId: string;
    toTableId: string;
    toColumnId: string;
    cardinality: "1:1" | "1:N" | "N:1" | "N:N";
    joinType?: string;
    description?: string;
  }): Promise<RelationshipRecord> {
    const relationship: RelationshipRecord = {
      id: crypto.randomUUID(),
      ...input,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.relationships.set(relationship.id, relationship);
    return relationship;
  }

  async update(
    id: string,
    input: {
      name?: string;
      cardinality?: "1:1" | "1:N" | "N:1" | "N:N";
      joinType?: string;
      isActive?: boolean;
      description?: string;
    }
  ): Promise<RelationshipRecord> {
    const relationship = await this.findOne(id);
    const updated = {
      ...relationship,
      ...input,
      updatedAt: new Date(),
    };
    this.relationships.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    await this.findOne(id);
    this.relationships.delete(id);
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
              tableA.name,
              colA.name,
              tableB.name,
              colB.name
            );
            if (suggestion) {
              suggestions.push(suggestion);
            }
          }
        }
      }
    }

    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  private analyzeColumnPair(
    tableA: string,
    colA: string,
    tableB: string,
    colB: string
  ): RelationshipSuggestion | null {
    const colALower = colA.toLowerCase();
    const colBLower = colB.toLowerCase();

    // Exact name match (e.g., user_id in both tables)
    if (colALower === colBLower) {
      const isForeignKey = colALower.endsWith("_id");
      const confidence = isForeignKey ? 0.9 : 0.7;

      return {
        fromTable: tableA,
        fromColumn: colA,
        toTable: tableB,
        toColumn: colB,
        suggestedCardinality: "N:1",
        confidence,
        reason: isForeignKey
          ? `Column names match and appear to be foreign keys`
          : `Column names match exactly`,
      };
    }

    // Foreign key pattern (e.g., user_id in orders matches id in users)
    if (colALower.endsWith("_id") && colBLower === "id") {
      const baseName = colALower.replace("_id", "");
      if (tableB.toLowerCase().includes(baseName) || baseName.includes(tableB.toLowerCase().replace(/s$/, ""))) {
        return {
          fromTable: tableA,
          fromColumn: colA,
          toTable: tableB,
          toColumn: colB,
          suggestedCardinality: "N:1",
          confidence: 0.85,
          reason: `Foreign key pattern detected: ${colA} likely references ${tableB}.id`,
        };
      }
    }

    if (colBLower.endsWith("_id") && colALower === "id") {
      const baseName = colBLower.replace("_id", "");
      if (tableA.toLowerCase().includes(baseName) || baseName.includes(tableA.toLowerCase().replace(/s$/, ""))) {
        return {
          fromTable: tableB,
          fromColumn: colB,
          toTable: tableA,
          toColumn: colA,
          suggestedCardinality: "N:1",
          confidence: 0.85,
          reason: `Foreign key pattern detected: ${colB} likely references ${tableA}.id`,
        };
      }
    }

    // Similar name patterns (e.g., customer_id and customer_id)
    if (colALower.includes(colBLower) || colBLower.includes(colALower)) {
      return {
        fromTable: tableA,
        fromColumn: colA,
        toTable: tableB,
        toColumn: colB,
        suggestedCardinality: "1:N",
        confidence: 0.6,
        reason: `Column names are similar: ${colA} and ${colB}`,
      };
    }

    return null;
  }

  async buildJoinSQL(
    relationships: RelationshipRecord[],
    tables: { alias: string; name: string }[]
  ): Promise<string> {
    if (relationships.length === 0) {
      return "";
    }

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
