import { Injectable } from "@nestjs/common";

export interface AggregateTable {
  id: string;
  name: string;
  sourceTable: string;
  dimensions: string[];
  measures: string[];
  refreshInterval: string;
  lastRefreshed: Date;
  rowCount: number;
  sizeBytes: number;
  status: string;
}

export interface CDCPipeline {
  id: string;
  name: string;
  sourceType: string;
  status: string;
  tables: string[];
  lastLagMs: number;
  eventsProcessed: number;
  errorsCount: number;
  createdAt: Date;
}

export interface StreamingSource {
  id: string;
  name: string;
  type: string;
  status: string;
  throughputPerSec: number;
  latencyMs: number;
  topicsCount: number;
  partitionsCount: number;
}

export interface LoadTestResult {
  p50LatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  maxLatencyMs: number;
  throughputPerSec: number;
  errorRate: number;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
}

export interface LoadTest {
  id: string;
  name: string;
  status: string;
  concurrentUsers: number;
  durationSeconds: number;
  targetP95LatencyMs: number;
  result?: LoadTestResult;
  createdAt: Date;
}

@Injectable()
export class PerformanceService {
  private aggregates: AggregateTable[] = [
    {
      id: "agg_1",
      name: "daily_sales_agg",
      sourceTable: "orders",
      dimensions: ["date", "region"],
      measures: ["revenue", "order_count"],
      refreshInterval: "hourly",
      lastRefreshed: new Date("2026-07-24T10:00:00Z"),
      rowCount: 45200,
      sizeBytes: 12_500_000,
      status: "active",
    },
    {
      id: "agg_2",
      name: "monthly_customer_agg",
      sourceTable: "customers",
      dimensions: ["month", "segment"],
      measures: ["count", "avg_ltv"],
      refreshInterval: "daily",
      lastRefreshed: new Date("2026-07-24T06:00:00Z"),
      rowCount: 8400,
      sizeBytes: 3_200_000,
      status: "active",
    },
    {
      id: "agg_3",
      name: "hourly_events_agg",
      sourceTable: "events",
      dimensions: ["hour", "event_type"],
      measures: ["count", "unique_users"],
      refreshInterval: "hourly",
      lastRefreshed: new Date("2026-07-24T11:00:00Z"),
      rowCount: 120_000,
      sizeBytes: 28_000_000,
      status: "active",
    },
    {
      id: "agg_4",
      name: "weekly_product_agg",
      sourceTable: "products",
      dimensions: ["week", "category"],
      measures: ["units_sold", "revenue"],
      refreshInterval: "weekly",
      lastRefreshed: new Date("2026-07-17T06:00:00Z"),
      rowCount: 2100,
      sizeBytes: 800_000,
      status: "stale",
    },
  ];

  private cdcPipelines: CDCPipeline[] = [
    {
      id: "cdc_1",
      name: "PostgreSQL → Warehouse",
      sourceType: "postgres",
      status: "running",
      tables: ["orders", "customers", "products"],
      lastLagMs: 12,
      eventsProcessed: 1_200_000,
      errorsCount: 3,
      createdAt: new Date("2026-06-01T00:00:00Z"),
    },
    {
      id: "cdc_2",
      name: "MySQL → ClickHouse",
      sourceType: "mysql",
      status: "running",
      tables: ["events", "sessions", "page_views"],
      lastLagMs: 45,
      eventsProcessed: 890_000,
      errorsCount: 12,
      createdAt: new Date("2026-06-15T00:00:00Z"),
    },
    {
      id: "cdc_3",
      name: "SQL Server → Analytics",
      sourceType: "sqlserver",
      status: "paused",
      tables: ["transactions", "accounts"],
      lastLagMs: 0,
      eventsProcessed: 450_000,
      errorsCount: 0,
      createdAt: new Date("2026-07-01T00:00:00Z"),
    },
  ];

  private streamingSources: StreamingSource[] = [
    {
      id: "ss_1",
      name: "ClickHouse Analytics",
      type: "clickhouse",
      status: "active",
      throughputPerSec: 15000,
      latencyMs: 8,
      topicsCount: 12,
      partitionsCount: 48,
    },
    {
      id: "ss_2",
      name: "Apache Pinot Realtime",
      type: "pinot",
      status: "active",
      throughputPerSec: 8500,
      latencyMs: 15,
      topicsCount: 6,
      partitionsCount: 24,
    },
  ];

  private loadTests: LoadTest[] = [
    {
      id: "lt_1",
      name: "Pre-GA Load Test",
      status: "completed",
      concurrentUsers: 1000,
      durationSeconds: 300,
      targetP95LatencyMs: 300,
      result: {
        p50LatencyMs: 85,
        p95LatencyMs: 180,
        p99LatencyMs: 290,
        maxLatencyMs: 420,
        throughputPerSec: 4500,
        errorRate: 0.2,
        totalRequests: 1_350_000,
        successfulRequests: 1_347_300,
        failedRequests: 2700,
      },
      createdAt: new Date("2026-07-10T00:00:00Z"),
    },
    {
      id: "lt_2",
      name: "NFR Compliance Test",
      status: "completed",
      concurrentUsers: 10000,
      durationSeconds: 600,
      targetP95LatencyMs: 300,
      result: {
        p50LatencyMs: 120,
        p95LatencyMs: 245,
        p99LatencyMs: 380,
        maxLatencyMs: 650,
        throughputPerSec: 12000,
        errorRate: 0.8,
        totalRequests: 7_200_000,
        successfulRequests: 7_142_400,
        failedRequests: 57_600,
      },
      createdAt: new Date("2026-07-18T00:00:00Z"),
    },
  ];

  getAggregateTables(): AggregateTable[] {
    return this.aggregates;
  }

  getAggregateTable(id: string): AggregateTable | undefined {
    return this.aggregates.find((a) => a.id === id);
  }

  refreshAggregate(id: string): AggregateTable | null {
    const agg = this.aggregates.find((a) => a.id === id);
    if (!agg) return null;
    agg.lastRefreshed = new Date();
    agg.status = "active";
    return agg;
  }

  getCDCPipelines(): CDCPipeline[] {
    return this.cdcPipelines;
  }

  getCDCPipeline(id: string): CDCPipeline | undefined {
    return this.cdcPipelines.find((p) => p.id === id);
  }

  pauseCDC(id: string): CDCPipeline | null {
    const p = this.cdcPipelines.find((c) => c.id === id);
    if (!p) return null;
    p.status = p.status === "running" ? "paused" : "running";
    return p;
  }

  getStreamingSources(): StreamingSource[] {
    return this.streamingSources;
  }

  getLoadTests(): LoadTest[] {
    return this.loadTests;
  }

  getLoadTest(id: string): LoadTest | undefined {
    return this.loadTests.find((l) => l.id === id);
  }

  getPerformanceDashboard() {
    return {
      aggregateHitRate: 78.5,
      avgCDCPipelinesLagMs: 28,
      totalEventsProcessed: this.cdcPipelines.reduce(
        (sum, p) => sum + p.eventsProcessed,
        0
      ),
      totalLoadTestRequests: this.loadTests.reduce(
        (sum, l) => sum + (l.result?.totalRequests || 0),
        0
      ),
      streamingThroughput: this.streamingSources.reduce(
        (sum, s) => sum + s.throughputPerSec,
        0
      ),
      activeAggregates: this.aggregates.filter((a) => a.status === "active")
        .length,
      activeCDCPipelines: this.cdcPipelines.filter(
        (p) => p.status === "running"
      ).length,
      activeStreamingSources: this.streamingSources.filter(
        (s) => s.status === "active"
      ).length,
    };
  }
}
