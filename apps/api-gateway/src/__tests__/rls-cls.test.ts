import { describe, it, expect, beforeEach } from "vitest";
import { RLSService } from "../services/rls.service";
import { CLSService } from "../services/cls.service";

describe("RLS Enforcement", () => {
  let rls: RLSService;

  beforeEach(() => {
    rls = new RLSService();
  });

  describe("getUserAttributes", () => {
    it("returns attributes for existing user", () => {
      const attr = rls.getUserAttributes("user-001");
      expect(attr).toBeDefined();
      expect(attr!.attributes.region).toBe("US");
      expect(attr!.attributes.department).toBe("Engineering");
    });

    it("returns undefined for non-existing user", () => {
      expect(rls.getUserAttributes("user-999")).toBeUndefined();
    });
  });

  describe("getEffectivePolicies", () => {
    it("returns policies when user has matching role attribute under 'roles' key", () => {
      rls.setUserAttributes("test-user", { region: "US", roles: "editor" });
      const policies = rls.getEffectivePolicies("test-user", "table-sales", "model-001");
      expect(policies.length).toBeGreaterThan(0);
    });

    it("returns empty when user has no 'roles' attribute", () => {
      const policies = rls.getEffectivePolicies("user-002", "table-sales", "model-001");
      expect(policies).toHaveLength(0);
    });

    it("returns empty for non-matching table", () => {
      rls.setUserAttributes("test-user", { region: "US", roles: "viewer" });
      const policies = rls.getEffectivePolicies("test-user", "nonexistent-table", "model-001");
      expect(policies).toHaveLength(0);
    });

    it("excludes disabled policies", () => {
      rls.setUserAttributes("test-user", { region: "APAC", roles: "viewer" });
      const policies = rls.getEffectivePolicies("test-user", "table-inventory", "model-002");
      const disabledPolicy = policies.find(p => p.id === "rls-004");
      expect(disabledPolicy).toBeUndefined();
    });

    it("returns policies sorted by priority", () => {
      rls.setUserAttributes("test-user", { region: "US", roles: "editor" });
      const policies = rls.getEffectivePolicies("test-user", "table-sales", "model-001");
      if (policies.length > 1) {
        for (let i = 1; i < policies.length; i++) {
          expect(policies[i].priority).toBeGreaterThanOrEqual(policies[i - 1].priority);
        }
      }
    });
  });

  describe("buildRLSFilter", () => {
    it("generates 1=1 when no policies", () => {
      const filter = rls.buildRLSFilter([], {});
      expect(filter).toBe("1 = 1");
    });

    it("resolves USERATTRIBUTE placeholders to literal values", () => {
      const policy = rls.getPolicy("rls-001");
      const filter = rls.buildRLSFilter([policy], { region: "US" });
      expect(filter).toContain("US");
      expect(filter).toContain("=");
    });

    it("combines multiple policies with AND", () => {
      const p1 = rls.getPolicy("rls-001");
      const p2 = rls.getPolicy("rls-002");
      const filter = rls.buildRLSFilter([p1, p2], { region: "US", department: "Engineering" });
      expect(filter).toContain("AND");
    });
  });

  describe("evaluatePolicy", () => {
    it("evaluates equality expression", () => {
      expect(rls.evaluatePolicy('USERATTRIBUTE("region") = "US"', { region: "US" })).toBe(true);
      expect(rls.evaluatePolicy('USERATTRIBUTE("region") = "US"', { region: "EU" })).toBe(false);
    });

    it("evaluates IN expression", () => {
      expect(rls.evaluatePolicy('USERATTRIBUTE("department") IN ("Engineering", "Data")', { department: "Engineering" })).toBe(true);
      expect(rls.evaluatePolicy('USERATTRIBUTE("department") IN ("Engineering", "Data")', { department: "Sales" })).toBe(false);
    });

    it("evaluates AND expression", () => {
      const expr = 'USERATTRIBUTE("region") = "US" AND USERATTRIBUTE("cost_center") = "CC001"';
      expect(rls.evaluatePolicy(expr, { region: "US", cost_center: "CC001" })).toBe(true);
      expect(rls.evaluatePolicy(expr, { region: "EU", cost_center: "CC001" })).toBe(false);
    });

    it("evaluates OR expression", () => {
      const expr = 'USERATTRIBUTE("region") = "EU" OR USERATTRIBUTE("region") = "US"';
      expect(rls.evaluatePolicy(expr, { region: "EU" })).toBe(true);
      expect(rls.evaluatePolicy(expr, { region: "US" })).toBe(true);
      expect(rls.evaluatePolicy(expr, { region: "APAC" })).toBe(false);
    });

    it("evaluates NOT expression", () => {
      expect(rls.evaluatePolicy('NOT USERATTRIBUTE("region") = "APAC"', { region: "US" })).toBe(true);
      expect(rls.evaluatePolicy('NOT USERATTRIBUTE("region") = "APAC"', { region: "APAC" })).toBe(false);
    });

    it("returns false for unparseable expressions", () => {
      expect(rls.evaluatePolicy("COMPLETELY_INVALID", {})).toBe(false);
    });
  });

  describe("setUserAttributes", () => {
    it("creates and updates user attributes", () => {
      const record = rls.setUserAttributes("new-user", { region: "US" });
      expect(record.userId).toBe("new-user");
      expect(record.attributes.region).toBe("US");

      const updated = rls.setUserAttributes("new-user", { department: "Engineering" });
      expect(updated.attributes.region).toBe("US");
      expect(updated.attributes.department).toBe("Engineering");
    });
  });

  describe("CRUD operations", () => {
    it("creates, reads, updates, and deletes policies", () => {
      const policy = rls.createPolicy({
        modelId: "test-model",
        tableId: "test-table",
        oqlExpression: 'USERATTRIBUTE("region") = "US"',
        appliesToRoles: ["viewer"],
        description: "Test policy",
      });
      expect(policy.id).toBeDefined();
      expect(policy.isEnabled).toBe(true);

      const fetched = rls.getPolicy(policy.id);
      expect(fetched.oqlExpression).toBe('USERATTRIBUTE("region") = "US"');

      const updated = rls.updatePolicy(policy.id, { priority: 50 });
      expect(updated.priority).toBe(50);

      const deleted = rls.deletePolicy(policy.id);
      expect(deleted).toBe(true);
    });
  });
});

describe("CLS Enforcement", () => {
  let cls: CLSService;

  beforeEach(() => {
    cls = new CLSService();
  });

  describe("applyMasking", () => {
    it("FULL mask replaces value with asterisks", () => {
      const rule = {
        id: "test",
        modelId: "model-1",
        tableId: "table-customers",
        columnName: "email",
        maskType: "FULL" as const,
        appliesToRoles: ["viewer"],
        isEnabled: true,
        createdAt: new Date(),
      };
      const result = cls.applyMasking("john@example.com", rule, ["viewer"]);
      expect(result).not.toBe("john@example.com");
      expect(String(result)).toContain("@");
    });

    it("PARTIAL mask shows last N characters", () => {
      const rule = {
        id: "test",
        modelId: "model-1",
        tableId: "table-customers",
        columnName: "phone",
        maskType: "PARTIAL" as const,
        maskConfig: { showLastN: 4 },
        appliesToRoles: ["viewer"],
        isEnabled: true,
        createdAt: new Date(),
      };
      const result = cls.applyMasking("5551234567", rule, ["viewer"]);
      expect(String(result)).toContain("4567");
    });

    it("HASH mask produces consistent hash", () => {
      const rule = {
        id: "test",
        modelId: "model-1",
        tableId: "table-logs",
        columnName: "ip",
        maskType: "HASH" as const,
        appliesToRoles: ["viewer"],
        isEnabled: true,
        createdAt: new Date(),
      };
      const result1 = cls.applyMasking("192.168.1.1", rule, ["viewer"]);
      const result2 = cls.applyMasking("192.168.1.1", rule, ["viewer"]);
      expect(result1).toBe(result2);
      expect(String(result1).length).toBe(16);
    });

    it("TOKENIZE mask produces token format", () => {
      const rule = {
        id: "test",
        modelId: "model-1",
        tableId: "table-employees",
        columnName: "salary",
        maskType: "TOKENIZE" as const,
        appliesToRoles: ["viewer"],
        isEnabled: true,
        createdAt: new Date(),
      };
      const result = cls.applyMasking("75000", rule, ["viewer"]);
      expect(String(result)).toMatch(/^TOK-/);
    });

    it("GENERALIZE mask maps to bucket", () => {
      const rule = {
        id: "test",
        modelId: "model-1",
        tableId: "table-employees",
        columnName: "age",
        maskType: "GENERALIZE" as const,
        maskConfig: { buckets: ["0-20", "20-30", "30-40", "40-50", "50+"] },
        appliesToRoles: ["viewer"],
        isEnabled: true,
        createdAt: new Date(),
      };
      const result = cls.applyMasking("35", rule, ["viewer"]);
      expect(result).toBe("30-40");
    });

    it("returns value unchanged for non-matching roles", () => {
      const rule = {
        id: "test",
        modelId: "model-1",
        tableId: "table-customers",
        columnName: "email",
        maskType: "FULL" as const,
        appliesToRoles: ["admin"],
        isEnabled: true,
        createdAt: new Date(),
      };
      const result = cls.applyMasking("john@example.com", rule, ["viewer"]);
      expect(result).toBe("john@example.com");
    });

    it("returns value unchanged when rule is disabled", () => {
      const rule = {
        id: "test",
        modelId: "model-1",
        tableId: "table-customers",
        columnName: "email",
        maskType: "FULL" as const,
        appliesToRoles: ["viewer"],
        isEnabled: false,
        createdAt: new Date(),
      };
      const result = cls.applyMasking("john@example.com", rule, ["viewer"]);
      expect(result).toBe("john@example.com");
    });

    it("NONE mask returns value unchanged", () => {
      const rule = {
        id: "test",
        modelId: "model-1",
        tableId: "table-customers",
        columnName: "email",
        maskType: "NONE" as const,
        appliesToRoles: ["viewer"],
        isEnabled: true,
        createdAt: new Date(),
      };
      const result = cls.applyMasking("john@example.com", rule, ["viewer"]);
      expect(result).toBe("john@example.com");
    });
  });

  describe("autoDetectPII", () => {
    it("detects email patterns", () => {
      const result = cls.autoDetectPII("email_address");
      expect(result).not.toBeNull();
      expect(result!.piiType).toBe("email");
    });

    it("detects name patterns", () => {
      const result = cls.autoDetectPII("first_name");
      expect(result).not.toBeNull();
      expect(result!.piiType).toBe("name");
    });

    it("detects address patterns", () => {
      const result = cls.autoDetectPII("home_address");
      expect(result).not.toBeNull();
      expect(result!.piiType).toBe("address");
    });

    it("detects IP patterns", () => {
      const result = cls.autoDetectPII("ip_address");
      expect(result).not.toBeNull();
      expect(result!.piiType).toBe("ip_address");
    });

    it("detects DOB patterns", () => {
      const result = cls.autoDetectPII("date_of_birth");
      expect(result).not.toBeNull();
      expect(result!.piiType).toBe("dob");
    });

    it("returns null for non-PII columns", () => {
      const result = cls.autoDetectPII("revenue");
      expect(result).toBeNull();
    });
  });

  describe("PII tag management", () => {
    it("returns tags for a model", async () => {
      const tags = await cls.getPIITags("model-1");
      expect(tags.length).toBeGreaterThan(0);
    });

    it("creates rule and retrieves it", async () => {
      const rule = await cls.createRule({
        modelId: "test-model",
        tableId: "test-table",
        columnName: "test_col",
        maskType: "FULL",
        appliesToRoles: ["viewer"],
      });
      expect(rule.id).toBeDefined();

      const fetched = await cls.getRule(rule.id);
      expect(fetched).not.toBeNull();
      expect(fetched!.columnName).toBe("test_col");
    });
  });
});
