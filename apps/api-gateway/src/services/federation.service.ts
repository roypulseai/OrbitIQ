import { Injectable } from "@nestjs/common";

export interface FederationEngine {
  id: string;
  name: string;
  type: "duckdb" | "trino" | "clickhouse" | "postgres";
  status: "active" | "inactive" | "error";
  endpoints: string[];
  capabilities: string[];
  maxConnections: number;
  activeConnections: number;
  avgLatencyMs: number;
  queriesProcessed: number;
}

export interface QueryResult {
  columns: { name: string; type: string; nullable: boolean }[];
  rows: Record<string, any>[];
  rowCount: number;
  executionTimeMs: number;
}

export interface FederatedQuery {
  id: string;
  query: string;
  engine: string;
  status: "pending" | "executing" | "completed" | "failed";
  result?: QueryResult;
  executionTimeMs: number;
  cachedAt?: number;
  cacheHit: boolean;
}

export interface QueryPlanCacheEntry {
  id: string;
  queryHash: string;
  engine: string;
  plan: string;
  resultPreview: string;
  hitCount: number;
  lastAccessed: Date;
  expiresAt: Date;
}

export interface EngineSelection {
  recommendedEngine: string;
  reason: string;
  estimatedLatencyMs: number;
  estimatedCost: number;
}

export interface CacheStats {
  totalQueries: number;
  cacheHits: number;
  cacheMisses: number;
  hitRate: number;
  totalCachedPlans: number;
}

export interface EngineHealth {
  engineId: string;
  engineName: string;
  status: string;
  avgLatencyMs: number;
  uptimePercent: number;
  queriesLast24h: number;
}

@Injectable()
export class FederationService {
  private engines: FederationEngine[] = [];
  private queries: FederatedQuery[] = [];
  private queryCache: QueryPlanCacheEntry[] = [];
  private totalExecuted = 0;
  private cacheHits = 0;
  private cacheMisses = 0;

  constructor() {
    this.seedData();
  }

  private seedData(): void {
    this.engines = [
      {
        id: "engine-duckdb-001",
        name: "DuckDB Local",
        type: "duckdb",
        status: "active",
        endpoints: ["localhost:8080"],
        capabilities: ["columnar-processing", "in-memory-analytics", "parquet", "csv", "json"],
        maxConnections: 50,
        activeConnections: 12,
        avgLatencyMs: 25,
        queriesProcessed: 12500,
      },
      {
        id: "engine-trino-001",
        name: "Trino Cluster",
        type: "trino",
        status: "active",
        endpoints: ["trino-primary:8443", "trino-worker-1:8443", "trino-worker-2:8443"],
        capabilities: ["distributed-query", "federation", "cross-catalog-join", "iceberg", "hudi"],
        maxConnections: 200,
        activeConnections: 45,
        avgLatencyMs: 180,
        queriesProcessed: 4200,
      },
      {
        id: "engine-clickhouse-001",
        name: "ClickHouse Analytics",
        type: "clickhouse",
        status: "active",
        endpoints: ["clickhouse-node1:9000", "clickhouse-node2:9000"],
        capabilities: ["real-time-streaming", "time-series", "high-cardinality", "materialized-views"],
        maxConnections: 100,
        activeConnections: 28,
        avgLatencyMs: 35,
        queriesProcessed: 8900,
      },
    ];

    this.queryCache = [
      {
        id: "cache-001",
        queryHash: "a1b2c3d4",
        engine: "duckdb",
        plan: "SeqScan → HashAggregate → Projection",
        resultPreview: "SELECT region, SUM(revenue) FROM sales GROUP BY region → 8 rows",
        hitCount: 3,
        lastAccessed: new Date(Date.now() - 3600000),
        expiresAt: new Date(Date.now() + 7200000),
      },
      {
        id: "cache-002",
        queryHash: "e5f6g7h8",
        engine: "trino",
        plan: "DistributedJoin → Filter → Sort → Limit",
        resultPreview: "Multi-join across sales + customers + products → 1240 rows",
        hitCount: 2,
        lastAccessed: new Date(Date.now() - 7200000),
        expiresAt: new Date(Date.now() + 3600000),
      },
      {
        id: "cache-003",
        queryHash: "i9j0k1l2",
        engine: "clickhouse",
        plan: "MergeTree → AggregationMerge → Final",
        resultPreview: "Real-time events aggregation → 48 time buckets",
        hitCount: 5,
        lastAccessed: new Date(Date.now() - 1800000),
        expiresAt: new Date(Date.now() + 5400000),
      },
      {
        id: "cache-004",
        queryHash: "m3n4o5p6",
        engine: "duckdb",
        plan: "IndexScan → Projection",
        resultPreview: "Single-table SELECT with WHERE → 156 rows",
        hitCount: 8,
        lastAccessed: new Date(Date.now() - 900000),
        expiresAt: new Date(Date.now() + 9000000),
      },
    ];

    this.totalExecuted = 25600;
    this.cacheHits = 18;
    this.cacheMisses = 7;
  }

  getEngines(): FederationEngine[] {
    return this.engines;
  }

  getEngine(id: string): FederationEngine | undefined {
    return this.engines.find((e) => e.id === id);
  }

  executeFederatedQuery(query: string, targetEngine?: string): FederatedQuery {
    const selection = targetEngine
      ? { recommendedEngine: targetEngine, reason: "User-specified engine", estimatedLatencyMs: 50, estimatedCost: 1.0 }
      : this.autoSelectEngine(query);

    const cached = this.queryCache.find(
      (c) => c.engine === selection.recommendedEngine && query.includes(c.resultPreview.split("→")[0].trim())
    );
    const cacheHit = !!cached;

    const execTime = cacheHit
      ? Math.round(selection.estimatedLatencyMs * 0.15)
      : selection.estimatedLatencyMs + Math.round(Math.random() * 30);

    const result: QueryResult = {
      columns: [
        { name: "region", type: "varchar", nullable: false },
        { name: "total_revenue", type: "float8", nullable: false },
        { name: "order_count", type: "int8", nullable: false },
      ],
      rows: [
        { region: "North America", total_revenue: 2847500.5, order_count: 14230 },
        { region: "Europe", total_revenue: 1923100.75, order_count: 9870 },
        { region: "Asia Pacific", total_revenue: 1456200.3, order_count: 7650 },
        { region: "Latin America", total_revenue: 834100.2, order_count: 4320 },
      ],
      rowCount: 4,
      executionTimeMs: execTime,
    };

    const federatedQuery: FederatedQuery = {
      id: `fq-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      query,
      engine: selection.recommendedEngine,
      status: "completed",
      result,
      executionTimeMs: execTime,
      cacheHit,
    };

    if (!cacheHit) {
      this.cacheMisses++;
      const newEntry: QueryPlanCacheEntry = {
        id: `cache-${Date.now()}`,
        queryHash: Math.random().toString(36).slice(2, 10),
        engine: selection.recommendedEngine,
        plan: "SeqScan → HashAggregate → Projection",
        resultPreview: `${query.slice(0, 60)}... → ${result.rowCount} rows`,
        hitCount: 1,
        lastAccessed: new Date(),
        expiresAt: new Date(Date.now() + 3600000),
      };
      this.queryCache.push(newEntry);
    } else {
      this.cacheHits++;
      cached.hitCount++;
      cached.lastAccessed = new Date();
    }

    this.totalExecuted++;
    this.queries.unshift(federatedQuery);
    return federatedQuery;
  }

  autoSelectEngine(query: string): EngineSelection {
    const lowerQuery = query.toLowerCase();
    const joinCount = (lowerQuery.match(/\bjoin\b/g) || []).length;
    const hasStreamingKeywords = /\b(stream|real[- ]?time|event|live|kafka)\b/.test(lowerQuery);
    const isSingleSource = /\bfrom\s+\w+\s*$/.test(lowerQuery.trim().replace(/;$/, ""));

    if (hasStreamingKeywords) {
      return {
        recommendedEngine: "clickhouse",
        reason: "Query contains streaming/real-time keywords — ClickHouse optimized for high-throughput analytics",
        estimatedLatencyMs: 35,
        estimatedCost: 1.2,
      };
    }

    if (isSingleSource && joinCount === 0) {
      return {
        recommendedEngine: "duckdb",
        reason: "Single-source query — DuckDB provides fastest local execution",
        estimatedLatencyMs: 25,
        estimatedCost: 0.3,
      };
    }

    if (joinCount <= 2) {
      return {
        recommendedEngine: "duckdb",
        reason: `Simple query (${joinCount} join${joinCount !== 1 ? "s" : ""}) — DuckDB handles efficiently`,
        estimatedLatencyMs: 30,
        estimatedCost: 0.5,
      };
    }

    if (joinCount > 3) {
      return {
        recommendedEngine: "trino",
        reason: `Complex query (${joinCount} joins) — Trino distributed engine recommended`,
        estimatedLatencyMs: 180,
        estimatedCost: 2.5,
      };
    }

    return {
      recommendedEngine: "duckdb",
      reason: "Moderate complexity — DuckDB with columnar processing",
      estimatedLatencyMs: 40,
      estimatedCost: 0.7,
    };
  }

  getQueryCache(): QueryPlanCacheEntry[] {
    return this.queryCache;
  }

  invalidateCache(id: string): boolean {
    const idx = this.queryCache.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    this.queryCache.splice(idx, 1);
    return true;
  }

  clearCache(): number {
    const count = this.queryCache.length;
    this.queryCache = [];
    return count;
  }

  getCacheStats(): CacheStats {
    const total = this.cacheHits + this.cacheMisses;
    return {
      totalQueries: this.totalExecuted,
      cacheHits: this.cacheHits,
      cacheMisses: this.cacheMisses,
      hitRate: total > 0 ? Math.round((this.cacheHits / total) * 10000) / 100 : 0,
      totalCachedPlans: this.queryCache.length,
    };
  }

  getEngineHealth(): EngineHealth[] {
    return this.engines.map((e) => ({
      engineId: e.id,
      engineName: e.name,
      status: e.status,
      avgLatencyMs: e.avgLatencyMs,
      uptimePercent: e.status === "active" ? 99.9 : e.status === "error" ? 87.5 : 0,
      queriesLast24h: Math.round(e.queriesProcessed * 0.08),
    }));
  }
}
