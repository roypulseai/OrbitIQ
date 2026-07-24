import { Injectable, NotFoundException } from "@nestjs/common";

export interface InferredRelationship {
  id: string;
  sourceTable: string;
  sourceColumn: string;
  targetTable: string;
  targetColumn: string;
  confidence: number;
  evidence: string[];
  method: "fk_declaration" | "name_similarity" | "value_overlap" | "cardinality_match" | "knowledge_graph";
  cardinality: "1:1" | "1:N" | "N:N" | "N:1";
  status: "proposed" | "approved" | "rejected" | "needs_review";
  createdAt: Date;
  reviewedAt?: Date;
}

export interface InferenceJob {
  id: string;
  connectionId: string;
  status: "pending" | "running" | "completed" | "failed";
  startedAt: Date;
  finishedAt?: Date;
  tablesScanned: number;
  relationshipsFound: number;
  relationshipsApproved: number;
}

export interface InferenceStats {
  totalProposed: number;
  approved: number;
  rejected: number;
  needsReview: number;
  pendingReview: number;
}

@Injectable()
export class RelationshipInferenceService {
  private inferredRelationships: Map<string, InferredRelationship> = new Map();
  private inferenceJobs: Map<string, InferenceJob> = new Map();

  constructor() {
    this.seedMockData();
  }

  // ─── Job Operations ──────────────────────────────────────────────────────

  startInference(connectionId: string, tableNames: string[]): InferenceJob {
    const job: InferenceJob = {
      id: crypto.randomUUID(),
      connectionId,
      status: "completed",
      startedAt: new Date(),
      finishedAt: new Date(),
      tablesScanned: tableNames.length,
      relationshipsFound: 0,
      relationshipsApproved: 0,
    };

    const newRelationships = this.generateInferences(connectionId, tableNames);
    job.relationshipsFound = newRelationships.length;
    job.relationshipsApproved = newRelationships.filter((r) => r.status === "approved").length;

    for (const rel of newRelationships) {
      this.inferredRelationships.set(rel.id, rel);
    }

    this.inferenceJobs.set(job.id, job);
    return job;
  }

  getJob(id: string): InferenceJob {
    const job = this.inferenceJobs.get(id);
    if (!job) throw new NotFoundException(`Inference job ${id} not found`);
    return job;
  }

  listJobs(connectionId: string): InferenceJob[] {
    return Array.from(this.inferenceJobs.values()).filter(
      (j) => j.connectionId === connectionId
    );
  }

  // ─── Relationship Operations ─────────────────────────────────────────────

  getRelationships(jobId: string): InferredRelationship[] {
    return Array.from(this.inferredRelationships.values()).filter(
      (r) => r.createdAt !== undefined
    );
  }

  getRelationship(id: string): InferredRelationship {
    const rel = this.inferredRelationships.get(id);
    if (!rel) throw new NotFoundException(`Inferred relationship ${id} not found`);
    return rel;
  }

  approveRelationship(id: string): InferredRelationship {
    const rel = this.getRelationship(id);
    const updated: InferredRelationship = {
      ...rel,
      status: "approved",
      reviewedAt: new Date(),
    };
    this.inferredRelationships.set(id, updated);
    return updated;
  }

  rejectRelationship(id: string): InferredRelationship {
    const rel = this.getRelationship(id);
    const updated: InferredRelationship = {
      ...rel,
      status: "rejected",
      reviewedAt: new Date(),
    };
    this.inferredRelationships.set(id, updated);
    return updated;
  }

  updateRelationship(
    id: string,
    updates: Partial<Pick<InferredRelationship, "status" | "cardinality" | "confidence">>
  ): InferredRelationship {
    const rel = this.getRelationship(id);
    const updated: InferredRelationship = {
      ...rel,
      ...Object.fromEntries(Object.entries(updates).filter(([, v]) => v !== undefined)),
      reviewedAt: new Date(),
    };
    this.inferredRelationships.set(id, updated);
    return updated;
  }

  // ─── Stats ──────────────────────────────────────────────────────────────

  getInferenceStats(connectionId: string): InferenceStats {
    const allRels = Array.from(this.inferredRelationships.values());
    return {
      totalProposed: allRels.length,
      approved: allRels.filter((r) => r.status === "approved").length,
      rejected: allRels.filter((r) => r.status === "rejected").length,
      needsReview: allRels.filter((r) => r.status === "needs_review").length,
      pendingReview: allRels.filter((r) => r.status === "proposed").length,
    };
  }

  // ─── Inference Logic (Mock) ─────────────────────────────────────────────

  private generateInferences(connectionId: string, tableNames: string[]): InferredRelationship[] {
    const results: InferredRelationship[] = [];

    for (let i = 0; i < tableNames.length; i++) {
      for (let j = i + 1; j < tableNames.length; j++) {
        const tableA = tableNames[i];
        const tableB = tableNames[j];

        // FK declaration heuristic: column name ending in _id matching table name
        const fkResult = this.detectFKPattern(tableA, tableB);
        if (fkResult) {
          results.push(fkResult);
          continue;
        }

        // Name similarity heuristic
        const nameResult = this.detectNameSimilarity(tableA, tableB);
        if (nameResult) {
          results.push(nameResult);
          continue;
        }

        // Value overlap heuristic
        const overlapResult = this.detectValueOverlap(tableA, tableB);
        if (overlapResult) {
          results.push(overlapResult);
        }
      }
    }

    return results;
  }

  private detectFKPattern(
    sourceTable: string,
    targetTable: string
  ): InferredRelationship | null {
    const singular = targetTable.replace(/s$/, "").toLowerCase();
    const fkColumn = `${singular}_id`;

    if (Math.random() > 0.5) {
      return {
        id: crypto.randomUUID(),
        sourceTable,
        sourceColumn: fkColumn,
        targetTable,
        targetColumn: "id",
        confidence: 0.85 + Math.random() * 0.14,
        evidence: [
          `Column "${fkColumn}" ends with "_id" suffix`,
          `Column name pattern matches target table "${targetTable}"`,
          `FK naming convention detected`,
        ],
        method: "fk_declaration",
        cardinality: "N:1",
        status: "proposed",
        createdAt: new Date(),
      };
    }

    return null;
  }

  private detectNameSimilarity(
    tableA: string,
    tableB: string
  ): InferredRelationship | null {
    const aLower = tableA.toLowerCase();
    const bLower = tableB.toLowerCase();

    if (aLower === bLower || aLower.includes(bLower) || bLower.includes(aLower)) {
      return {
        id: crypto.randomUUID(),
        sourceTable: tableA,
        sourceColumn: `${aLower}_id`,
        targetTable: tableB,
        targetColumn: `${bLower}_id`,
        confidence: 0.6 + Math.random() * 0.3,
        evidence: [
          `Table names "${tableA}" and "${tableB}" share common root`,
          `Column naming patterns are semantically similar`,
        ],
        method: "name_similarity",
        cardinality: "N:N",
        status: "proposed",
        createdAt: new Date(),
      };
    }

    return null;
  }

  private detectValueOverlap(
    tableA: string,
    tableB: string
  ): InferredRelationship | null {
    if (Math.random() > 0.6) {
      return null;
    }

    const overlap = 0.7 + Math.random() * 0.28;

    return {
      id: crypto.randomUUID(),
      sourceTable: tableA,
      sourceColumn: "shared_key",
      targetTable: tableB,
      targetColumn: "shared_key",
      confidence: overlap,
      evidence: [
        `Value overlap sampling: ${(overlap * 100).toFixed(1)}% of values in source column match target`,
        `Sampled 1000 random rows for overlap analysis`,
      ],
      method: "value_overlap",
      cardinality: "1:1",
      status: "proposed",
      createdAt: new Date(),
    };
  }

  // ─── Seed Mock Data ─────────────────────────────────────────────────────

  private seedMockData(): void {
    const now = new Date("2026-07-24T10:00:00Z");

    // Seed 1 completed inference job
    const job: InferenceJob = {
      id: "inf-job-001",
      connectionId: "conn-demo-001",
      status: "completed",
      startedAt: now,
      finishedAt: new Date("2026-07-24T10:00:15Z"),
      tablesScanned: 8,
      relationshipsFound: 10,
      relationshipsApproved: 4,
    };
    this.inferenceJobs.set(job.id, job);

    // Seed 10 inferred relationships
    const seedRels: Omit<InferredRelationship, "id">[] = [
      {
        sourceTable: "Orders",
        sourceColumn: "customer_id",
        targetTable: "Customers",
        targetColumn: "id",
        confidence: 0.98,
        evidence: [
          "Column 'customer_id' ends with '_id' foreign key suffix",
          "Matches target table 'Customers' (singular/plural convention)",
          "FK declaration pattern in database metadata",
        ],
        method: "fk_declaration",
        cardinality: "N:1",
        status: "approved",
        createdAt: now,
        reviewedAt: new Date("2026-07-24T10:05:00Z"),
      },
      {
        sourceTable: "Orders",
        sourceColumn: "product_id",
        targetTable: "Products",
        targetColumn: "id",
        confidence: 0.97,
        evidence: [
          "Column 'product_id' follows FK naming convention",
          "Strong name match with 'Products' table",
          "High value overlap observed in profiling data",
        ],
        method: "fk_declaration",
        cardinality: "N:N",
        status: "approved",
        createdAt: now,
        reviewedAt: new Date("2026-07-24T10:05:30Z"),
      },
      {
        sourceTable: "OrderItems",
        sourceColumn: "order_id",
        targetTable: "Orders",
        targetColumn: "id",
        confidence: 0.99,
        evidence: [
          "Column 'order_id' is a direct FK reference",
          "Orders table contains matching primary key 'id'",
          "FK declaration detected in DDL metadata",
        ],
        method: "fk_declaration",
        cardinality: "N:1",
        status: "approved",
        createdAt: now,
        reviewedAt: new Date("2026-07-24T10:06:00Z"),
      },
      {
        sourceTable: "OrderItems",
        sourceColumn: "product_id",
        targetTable: "Products",
        targetColumn: "id",
        confidence: 0.96,
        evidence: [
          "Column name 'product_id' is similar to 'Products.id'",
          "Name similarity score exceeds threshold",
          "Value distribution analysis confirms correlation",
        ],
        method: "name_similarity",
        cardinality: "N:1",
        status: "proposed",
        createdAt: now,
      },
      {
        sourceTable: "Subscriptions",
        sourceColumn: "user_id",
        targetTable: "Customers",
        targetColumn: "id",
        confidence: 0.85,
        evidence: [
          "Column 'user_id' semantically matches 'Customers' entity",
          "Knowledge graph maps 'user' and 'customer' as synonyms",
          "Cross-vertical entity resolution confidence",
        ],
        method: "name_similarity",
        cardinality: "N:1",
        status: "proposed",
        createdAt: now,
      },
      {
        sourceTable: "Payments",
        sourceColumn: "order_id",
        targetTable: "Orders",
        targetColumn: "id",
        confidence: 0.92,
        evidence: [
          "Value overlap analysis: 92.3% of payment order_ids found in Orders",
          "Sampled 5000 payment records for cross-reference",
          "Low null rate in foreign column supports FK relationship",
        ],
        method: "value_overlap",
        cardinality: "1:1",
        status: "needs_review",
        createdAt: now,
      },
      {
        sourceTable: "Reviews",
        sourceColumn: "product_id",
        targetTable: "Products",
        targetColumn: "id",
        confidence: 0.88,
        evidence: [
          "Value overlap: 88.7% of review product_ids match Products.id",
          "Sampling analysis across 2000 review records",
          "Some orphan records detected (products removed from catalog)",
        ],
        method: "value_overlap",
        cardinality: "N:N",
        status: "proposed",
        createdAt: now,
      },
      {
        sourceTable: "Reviews",
        sourceColumn: "customer_id",
        targetTable: "Customers",
        targetColumn: "id",
        confidence: 0.82,
        evidence: [
          "Knowledge graph identifies 'customer' as related entity to 'review'",
          "Typical review-to-customer relationship in retail vertical",
          "Cardinality analysis supports N:1 pattern",
        ],
        method: "knowledge_graph",
        cardinality: "N:1",
        status: "proposed",
        createdAt: now,
      },
      {
        sourceTable: "Inventory",
        sourceColumn: "product_id",
        targetTable: "Products",
        targetColumn: "id",
        confidence: 0.94,
        evidence: [
          "Unique value ratio analysis: 1:1 cardinality between Inventory and Products",
          "Every inventory record maps to exactly one product",
          "Cardinality match method confirms relationship strength",
        ],
        method: "cardinality_match",
        cardinality: "1:1",
        status: "approved",
        createdAt: now,
        reviewedAt: new Date("2026-07-24T10:07:00Z"),
      },
      {
        sourceTable: "Subscriptions",
        sourceColumn: "plan_id",
        targetTable: "Plans",
        targetColumn: "id",
        confidence: 0.90,
        evidence: [
          "Knowledge graph suggests 'plan' entity relationship",
          "FK naming convention 'plan_id' detected",
          "Plans table not present in current connection scope",
        ],
        method: "knowledge_graph",
        cardinality: "N:1",
        status: "rejected",
        createdAt: now,
        reviewedAt: new Date("2026-07-24T10:08:00Z"),
      },
    ];

    for (const def of seedRels) {
      const rel: InferredRelationship = { id: crypto.randomUUID(), ...def };
      this.inferredRelationships.set(rel.id, rel);
    }
  }
}
