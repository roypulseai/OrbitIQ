import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";

export interface RLSPolicyRecord {
  id: string;
  modelId: string;
  tableId: string;
  oqlExpression: string;
  appliesToRoles: string[];
  isEnabled: boolean;
  priority: number;
  description?: string;
  createdAt: Date;
  updatedAt?: Date;
  createdBy?: string;
}

export interface UserAttributeRecord {
  userId: string;
  attributes: Record<string, string>;
  updatedAt: Date;
}

@Injectable()
export class RLSService {
  private policies: Map<string, RLSPolicyRecord> = new Map();
  private userAttributes: Map<string, UserAttributeRecord> = new Map();

  constructor() {
    this.seedMockData();
  }

  // ─── Policy CRUD ────────────────────────────────────────────────────────

  createPolicy(input: {
    modelId: string;
    tableId: string;
    oqlExpression: string;
    appliesToRoles: string[];
    priority?: number;
    description?: string;
    createdBy?: string;
  }): RLSPolicyRecord {
    const now = new Date();
    const policy: RLSPolicyRecord = {
      id: crypto.randomUUID(),
      modelId: input.modelId,
      tableId: input.tableId,
      oqlExpression: input.oqlExpression,
      appliesToRoles: input.appliesToRoles,
      isEnabled: true,
      priority: input.priority ?? 100,
      description: input.description,
      createdAt: now,
      updatedAt: now,
      createdBy: input.createdBy,
    };
    this.policies.set(policy.id, policy);
    return policy;
  }

  getPolicy(id: string): RLSPolicyRecord {
    const policy = this.policies.get(id);
    if (!policy) throw new NotFoundException(`RLS policy ${id} not found`);
    return policy;
  }

  updatePolicy(
    id: string,
    input: {
      oqlExpression?: string;
      appliesToRoles?: string[];
      isEnabled?: boolean;
      priority?: number;
      description?: string;
    }
  ): RLSPolicyRecord {
    const policy = this.getPolicy(id);
    const updated: RLSPolicyRecord = {
      ...policy,
      ...Object.fromEntries(
        Object.entries(input).filter(([, v]) => v !== undefined)
      ),
      updatedAt: new Date(),
    };
    this.policies.set(id, updated);
    return updated;
  }

  deletePolicy(id: string): boolean {
    if (!this.policies.has(id)) {
      throw new NotFoundException(`RLS policy ${id} not found`);
    }
    this.policies.delete(id);
    return true;
  }

  listPolicies(): RLSPolicyRecord[] {
    return Array.from(this.policies.values());
  }

  listPoliciesForModel(modelId: string): RLSPolicyRecord[] {
    return this.listPolicies().filter((p) => p.modelId === modelId);
  }

  listPoliciesForTable(modelId: string, tableId: string): RLSPolicyRecord[] {
    return this.listPolicies().filter(
      (p) => p.modelId === modelId && p.tableId === tableId
    );
  }

  // ─── User Attributes ────────────────────────────────────────────────────

  getUserAttributes(userId: string): UserAttributeRecord | undefined {
    return this.userAttributes.get(userId);
  }

  setUserAttributes(
    userId: string,
    attributes: Record<string, string>
  ): UserAttributeRecord {
    const existing = this.userAttributes.get(userId);
    const record: UserAttributeRecord = {
      userId,
      attributes: { ...(existing?.attributes ?? {}), ...attributes },
      updatedAt: new Date(),
    };
    this.userAttributes.set(userId, record);
    return record;
  }

  // ─── OQL Expression Evaluation ──────────────────────────────────────────

  evaluatePolicy(
    oqlExpression: string,
    userAttributes: Record<string, string>
  ): boolean {
    try {
      const resolved = this.resolveUserAttributes(oqlExpression, userAttributes);
      return this.evalExpression(resolved);
    } catch {
      return false;
    }
  }

  private resolveUserAttributes(
    expr: string,
    attrs: Record<string, string>
  ): string {
    return expr.replace(/USERATTRIBUTE\("(\w+)"\)/g, (_, key: string) => {
      const val = attrs[key];
      if (val === undefined) return "NULL";
      return `"${val}"`;
    });
  }

  private evalExpression(expr: string): boolean {
    const trimmed = expr.trim();

    // Handle AND / OR at top level (simple split, no parens needed for seed data)
    // Process AND before OR for correct precedence
    const orParts = this.splitTopLevel(trimmed, " OR ");
    if (orParts.length > 1) {
      return orParts.some((part) => this.evalExpression(part));
    }

    const andParts = this.splitTopLevel(trimmed, " AND ");
    if (andParts.length > 1) {
      return andParts.every((part) => this.evalExpression(part));
    }

    // Handle NOT
    if (trimmed.startsWith("NOT ")) {
      return !this.evalExpression(trimmed.slice(4));
    }

    // Handle parenthesized expressions
    if (trimmed.startsWith("(") && trimmed.endsWith(")")) {
      return this.evalExpression(trimmed.slice(1, -1));
    }

    // Handle IN / NOT IN
    const inMatch = trimmed.match(/^(.+?)\s+NOT\s+IN\s*\((.+)\)$/i);
    if (inMatch) {
      const left = this.resolveTermValue(inMatch[1]);
      const values = this.parseValueList(inMatch[2]);
      return !values.includes(left);
    }

    const inMatch2 = trimmed.match(/^(.+?)\s+IN\s*\((.+)\)$/i);
    if (inMatch2) {
      const left = this.resolveTermValue(inMatch2[1]);
      const values = this.parseValueList(inMatch2[2]);
      return values.includes(left);
    }

    // Handle comparison operators
    const cmpOps = ["!=", ">=", "<=", "=", ">", "<"];
    for (const op of cmpOps) {
      const idx = trimmed.indexOf(op);
      if (idx > 0) {
        const left = this.resolveTermValue(trimmed.slice(0, idx).trim());
        const right = this.resolveTermValue(trimmed.slice(idx + op.length).trim());
        switch (op) {
          case "=": return left === right;
          case "!=": return left !== right;
          case ">": return Number(left) > Number(right);
          case "<": return Number(left) < Number(right);
          case ">=": return Number(left) >= Number(right);
          case "<=": return Number(left) <= Number(right);
        }
      }
    }

    // Boolean literal
    if (trimmed.toUpperCase() === "TRUE") return true;
    if (trimmed.toUpperCase() === "FALSE") return false;

    return false;
  }

  private splitTopLevel(expr: string, delimiter: string): string[] {
    const parts: string[] = [];
    let depth = 0;
    let current = "";
    let i = 0;
    while (i < expr.length) {
      if (expr[i] === "(") depth++;
      if (expr[i] === ")") depth--;
      if (depth === 0 && expr.slice(i).startsWith(delimiter)) {
        parts.push(current.trim());
        current = "";
        i += delimiter.length;
        continue;
      }
      current += expr[i];
      i++;
    }
    if (current.trim()) parts.push(current.trim());
    return parts;
  }

  private resolveTermValue(term: string): string {
    const trimmed = term.trim();
    if (
      (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))
    ) {
      return trimmed.slice(1, -1);
    }
    if (trimmed.toUpperCase() === "NULL") return "";
    return trimmed;
  }

  private parseValueList(list: string): string[] {
    return list
      .split(",")
      .map((v) => this.resolveTermValue(v.trim()));
  }

  // ─── RLS Filter Builder ─────────────────────────────────────────────────

  getEffectivePolicies(
    userId: string,
    tableId: string,
    modelId: string
  ): RLSPolicyRecord[] {
    const userAttr = this.userAttributes.get(userId);
    const userRoles = userAttr?.attributes["roles"]?.split(",") ?? [];

    return this.listPolicies()
      .filter(
        (p) =>
          p.isEnabled &&
          p.modelId === modelId &&
          p.tableId === tableId &&
          (p.appliesToRoles.length === 0 ||
            p.appliesToRoles.some((r) => userRoles.includes(r)))
      )
      .sort((a, b) => a.priority - b.priority);
  }

  buildRLSFilter(
    policies: RLSPolicyRecord[],
    userAttributes: Record<string, string>,
    tableAlias?: string
  ): string {
    if (policies.length === 0) return "1 = 1";

    const conditions = policies.map((p) => {
      const resolved = this.resolveUserAttributes(p.oqlExpression, userAttributes);
      // Replace bare column references with table-qualified names
      let sql = resolved;
      if (tableAlias) {
        sql = sql.replace(
          /\b(\w+)\s*(=|!=|>=|<=|>|<|IN|NOT\s+IN)/gi,
          `${tableAlias}.$1 $2`
        );
      }
      return `(${sql})`;
    });

    return conditions.join(" AND ");
  }

  // ─── Mock Data ──────────────────────────────────────────────────────────

  private seedMockData(): void {
    // Seed user attributes
    this.userAttributes.set("user-001", {
      userId: "user-001",
      attributes: { region: "US", department: "Engineering", role: "admin", cost_center: "CC001", levels: "user-002,user-003" },
      updatedAt: new Date("2026-01-15"),
    });
    this.userAttributes.set("user-002", {
      userId: "user-002",
      attributes: { region: "EU", department: "Sales", role: "editor", cost_center: "CC002", levels: "" },
      updatedAt: new Date("2026-01-15"),
    });
    this.userAttributes.set("user-003", {
      userId: "user-003",
      attributes: { region: "APAC", department: "Engineering", role: "viewer", cost_center: "CC003", levels: "" },
      updatedAt: new Date("2026-01-15"),
    });
    this.userAttributes.set("user-004", {
      userId: "user-004",
      attributes: { region: "US", department: "Data", role: "data_steward", cost_center: "CC001", levels: "" },
      updatedAt: new Date("2026-01-15"),
    });

    // Seed RLS policies
    const now = new Date();

    this.policies.set("rls-001", {
      id: "rls-001",
      modelId: "model-001",
      tableId: "table-sales",
      oqlExpression: 'USERATTRIBUTE("region") = "US"',
      appliesToRoles: ["viewer", "editor"],
      isEnabled: true,
      priority: 10,
      description: "US viewers/editors see only US sales data",
      createdAt: now,
      updatedAt: now,
      createdBy: "user-001",
    });

    this.policies.set("rls-002", {
      id: "rls-002",
      modelId: "model-001",
      tableId: "table-sales",
      oqlExpression: 'USERATTRIBUTE("department") IN ("Engineering", "Data")',
      appliesToRoles: ["admin"],
      isEnabled: true,
      priority: 20,
      description: "Engineering/Data admins see sales for their department",
      createdAt: now,
      updatedAt: now,
      createdBy: "user-001",
    });

    this.policies.set("rls-003", {
      id: "rls-003",
      modelId: "model-001",
      tableId: "table-revenue",
      oqlExpression: 'USERATTRIBUTE("region") = "US" AND USERATTRIBUTE("cost_center") = "CC001"',
      appliesToRoles: [],
      isEnabled: true,
      priority: 10,
      description: "Hierarchical: only CC001 users see CC001 revenue",
      createdAt: now,
      updatedAt: now,
      createdBy: "user-001",
    });

    this.policies.set("rls-004", {
      id: "rls-004",
      modelId: "model-002",
      tableId: "table-inventory",
      oqlExpression: 'USERATTRIBUTE("region") != "APAC"',
      appliesToRoles: ["viewer"],
      isEnabled: false,
      priority: 100,
      description: "Disabled policy: APAC exclusion for inventory",
      createdAt: now,
      updatedAt: now,
      createdBy: "user-001",
    });

    this.policies.set("rls-005", {
      id: "rls-005",
      modelId: "model-001",
      tableId: "table-customers",
      oqlExpression: 'USERATTRIBUTE("region") = "EU" OR USERATTRIBUTE("region") = "US"',
      appliesToRoles: ["editor", "viewer", "data_steward"],
      isEnabled: true,
      priority: 5,
      description: "EU and US users can see customers in their regions",
      createdAt: now,
      updatedAt: now,
      createdBy: "user-002",
    });
  }
}
