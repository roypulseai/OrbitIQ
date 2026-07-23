import { Injectable } from "@nestjs/common";
import { KnowledgeGraphService, KGMatch } from "./knowledge-graph.service";

export interface ColumnFingerprint {
  columnName: string;
  tableId: string;
  topMatch?: KGMatch;
  allMatches: KGMatch[];
  fingerprintHash: string;
}

export interface FingerprintStats {
  totalFingerprinted: number;
  matched: number;
  unmatched: number;
  averageConfidence: number;
}

@Injectable()
export class SemanticFingerprintService {
  private fingerprints: Map<string, ColumnFingerprint> = new Map();

  constructor(private readonly kgService: KnowledgeGraphService) {}

  fingerprintColumn(
    name: string,
    table: string,
    sampleValues: string[],
    vertical?: string
  ): ColumnFingerprint {
    const hash = this.computeHash(name, sampleValues);
    const matches = this.kgService.matchColumnsToEntities(
      [{ name, table, sampleValues }],
      vertical
    );

    const fp: ColumnFingerprint = {
      columnName: name,
      tableId: table,
      topMatch: matches.length > 0 ? matches.reduce((best, m) => (m.confidence > best.confidence ? m : best)) : undefined,
      allMatches: matches,
      fingerprintHash: hash,
    };

    this.fingerprints.set(`${table}:${name}`, fp);
    return fp;
  }

  batchFingerprint(
    columns: { name: string; table: string; sampleValues: string[] }[],
    vertical?: string
  ): ColumnFingerprint[] {
    const matches = this.kgService.matchColumnsToEntities(
      columns.map((c) => ({ name: c.name, table: c.table, sampleValues: c.sampleValues })),
      vertical
    );

    const matchByColumn = new Map<string, KGMatch[]>();
    for (const m of matches) {
      const key = `${m.sourceTableId}:${m.sourceColumnName}`;
      const list = matchByColumn.get(key) || [];
      list.push(m);
      matchByColumn.set(key, list);
    }

    const results: ColumnFingerprint[] = [];
    for (const col of columns) {
      const key = `${col.table}:${col.name}`;
      const colMatches = matchByColumn.get(key) || [];
      const hash = this.computeHash(col.name, col.sampleValues);

      const fp: ColumnFingerprint = {
        columnName: col.name,
        tableId: col.table,
        topMatch: colMatches.length > 0 ? colMatches.reduce((best, m) => (m.confidence > best.confidence ? m : best)) : undefined,
        allMatches: colMatches,
        fingerprintHash: hash,
      };
      this.fingerprints.set(key, fp);
      results.push(fp);
    }

    return results;
  }

  getFingerprintStats(): FingerprintStats {
    const all = Array.from(this.fingerprints.values());
    const matched = all.filter((f) => f.topMatch);
    const totalConfidence = matched.reduce((sum, f) => sum + (f.topMatch?.confidence || 0), 0);

    return {
      totalFingerprinted: all.length,
      matched: matched.length,
      unmatched: all.length - matched.length,
      averageConfidence: matched.length > 0 ? totalConfidence / matched.length : 0,
    };
  }

  private computeHash(name: string, sampleValues: string[]): string {
    const input = `${name}|${sampleValues.join(",")}`;
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return `fp-${Math.abs(hash).toString(16).padStart(8, "0")}`;
  }
}
