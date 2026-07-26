import { Injectable, NotFoundException } from "@nestjs/common";
import { IngestionService, SchemaColumn, SchemaProfile } from "./ingestion.service";

export interface ColumnProfile {
  name: string;
  inferredType: string;
  nullPercentage: number;
  cardinality: number;
  sampleValues: unknown[];
  detectedFormat?: string;
  maxLength?: number;
  min?: unknown;
  max?: unknown;
  mean?: number;
  median?: number;
  percentiles?: { p25: number; p75: number; p95: number };
  topValues?: { value: unknown; count: number; percentage: number }[];
  histogram?: { bucket: string; count: number }[];
}

export interface TableProfile {
  id: string;
  tableId: string;
  tableName: string;
  columns: ColumnProfile[];
  rowCount: number;
  columnCount: number;
  sizeBytes?: number;
  profiledAt: Date;
  status: "pending" | "completed" | "error";
  errorMessage?: string;
}

@Injectable()
export class RealProfilingService {
  private profiles: Map<string, TableProfile> = new Map();

  constructor(private readonly ingestionService: IngestionService) {}

  async profileTable(tableId: string): Promise<TableProfile> {
    const table = await this.ingestionService.listTables("");
    const target = table.find(t => t.id === tableId);
    if (!target) throw new NotFoundException(`Table ${tableId} not found`);

    const profileId = crypto.randomUUID();
    const profile: TableProfile = {
      id: profileId,
      tableId,
      tableName: target.tableName,
      columns: [],
      rowCount: 0,
      columnCount: 0,
      profiledAt: new Date(),
      status: "pending",
    };
    this.profiles.set(profileId, profile);

    try {
      const data = await this.ingestionService.queryTable(tableId, 10000);
      const columns: ColumnProfile[] = data.columns.map(colName => {
        const values = data.rows.map(r => r[colName]).filter(v => v !== null && v !== undefined && v !== "");
        return this.profileColumn(colName, values, data.rows.length);
      });

      profile.columns = columns;
      profile.rowCount = data.rowCount;
      profile.columnCount = columns.length;
      profile.status = "completed";
    } catch (error) {
      profile.status = "error";
      profile.errorMessage = error instanceof Error ? error.message : "Profiling failed";
    }

    return profile;
  }

  async getProfile(id: string): Promise<TableProfile> {
    const profile = this.profiles.get(id);
    if (!profile) throw new NotFoundException(`Profile ${id} not found`);
    return profile;
  }

  async listProfiles(): Promise<TableProfile[]> {
    return Array.from(this.profiles.values());
  }

  private profileColumn(name: string, values: unknown[], totalRows: number): ColumnProfile {
    const nullCount = totalRows - values.length;
    const nullPercentage = totalRows > 0 ? Math.round((nullCount / totalRows) * 10000) / 100 : 0;
    const uniqueValues = new Set(values);
    const cardinality = uniqueValues.size;

    const profile: ColumnProfile = {
      name,
      inferredType: this.inferType(values),
      nullPercentage,
      cardinality,
      sampleValues: Array.from(uniqueValues).slice(0, 10),
    };

    const format = this.detectFormat(values);
    if (format) profile.detectedFormat = format;

    const maxLen = this.getMaxLength(values);
    if (maxLen > 0) profile.maxLength = maxLen;

    const numericValues = values.map(v => parseFloat(String(v))).filter(v => !isNaN(v));
    if (numericValues.length > values.length * 0.5) {
      numericValues.sort((a, b) => a - b);
      profile.min = numericValues[0];
      profile.max = numericValues[numericValues.length - 1];
      profile.mean = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
      profile.median = this.percentile(numericValues, 50);
      profile.percentiles = {
        p25: this.percentile(numericValues, 25),
        p75: this.percentile(numericValues, 75),
        p95: this.percentile(numericValues, 95),
      };
    }

    const freq = new Map<unknown, number>();
    for (const v of values) {
      freq.set(v, (freq.get(v) || 0) + 1);
    }
    const sorted = Array.from(freq.entries()).sort((a, b) => b[1] - a[1]);
    profile.topValues = sorted.slice(0, 10).map(([value, count]) => ({
      value,
      count,
      percentage: values.length > 0 ? Math.round((count / values.length) * 10000) / 100 : 0,
    }));

    if (numericValues.length > 10) {
      profile.histogram = this.buildHistogram(numericValues, 10);
    }

    return profile;
  }

  private inferType(values: unknown[]): string {
    if (values.length === 0) return "unknown";
    const sample = values.slice(0, 1000);

    let intCount = 0, floatCount = 0, boolCount = 0, dateCount = 0, datetimeCount = 0, currencyCount = 0, percentCount = 0;

    for (const v of sample) {
      const s = String(v).trim();
      if (s === "" || s === "null" || s === "NULL") continue;
      if (/^(true|false|yes|no|0|1)$/i.test(s)) { boolCount++; continue; }
      if (/^[\$€£]\s*[\d,]+\.?\d*$/.test(s)) { currencyCount++; continue; }
      if (/^\d+\.?\d*\s*%$/.test(s)) { percentCount++; continue; }
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) { dateCount++; continue; }
      if (/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/.test(s)) { datetimeCount++; continue; }
      if (/^-?\d+$/.test(s)) { intCount++; continue; }
      if (/^-?\d+\.\d+$/.test(s)) { floatCount++; continue; }
    }

    const threshold = sample.length * 0.8;
    if (currencyCount > threshold * 0.5) return "currency";
    if (percentCount > threshold * 0.5) return "percentage";
    if (dateCount > threshold) return "date";
    if (datetimeCount > threshold) return "datetime";
    if (boolCount > threshold) return "boolean";
    if (intCount > threshold) return "integer";
    if (floatCount > threshold) return "float";
    if (intCount + floatCount > threshold) return "float";
    return "string";
  }

  private detectFormat(values: unknown[]): string | undefined {
    const sample = values.slice(0, 500);
    if (sample.length === 0) return undefined;

    const patterns: [RegExp, string][] = [
      [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "email"],
      [/^\+?[\d\s\-\(\)]{7,15}$/, "phone"],
      [/^https?:\/\//, "url"],
      [/^\d{5}(-\d{4})?$/, "zip"],
      [/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/, "ip"],
      [/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, "uuid"],
    ];

    for (const [re, name] of patterns) {
      const matchCount = sample.filter(v => re.test(String(v).trim())).length;
      if (matchCount > sample.length * 0.7) return name;
    }
    return undefined;
  }

  private getMaxLength(values: unknown[]): number {
    let max = 0;
    for (const v of values.slice(0, 1000)) {
      const len = String(v).length;
      if (len > max) max = len;
    }
    return max;
  }

  private percentile(sorted: number[], p: number): number {
    if (sorted.length === 0) return 0;
    const idx = (p / 100) * (sorted.length - 1);
    const lower = Math.floor(idx);
    const upper = Math.ceil(idx);
    if (lower === upper) return sorted[lower];
    return sorted[lower] + (sorted[upper] - sorted[lower]) * (idx - lower);
  }

  private buildHistogram(values: number[], buckets: number): { bucket: string; count: number }[] {
    const min = values[0];
    const max = values[values.length - 1];
    const range = max - min;
    if (range === 0) return [{ bucket: String(min), count: values.length }];
    const bucketSize = range / buckets;
    const result: { bucket: string; count: number }[] = [];
    for (let i = 0; i < buckets; i++) {
      const lo = min + i * bucketSize;
      const hi = lo + bucketSize;
      const count = values.filter(v => i === buckets - 1 ? v >= lo && v <= hi : v >= lo && v < hi).length;
      result.push({ bucket: `${lo.toFixed(1)}-${hi.toFixed(1)}`, count });
    }
    return result;
  }
}
