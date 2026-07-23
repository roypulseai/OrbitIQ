import { Injectable } from "@nestjs/common";
import { createHash } from "node:crypto";

export interface ColumnSecurityRule {
  id: string;
  modelId: string;
  tableId: string;
  columnName: string;
  maskType: "NONE" | "FULL" | "PARTIAL" | "HASH" | "TOKENIZE" | "GENERALIZE";
  maskConfig?: Record<string, any>;
  appliesToRoles: string[];
  isEnabled: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface PIITag {
  id: string;
  columnName: string;
  tableId: string;
  modelId: string;
  confidence: number;
  source: "regex" | "classifier" | "manual";
  piiType: string;
  createdAt: Date;
}

@Injectable()
export class CLSService {
  private columnRules: Map<string, ColumnSecurityRule> = new Map();
  private piiTags: Map<string, PIITag> = new Map();

  constructor() {
    this.seedMockData();
  }

  private seedMockData(): void {
    const rules: Omit<ColumnSecurityRule, "id" | "createdAt">[] = [
      { modelId: "model-1", tableId: "table-customers", columnName: "email", maskType: "FULL", appliesToRoles: ["admin", "viewer"], isEnabled: true },
      { modelId: "model-1", tableId: "table-customers", columnName: "phone", maskType: "PARTIAL", maskConfig: { showLastN: 4 }, appliesToRoles: ["admin"], isEnabled: true },
      { modelId: "model-1", tableId: "table-transactions", columnName: "credit_card", maskType: "FULL", appliesToRoles: ["admin", "viewer", "editor"], isEnabled: true },
      { modelId: "model-1", tableId: "table-employees", columnName: "salary", maskType: "TOKENIZE", appliesToRoles: ["admin", "data_steward"], isEnabled: true },
      { modelId: "model-1", tableId: "table-employees", columnName: "age", maskType: "GENERALIZE", maskConfig: { buckets: ["0-20", "20-30", "30-40", "40-50", "50+"] }, appliesToRoles: ["viewer"], isEnabled: true },
      { modelId: "model-1", tableId: "table-employees", columnName: "ssn", maskType: "FULL", appliesToRoles: ["admin"], isEnabled: true },
      { modelId: "model-1", tableId: "table-access-logs", columnName: "ip_address", maskType: "HASH", appliesToRoles: ["admin"], isEnabled: false },
      { modelId: "model-1", tableId: "table-customers", columnName: "address", maskType: "PARTIAL", maskConfig: { showLastN: 8 }, appliesToRoles: ["viewer"], isEnabled: true },
    ];
    for (const r of rules) {
      const id = crypto.randomUUID();
      this.columnRules.set(id, { ...r, id, createdAt: new Date() });
    }

    const tags: Omit<PIITag, "id" | "createdAt">[] = [
      { columnName: "email", tableId: "table-customers", modelId: "model-1", confidence: 0.98, source: "regex", piiType: "email" },
      { columnName: "phone", tableId: "table-customers", modelId: "model-1", confidence: 0.92, source: "regex", piiType: "phone" },
      { columnName: "first_name", tableId: "table-employees", modelId: "model-1", confidence: 0.85, source: "classifier", piiType: "name" },
      { columnName: "ssn", tableId: "table-employees", modelId: "model-1", confidence: 0.99, source: "regex", piiType: "ssn" },
      { columnName: "ip_address", tableId: "table-access-logs", modelId: "model-1", confidence: 0.88, source: "regex", piiType: "ip_address" },
      { columnName: "credit_card", tableId: "table-transactions", modelId: "model-1", confidence: 0.97, source: "regex", piiType: "credit_card" },
    ];
    for (const t of tags) {
      const id = crypto.randomUUID();
      this.piiTags.set(id, { ...t, id, createdAt: new Date() });
    }
  }

  async createRule(input: Omit<ColumnSecurityRule, "id" | "createdAt" | "isEnabled">): Promise<ColumnSecurityRule> {
    const rule: ColumnSecurityRule = {
      ...input,
      id: crypto.randomUUID(),
      isEnabled: true,
      createdAt: new Date(),
    };
    this.columnRules.set(rule.id, rule);
    return rule;
  }

  async getRule(id: string): Promise<ColumnSecurityRule | null> {
    return this.columnRules.get(id) ?? null;
  }

  async updateRule(id: string, updates: Partial<ColumnSecurityRule>): Promise<ColumnSecurityRule> {
    const rule = this.columnRules.get(id);
    if (!rule) throw new Error(`Rule ${id} not found`);
    const updated = { ...rule, ...updates, id: rule.id, updatedAt: new Date() };
    this.columnRules.set(id, updated);
    return updated;
  }

  async deleteRule(id: string): Promise<boolean> {
    return this.columnRules.delete(id);
  }

  async listRulesForTable(modelId: string, tableId: string): Promise<ColumnSecurityRule[]> {
    return Array.from(this.columnRules.values()).filter(
      (r) => r.modelId === modelId && r.tableId === tableId
    );
  }

  async listRulesForModel(modelId: string): Promise<ColumnSecurityRule[]> {
    return Array.from(this.columnRules.values()).filter((r) => r.modelId === modelId);
  }

  async toggleRule(id: string): Promise<ColumnSecurityRule> {
    const rule = this.columnRules.get(id);
    if (!rule) throw new Error(`Rule ${id} not found`);
    rule.isEnabled = !rule.isEnabled;
    rule.updatedAt = new Date();
    return rule;
  }

  applyMasking(value: any, rule: ColumnSecurityRule, userRoles: string[]): any {
    if (!rule.isEnabled) return value;
    if (!rule.appliesToRoles.some((r) => userRoles.includes(r))) return value;
    const strValue = String(value);

    switch (rule.maskType) {
      case "NONE":
        return value;
      case "FULL":
        if (strValue.includes("@")) {
          const [local, domain] = strValue.split("@");
          return `${"*".repeat(Math.min(local.length, 3))}@${"*".repeat(3)}.${domain.split(".").pop()}`;
        }
        return "*".repeat(strValue.length);
      case "PARTIAL": {
        const showN = rule.maskConfig?.showLastN ?? 4;
        const masked = "*".repeat(Math.max(0, strValue.length - showN));
        return masked + strValue.slice(-showN);
      }
      case "HASH":
        return createHash("sha256").update(strValue).digest("hex").slice(0, 16);
      case "TOKENIZE": {
        const hash = createHash("sha256").update(strValue).digest("hex").slice(0, 8).toUpperCase();
        return `TOK-${hash.slice(0, 4)}-${hash.slice(4, 8)}`;
      }
      case "GENERALIZE": {
        const buckets = rule.maskConfig?.buckets ?? [];
        const numValue = parseFloat(strValue);
        if (!isNaN(numValue) && buckets.length > 0) {
          for (const bucket of buckets) {
            const match = bucket.match(/^(\d+)-(\d+)$/);
            if (match) {
              const low = parseInt(match[1]);
              const high = parseInt(match[2]);
              if (numValue >= low && numValue < high) return bucket;
            } else if (bucket.endsWith("+")) {
              const low = parseInt(bucket);
              if (!isNaN(low) && numValue >= low) return bucket;
            }
          }
          return buckets[buckets.length - 1];
        }
        return strValue;
      }
      default:
        return value;
    }
  }

  autoDetectPII(columnName: string): { piiType: string; confidence: number } | null {
    const col = columnName.toLowerCase();
    const patterns: [RegExp, string, number][] = [
      [/[\w.-]+@[\w.-]+\.\w+/, "email", 0.98],
      [/^\d{3}-\d{2}-\d{4}$/, "ssn", 0.99],
      [/^\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}$/, "credit_card", 0.97],
      [/^[\+]?[\d\s\-\(\)]{10,}$/, "phone", 0.92],
    ];

    for (const [regex, type, conf] of patterns) {
      if (regex.test(col)) return { piiType: type, confidence: conf };
    }

    const namePatterns = ["first_name", "last_name", "full_name", "customer_name", "employee_name"];
    if (namePatterns.some((p) => col.includes(p))) return { piiType: "name", confidence: 0.85 };

    const addrPatterns = ["address", "street", "city", "zip", "postal"];
    if (addrPatterns.some((p) => col.includes(p))) return { piiType: "address", confidence: 0.8 };

    if (col.includes("ip") && col.includes("address")) return { piiType: "ip_address", confidence: 0.88 };

    const dobPatterns = ["date_of_birth", "dob", "birthday", "birth_date"];
    if (dobPatterns.some((p) => col.includes(p))) return { piiType: "dob", confidence: 0.9 };

    return null;
  }

  async getPIITags(modelId: string): Promise<PIITag[]> {
    return Array.from(this.piiTags.values()).filter((t) => t.modelId === modelId);
  }

  async updatePIITag(id: string, updates: Partial<PIITag>): Promise<PIITag> {
    const tag = this.piiTags.get(id);
    if (!tag) throw new Error(`PII tag ${id} not found`);
    const updated = { ...tag, ...updates, id: tag.id };
    this.piiTags.set(id, updated);
    return updated;
  }
}
