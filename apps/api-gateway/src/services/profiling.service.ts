import { Injectable, NotFoundException } from "@nestjs/common";

export interface ProfilingJob {
  id: string;
  connectionId: string;
  status: "pending" | "running" | "completed" | "failed";
  startedAt: Date;
  finishedAt?: Date;
  tablesProfiled: number;
  columnsProfiled: number;
}

export interface TopValue {
  value: string;
  count: number;
  percentage: number;
}

export interface ColumnProfile {
  id: string;
  jobId: string;
  tableId: string;
  columnName: string;
  dataType: string;
  cardinality: number;
  nullCount: number;
  nullPercentage: number;
  minLength?: number;
  maxLength?: number;
  meanLength?: number;
  minValue?: string;
  maxValue?: string;
  meanValue?: number;
  percentiles?: { p25: number; p50: number; p75: number };
  topValues: TopValue[];
  detectedFormat: string;
  formatConfidence: number;
  patternRegex?: string;
  sampleValues: string[];
}

export interface TableProfile {
  id: string;
  jobId: string;
  tableId: string;
  tableName: string;
  rowCount: number;
  columnCount: number;
  columns: ColumnProfile[];
  estimatedSize?: string;
  lastModified?: Date;
}

export interface ProfilingStats {
  totalJobs: number;
  completedJobs: number;
  totalColumnsProfiled: number;
  formatDistribution: { format: string; count: number }[];
  avgNullPercentage: number;
}

@Injectable()
export class ProfilingService {
  private jobs: Map<string, ProfilingJob> = new Map();
  private columnProfiles: Map<string, ColumnProfile> = new Map();
  private tableProfiles: Map<string, TableProfile> = new Map();

  constructor() {
    this.seedMockData();
  }

  // ─── Format Detection ───────────────────────────────────────────────────

  detectFormat(value: string): { format: string; confidence: number; pattern?: string } {
    if (!value || value.trim().length === 0) {
      return { format: "unknown", confidence: 0 };
    }

    const v = value.trim();

    // Email
    if (/^[\w.-]+@[\w.-]+\.\w{2,}$/.test(v)) {
      return { format: "email", confidence: 0.98, pattern: "/^[\\w.-]+@[\\w.-]+\\.\\w{2,}$/" };
    }

    // IBAN
    if (/^[A-Z]{2}\d{2}[A-Z0-9]{4,30}$/.test(v.replace(/\s/g, ""))) {
      return { format: "iban", confidence: 0.95, pattern: "/^[A-Z]{2}\\d{2}[A-Z0-9]{4,30}$/" };
    }

    // Currency
    if (/^\$[\d,]+(\.\d{2})?$/.test(v) || /^€[\d,]+(\.\d{2})?$/.test(v) || /^£[\d,]+(\.\d{2})?$/.test(v)) {
      return { format: "currency", confidence: 0.96, pattern: "/^[$€£][\\d,]+(\\.\\d{2})?$/" };
    }

    // Phone
    if (/^[\+]?[\d\s\-\(\)]{10,}$/.test(v)) {
      return { format: "phone", confidence: 0.88, pattern: "/^[\\+]?[\\d\\s\\-\\(\\)]{10,}$/" };
    }

    // ZIP code
    if (/^\d{5}(-\d{4})?$/.test(v)) {
      return { format: "zip", confidence: 0.92, pattern: "/^\\d{5}(-\\d{4})?$/" };
    }

    // Date patterns
    if (/^\d{4}-\d{2}-\d{2}(T|\s)\d{2}:\d{2}/.test(v)) {
      return { format: "date", confidence: 0.97, pattern: "/^\\d{4}-\\d{2}-\\d{2}/" };
    }
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(v)) {
      return { format: "date", confidence: 0.94, pattern: "/^\\d{2}\\/\\d{2}\\/\\d{4}$/" };
    }
    if (/^\d{2}-\d{2}-\d{4}$/.test(v)) {
      return { format: "date", confidence: 0.90, pattern: "/^\\d{2}-\\d{2}-\\d{4}$/" };
    }

    // Country code (2 uppercase letters)
    if (/^[A-Z]{2}$/.test(v)) {
      return { format: "country_code", confidence: 0.82, pattern: "/^[A-Z]{2}$/" };
    }

    // Numeric
    if (/^-?[\d,]+(\.\d+)?$/.test(v)) {
      return { format: "numeric", confidence: 0.90, pattern: "/^-?[\\d,]+(\\.\\d+)?$/" };
    }

    // Boolean
    if (/^(true|false|yes|no|0|1)$/i.test(v)) {
      return { format: "boolean", confidence: 0.85, pattern: "/^(true|false|yes|no|0|1)$/i" };
    }

    // Default: text
    return { format: "text", confidence: 0.70 };
  }

  // ─── Job Operations ─────────────────────────────────────────────────────

  startProfiling(connectionId: string, tableIds: string[]): ProfilingJob {
    const now = new Date();
    const job: ProfilingJob = {
      id: crypto.randomUUID(),
      connectionId,
      status: "running",
      startedAt: now,
      tablesProfiled: 0,
      columnsProfiled: 0,
    };
    this.jobs.set(job.id, job);

    // Simulate profiling for each table
    for (const tableId of tableIds) {
      const tableProfile = this.generateTableProfile(job.id, tableId);
      this.tableProfiles.set(tableProfile.id, tableProfile);
      job.tablesProfiled++;
      job.columnsProfiled += tableProfile.columnCount;
      for (const col of tableProfile.columns) {
        this.columnProfiles.set(col.id, col);
      }
    }

    job.status = "completed";
    job.finishedAt = new Date();
    return job;
  }

  getJob(id: string): ProfilingJob {
    const job = this.jobs.get(id);
    if (!job) throw new NotFoundException(`Profiling job ${id} not found`);
    return job;
  }

  listJobs(connectionId?: string): ProfilingJob[] {
    const all = Array.from(this.jobs.values());
    if (connectionId) return all.filter((j) => j.connectionId === connectionId);
    return all;
  }

  getJobStatus(id: string): string {
    return this.getJob(id).status;
  }

  // ─── Table Profile ──────────────────────────────────────────────────────

  getTableProfile(jobId: string, tableId: string): TableProfile {
    const profile = Array.from(this.tableProfiles.values()).find(
      (p) => p.jobId === jobId && p.tableId === tableId
    );
    if (!profile) throw new NotFoundException(`Table profile not found for job ${jobId}, table ${tableId}`);
    return profile;
  }

  // ─── Column Profile ─────────────────────────────────────────────────────

  getColumnProfile(jobId: string, tableId: string, columnName: string): ColumnProfile {
    const profile = Array.from(this.columnProfiles.values()).find(
      (p) => p.jobId === jobId && p.tableId === tableId && p.columnName === columnName
    );
    if (!profile) throw new NotFoundException(`Column profile not found for ${tableId}.${columnName}`);
    return profile;
  }

  // ─── Stats ──────────────────────────────────────────────────────────────

  getProfilingStats(connectionId?: string): ProfilingStats {
    const jobs = this.listJobs(connectionId);
    const completedJobs = jobs.filter((j) => j.status === "completed");
    const allColumns = Array.from(this.columnProfiles.values());

    const formatCounts: Record<string, number> = {};
    let totalNullPct = 0;
    for (const col of allColumns) {
      formatCounts[col.detectedFormat] = (formatCounts[col.detectedFormat] || 0) + 1;
      totalNullPct += col.nullPercentage;
    }

    return {
      totalJobs: jobs.length,
      completedJobs: completedJobs.length,
      totalColumnsProfiled: allColumns.length,
      formatDistribution: Object.entries(formatCounts).map(([format, count]) => ({ format, count })),
      avgNullPercentage: allColumns.length > 0 ? totalNullPct / allColumns.length : 0,
    };
  }

  // ─── Mock Data Generation ───────────────────────────────────────────────

  private generateTableProfile(jobId: string, tableId: string): TableProfile {
    const tableDefs: Record<string, { name: string; rowCount: number; columns: Partial<ColumnProfile>[] }> = {
      "tbl-customers": {
        name: "Customers",
        rowCount: 48520,
        columns: [
          { columnName: "customer_id", dataType: "bigint", cardinality: 100, nullPercentage: 0, minValue: "1", maxValue: "48520", topValues: [{ value: "1", count: 1, percentage: 0.002 }], detectedFormat: "numeric" },
          { columnName: "email", dataType: "varchar(255)", cardinality: 99.4, nullPercentage: 0.5, minValue: "aaron@example.com", maxValue: "zoe@example.com", topValues: [{ value: "john@example.com", count: 3, percentage: 0.006 }], detectedFormat: "email", formatConfidence: 0.98 },
          { columnName: "first_name", dataType: "varchar(100)", cardinality: 72, nullPercentage: 0.2, minLength: 2, maxLength: 30, meanLength: 6.8, topValues: [{ value: "James", count: 412, percentage: 0.85 }], detectedFormat: "text", formatConfidence: 0.9 },
          { columnName: "last_name", dataType: "varchar(100)", cardinality: 85, nullPercentage: 0.1, minLength: 2, maxLength: 35, meanLength: 7.2, topValues: [{ value: "Smith", count: 298, percentage: 0.61 }], detectedFormat: "text", formatConfidence: 0.9 },
          { columnName: "phone", dataType: "varchar(20)", cardinality: 92, nullPercentage: 8.2, topValues: [{ value: "+1-555-0101", count: 5, percentage: 0.01 }], detectedFormat: "phone", formatConfidence: 0.88 },
          { columnName: "city", dataType: "varchar(100)", cardinality: 18.5, nullPercentage: 3.1, topValues: [{ value: "New York", count: 4200, percentage: 8.66 }, { value: "Los Angeles", count: 3800, percentage: 7.83 }], detectedFormat: "text", formatConfidence: 0.85 },
          { columnName: "country_code", dataType: "char(2)", cardinality: 2.1, nullPercentage: 0, topValues: [{ value: "US", count: 28000, percentage: 57.7 }], detectedFormat: "country_code", formatConfidence: 0.82 },
          { columnName: "created_at", dataType: "timestamp", cardinality: 95, nullPercentage: 0, minValue: "2023-01-15T08:00:00", maxValue: "2026-07-20T14:30:00", topValues: [{ value: "2025-01-01", count: 120, percentage: 0.25 }], detectedFormat: "date", formatConfidence: 0.97 },
          { columnName: "lifetime_value", dataType: "decimal(12,2)", cardinality: 88, nullPercentage: 12.3, minValue: "0.00", maxValue: "125430.50", meanValue: 2845.75, percentiles: { p25: 120.5, p50: 890.0, p75: 3200.0 }, topValues: [{ value: "0.00", count: 2340, percentage: 4.82 }], detectedFormat: "currency", formatConfidence: 0.96 },
          { columnName: "is_active", dataType: "boolean", cardinality: 0.4, nullPercentage: 0, topValues: [{ value: "true", count: 38800, percentage: 79.97 }], detectedFormat: "boolean", formatConfidence: 0.95 },
        ],
      },
      "tbl-orders": {
        name: "Orders",
        rowCount: 312450,
        columns: [
          { columnName: "order_id", dataType: "bigint", cardinality: 100, nullPercentage: 0, detectedFormat: "numeric" },
          { columnName: "customer_id", dataType: "bigint", cardinality: 42, nullPercentage: 0, detectedFormat: "numeric" },
          { columnName: "order_date", dataType: "date", cardinality: 30, nullPercentage: 0, minValue: "2023-01-01", maxValue: "2026-07-22", detectedFormat: "date", formatConfidence: 0.97 },
          { columnName: "total_amount", dataType: "decimal(12,2)", cardinality: 78, nullPercentage: 0.1, minValue: "1.99", maxValue: "45000.00", meanValue: 187.50, percentiles: { p25: 29.99, p50: 89.99, p75: 249.99 }, detectedFormat: "currency", formatConfidence: 0.96 },
          { columnName: "status", dataType: "varchar(20)", cardinality: 0.8, nullPercentage: 0, topValues: [{ value: "completed", count: 198000, percentage: 63.4 }, { value: "pending", count: 52000, percentage: 16.6 }, { value: "shipped", count: 42000, percentage: 13.4 }], detectedFormat: "text", formatConfidence: 0.85 },
          { columnName: "quantity", dataType: "int", cardinality: 8, nullPercentage: 0, minValue: "1", maxValue: "50", meanValue: 2.8, topValues: [{ value: "1", count: 98000, percentage: 31.4 }], detectedFormat: "numeric", formatConfidence: 0.9 },
          { columnName: "shipping_address_zip", dataType: "varchar(10)", cardinality: 19, nullPercentage: 2.1, topValues: [{ value: "10001", count: 1200, percentage: 0.38 }], detectedFormat: "zip", formatConfidence: 0.92 },
          { columnName: "shipping_country", dataType: "char(2)", cardinality: 1.8, nullPercentage: 0, topValues: [{ value: "US", count: 260000, percentage: 83.2 }], detectedFormat: "country_code", formatConfidence: 0.82 },
          { columnName: "payment_method", dataType: "varchar(30)", cardinality: 0.6, nullPercentage: 0, topValues: [{ value: "credit_card", count: 187000, percentage: 59.8 }, { value: "paypal", count: 78000, percentage: 25.0 }], detectedFormat: "text", formatConfidence: 0.85 },
        ],
      },
      "tbl-products": {
        name: "Products",
        rowCount: 8450,
        columns: [
          { columnName: "product_id", dataType: "bigint", cardinality: 100, nullPercentage: 0, detectedFormat: "numeric" },
          { columnName: "sku", dataType: "varchar(50)", cardinality: 100, nullPercentage: 0, topValues: [{ value: "SKU-00001", count: 1, percentage: 0.012 }], detectedFormat: "text", formatConfidence: 0.8 },
          { columnName: "name", dataType: "varchar(255)", cardinality: 99.8, nullPercentage: 0, minLength: 5, maxLength: 120, meanLength: 32, detectedFormat: "text", formatConfidence: 0.9 },
          { columnName: "category", dataType: "varchar(100)", cardinality: 3.2, nullPercentage: 0.5, topValues: [{ value: "Electronics", count: 2100, percentage: 24.8 }, { value: "Clothing", count: 1680, percentage: 19.9 }], detectedFormat: "text", formatConfidence: 0.85 },
          { columnName: "price", dataType: "decimal(10,2)", cardinality: 75, nullPercentage: 0, minValue: "0.99", maxValue: "9999.99", meanValue: 142.30, percentiles: { p25: 19.99, p50: 59.99, p75: 189.99 }, detectedFormat: "currency", formatConfidence: 0.96 },
          { columnName: "cost", dataType: "decimal(10,2)", cardinality: 60, nullPercentage: 1.2, minValue: "0.50", maxValue: "4500.00", meanValue: 58.75, detectedFormat: "currency", formatConfidence: 0.94 },
          { columnName: "stock_quantity", dataType: "int", cardinality: 45, nullPercentage: 0, minValue: "0", maxValue: "50000", meanValue: 320, detectedFormat: "numeric", formatConfidence: 0.9 },
          { columnName: "weight_kg", dataType: "decimal(8,3)", cardinality: 55, nullPercentage: 5.3, minValue: "0.001", maxValue: "120.000", meanValue: 2.45, detectedFormat: "numeric", formatConfidence: 0.88 },
          { columnName: "is_published", dataType: "boolean", cardinality: 0.4, nullPercentage: 0, topValues: [{ value: "true", count: 6760, percentage: 80.0 }], detectedFormat: "boolean", formatConfidence: 0.95 },
        ],
      },
    };

    const def = tableDefs[tableId] || {
      name: `Table_${tableId.slice(0, 8)}`,
      rowCount: Math.floor(Math.random() * 10000) + 100,
      columns: Array.from({ length: 5 }, (_, i) => ({
        columnName: `col_${i + 1}`,
        dataType: "varchar(255)",
        cardinality: Math.floor(Math.random() * 80) + 10,
        nullPercentage: Math.random() * 10,
        topValues: [],
        detectedFormat: "text",
      })),
    };

    const now = new Date();
    const columns: ColumnProfile[] = def.columns.map((col, idx) => {
      const id = crypto.randomUUID();
      const formatResult = col.formatConfidence
        ? { format: col.detectedFormat, confidence: col.formatConfidence, pattern: col.patternRegex }
        : this.detectFormat(col.topValues?.[0]?.value || "text");
      return {
        id,
        jobId,
        tableId,
        columnName: col.columnName || `col_${idx}`,
        dataType: col.dataType || "varchar(255)",
        cardinality: col.cardinality || 50,
        nullCount: Math.floor((col.nullPercentage || 0) * (def.rowCount || 1000) / 100),
        nullPercentage: col.nullPercentage || 0,
        minLength: col.minLength,
        maxLength: col.maxLength,
        meanLength: col.meanLength,
        minValue: col.minValue,
        maxValue: col.maxValue,
        meanValue: col.meanValue,
        percentiles: col.percentiles,
        topValues: col.topValues || [],
        detectedFormat: formatResult.format,
        formatConfidence: formatResult.confidence,
        patternRegex: formatResult.pattern,
        sampleValues: this.generateSamples(col.columnName, formatResult.format),
      };
    });

    return {
      id: crypto.randomUUID(),
      jobId,
      tableId,
      tableName: def.name,
      rowCount: def.rowCount,
      columnCount: columns.length,
      columns,
      estimatedSize: `${Math.floor(def.rowCount * 0.5)}KB`,
      lastModified: now,
    };
  }

  private generateSamples(columnName: string, format: string): string[] {
    const samples: Record<string, string[]> = {
      email: ["john@example.com", "sarah.connor@corp.io", "data@analytics.co"],
      phone: ["+1-555-0101", "+44 20 7946 0958", "(555) 123-4567"],
      currency: ["$1,234.56", "$89.99", "$12,500.00"],
      zip: ["10001", "90210", "60614-3210"],
      date: ["2025-03-15T10:30:00", "2024-12-01", "01/15/2025"],
      country_code: ["US", "GB", "DE"],
      iban: ["GB29NWBK60161331926819", "DE89370400440532013000"],
      boolean: ["true", "false", "yes"],
      numeric: ["42", "3.14159", "1,000,000"],
      text: ["Sample text value", "Another example", "Data point"],
      unknown: ["N/A", "—", ""],
    };
    return samples[format] || samples.text;
  }

  // ─── Seed ───────────────────────────────────────────────────────────────

  private seedMockData(): void {
    const now = new Date();

    // Completed job
    const completedJob: ProfilingJob = {
      id: "prof-job-001",
      connectionId: "conn-001",
      status: "completed",
      startedAt: new Date(now.getTime() - 3600000),
      finishedAt: new Date(now.getTime() - 3000000),
      tablesProfiled: 3,
      columnsProfiled: 27,
    };
    this.jobs.set(completedJob.id, completedJob);

    // Generate profiles for the completed job
    const tableIds = ["tbl-customers", "tbl-orders", "tbl-products"];
    for (const tableId of tableIds) {
      const tableProfile = this.generateTableProfile(completedJob.id, tableId);
      this.tableProfiles.set(tableProfile.id, tableProfile);
      for (const col of tableProfile.columns) {
        this.columnProfiles.set(col.id, col);
      }
    }

    // Running job
    const runningJob: ProfilingJob = {
      id: "prof-job-002",
      connectionId: "conn-001",
      status: "running",
      startedAt: new Date(now.getTime() - 120000),
      tablesProfiled: 1,
      columnsProfiled: 6,
    };
    this.jobs.set(runningJob.id, runningJob);

    // Pending job
    const pendingJob: ProfilingJob = {
      id: "prof-job-003",
      connectionId: "conn-002",
      status: "pending",
      startedAt: now,
      tablesProfiled: 0,
      columnsProfiled: 0,
    };
    this.jobs.set(pendingJob.id, pendingJob);
  }
}
