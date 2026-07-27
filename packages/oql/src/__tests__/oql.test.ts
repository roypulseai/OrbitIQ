import { describe, it, expect } from "vitest";
import { compileOQL, Lexer, Parser, Compiler, MeasureDAG, Lexer as L2, Parser as P2 } from "../index";

function sql(oql: string, dialect: string = "postgresql"): string {
  const result = compileOQL(oql, { dialect, parameterized: false });
  return result.sql.trim();
}

function sqlParams(oql: string): { sql: string; params: unknown[] } {
  return compileOQL(oql, { dialect: "postgresql", parameterized: true });
}

// Helper: case-insensitive contains
function contains(haystack: string, needle: string): boolean {
  return haystack.toUpperCase().includes(needle.toUpperCase());
}

// ═══════════════════════════════════════════════════════════════════════════
// LEXER TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe("Lexer", () => {
  it("tokenizes basic SELECT", () => {
    const lexer = new Lexer("SELECT id, name FROM users");
    const tokens = lexer.tokenize();
    expect(tokens.map((t) => t.type)).toEqual(["SELECT", "IDENTIFIER", "COMMA", "IDENTIFIER", "FROM", "IDENTIFIER", "EOF"]);
  });

  it("tokenizes CALCULATE", () => {
    const lexer = new Lexer("SELECT CALCULATE(SUM(revenue)) FROM sales");
    const tokens = lexer.tokenize();
    expect(tokens.find((t) => t.type === "CALCULATE")).toBeDefined();
  });

  it("tokenizes window functions", () => {
    const lexer = new Lexer("SELECT RANK() OVER (ORDER BY revenue DESC) FROM sales");
    const tokens = lexer.tokenize();
    expect(tokens.find((t) => t.type === "RANK")).toBeDefined();
    expect(tokens.find((t) => t.type === "OVER")).toBeDefined();
  });

  it("tokenizes time intelligence", () => {
    const lexer = new Lexer("SELECT YTD(order_date) FROM orders");
    const tokens = lexer.tokenize();
    expect(tokens.find((t) => t.type === "YTD")).toBeDefined();
  });

  it("tokenizes context clearing", () => {
    const lexer = new Lexer("SELECT ALL(sales) FROM sales");
    const tokens = lexer.tokenize();
    expect(tokens.find((t) => t.type === "ALL")).toBeDefined();
  });

  it("tokenizes IF/SWITCH", () => {
    const lexer = new Lexer("SELECT IF(x > 0, 'yes', 'no') FROM t");
    const tokens = lexer.tokenize();
    expect(tokens.find((t) => t.type === "IF")).toBeDefined();
  });

  it("tokenizes MEDIAN/PERCENTILE", () => {
    const lexer = new Lexer("SELECT MEDIAN(salary), PERCENTILE(salary, 0.9) FROM employees");
    const tokens = lexer.tokenize();
    expect(tokens.find((t) => t.type === "MEDIAN")).toBeDefined();
    expect(tokens.find((t) => t.type === "PERCENTILE")).toBeDefined();
  });

  it("tokenizes text functions", () => {
    const lexer = new Lexer("SELECT UPPER(name), TRIM(email), LEN(name) FROM users");
    const tokens = lexer.tokenize();
    expect(tokens.find((t) => t.type === "UPPER")).toBeDefined();
    expect(tokens.find((t) => t.type === "TRIM")).toBeDefined();
    expect(tokens.find((t) => t.type === "LEN")).toBeDefined();
  });

  it("tokenizes relationship functions", () => {
    const lexer = new Lexer("SELECT RELATED(department.name) FROM employees");
    const tokens = lexer.tokenize();
    expect(tokens.find((t) => t.type === "RELATED")).toBeDefined();
  });

  it("tokenizes comments", () => {
    const lexer = new Lexer("SELECT -- comment\nid FROM users");
    const tokens = lexer.tokenize();
    expect(tokens.length).toBe(5);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// BASIC SQL COMPILATION
// ═══════════════════════════════════════════════════════════════════════════

describe("Basic SQL", () => {
  it("compiles simple SELECT", () => {
    const result = sql("SELECT id, name FROM users");
    expect(contains(result, "SELECT")).toBe(true);
    expect(contains(result, '"id"')).toBe(true);
    expect(contains(result, '"name"')).toBe(true);
    expect(contains(result, '"users"')).toBe(true);
  });

  it("compiles SELECT with WHERE", () => {
    const result = sql("SELECT id FROM users WHERE age > 18");
    expect(contains(result, "WHERE")).toBe(true);
  });

  it("compiles GROUP BY with ORDER BY", () => {
    const result = sql("SELECT region, SUM(revenue) AS total FROM sales GROUP BY region ORDER BY total DESC");
    expect(contains(result, "GROUP BY")).toBe(true);
    expect(contains(result, "ORDER BY")).toBe(true);
    expect(contains(result, "SUM")).toBe(true);
  });

  it("compiles JOIN", () => {
    const result = sql("SELECT u.name, o.id FROM users u LEFT JOIN orders o ON u.id = o.user_id");
    expect(contains(result, "LEFT JOIN")).toBe(true);
    expect(contains(result, "ON")).toBe(true);
  });

  it("compiles HAVING", () => {
    const result = sql("SELECT dept, COUNT(*) AS cnt FROM emp GROUP BY dept HAVING COUNT(*) > 5");
    expect(contains(result, "HAVING")).toBe(true);
  });

  it("compiles LIMIT and OFFSET", () => {
    const result = sql("SELECT id FROM users LIMIT 10 OFFSET 5");
    expect(contains(result, "LIMIT 10")).toBe(true);
    expect(contains(result, "OFFSET 5")).toBe(true);
  });

  it("compiles BETWEEN", () => {
    expect(contains(sql("SELECT id FROM t WHERE age BETWEEN 18 AND 65"), "BETWEEN")).toBe(true);
  });

  it("compiles IN", () => {
    expect(contains(sql("SELECT id FROM t WHERE status IN ('a', 'b')"), "IN")).toBe(true);
  });

  it("compiles IS NULL / IS NOT NULL", () => {
    const result = sql("SELECT id FROM t WHERE name IS NULL AND email IS NOT NULL");
    expect(contains(result, "IS NULL")).toBe(true);
    expect(contains(result, "IS NOT NULL")).toBe(true);
  });

  it("compiles LIKE", () => {
    expect(contains(sql("SELECT id FROM t WHERE name LIKE '%test%'"), "LIKE")).toBe(true);
  });

  it("compiles boolean literals", () => {
    expect(contains(sql("SELECT id FROM t WHERE active = TRUE"), "TRUE")).toBe(true);
  });

  it("compiles parameterized query", () => {
    const { sql: s, params } = sqlParams("SELECT id FROM users WHERE name = 'John' AND age > 25");
    expect(contains(s, "$1")).toBe(true);
    expect(contains(s, "$2")).toBe(true);
    expect(params).toContain("John");
    expect(params).toContain(25);
  });

  it("compiles NOT", () => {
    expect(contains(sql("SELECT id FROM t WHERE NOT active"), "NOT")).toBe(true);
  });

  it("compiles OR", () => {
    const result = sql("SELECT id FROM t WHERE a = 1 OR b = 2");
    expect(contains(result, "OR")).toBe(true);
  });

  it("compiles arithmetic", () => {
    const result = sql("SELECT id + 1 AS next_id FROM t");
    expect(contains(result, "+")).toBe(true);
  });

  it("compiles multiple aggregate functions", () => {
    const result = sql("SELECT MIN(price), MAX(price), AVG(price) FROM products");
    expect(contains(result, "MIN")).toBe(true);
    expect(contains(result, "MAX")).toBe(true);
    expect(contains(result, "AVG")).toBe(true);
  });

  it("compiles COUNTDISTINCT", () => {
    const result = sql("SELECT COUNTDISTINCT(user_id) FROM orders");
    expect(contains(result, "COUNT(DISTINCT")).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// STATISTICAL FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

describe("Statistical Functions", () => {
  it("compiles MEDIAN (postgresql)", () => {
    const result = sql("SELECT MEDIAN(salary) FROM employees", "postgresql");
    expect(contains(result, "PERCENTILE_CONT(0.5)")).toBe(true);
  });

  it("compiles MEDIAN (bigquery)", () => {
    const result = sql("SELECT MEDIAN(salary) FROM employees", "bigquery");
    expect(contains(result, "APPROX_QUANTILES")).toBe(true);
  });

  it("compiles PERCENTILE", () => {
    const result = sql("SELECT PERCENTILE(salary, 0.9) FROM employees");
    expect(contains(result, "PERCENTILE_CONT(0.9)")).toBe(true);
  });

  it("compiles STDEV", () => {
    expect(contains(sql("SELECT STDEV(salary) FROM employees"), "STDDEV")).toBe(true);
  });

  it("compiles VARIANCE", () => {
    expect(contains(sql("SELECT VARIANCE(salary) FROM employees"), "VARIANCE")).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CALCULATE
// ═══════════════════════════════════════════════════════════════════════════

describe("CALCULATE", () => {
  it("compiles CALCULATE with no filters", () => {
    const result = sql("SELECT CALCULATE(SUM(revenue)) FROM sales");
    expect(contains(result, "SUM")).toBe(true);
  });

  it("compiles CALCULATE with explicit filter", () => {
    const result = sql("SELECT CALCULATE(SUM(revenue), region = 'EMEA') FROM sales");
    expect(contains(result, "SUM")).toBe(true);
    expect(contains(result, "EMEA")).toBe(true);
  });

  it("compiles CALCULATE with multiple filters", () => {
    const result = sql("SELECT CALCULATE(SUM(revenue), region = 'EMEA') FROM sales");
    expect(contains(result, "SUM")).toBe(true);
  });

  it("compiles CALCULATE with ALL context clearing", () => {
    const result = sql("SELECT CALCULATE(SUM(revenue), ALL(sales)) FROM sales");
    expect(contains(result, "SUM")).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// WINDOW / RANKING FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

describe("Window Functions", () => {
  it("compiles RANK() OVER (ORDER BY)", () => {
    const result = sql("SELECT RANK() OVER (ORDER BY revenue DESC) AS r FROM sales");
    expect(contains(result, "RANK()")).toBe(true);
    expect(contains(result, "OVER")).toBe(true);
    expect(contains(result, "ORDER BY")).toBe(true);
  });

  it("compiles DENSERANK() OVER (PARTITION BY ... ORDER BY)", () => {
    const result = sql("SELECT DENSERANK() OVER (PARTITION BY region ORDER BY revenue DESC) AS dr FROM sales");
    expect(contains(result, "DENSE_RANK()")).toBe(true);
    expect(contains(result, "PARTITION BY")).toBe(true);
  });

  it("compiles RUNNINGSUM with default frame", () => {
    const result = sql("SELECT RUNNINGSUM(amount) OVER (ORDER BY dt) AS rt FROM orders");
    expect(contains(result, "SUM")).toBe(true);
    expect(contains(result, "OVER")).toBe(true);
  });

  it("compiles MOVINGAVERAGE with default frame", () => {
    const result = sql("SELECT MOVINGAVERAGE(amount) OVER (ORDER BY dt) AS ma FROM orders");
    expect(contains(result, "AVG")).toBe(true);
    expect(contains(result, "OVER")).toBe(true);
  });

  it("compiles PERCENTOFTOTAL", () => {
    const result = sql("SELECT PERCENTOFTOTAL(revenue) OVER () AS pct FROM sales");
    expect(contains(result, "100.0")).toBe(true);
    expect(contains(result, "OVER")).toBe(true);
  });

  it("compiles window with PARTITION BY and ORDER BY", () => {
    const result = sql("SELECT RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS r FROM emp");
    expect(contains(result, "PARTITION BY")).toBe(true);
    expect(contains(result, "ORDER BY")).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// TIME INTELLIGENCE
// ═══════════════════════════════════════════════════════════════════════════

describe("Time Intelligence", () => {
  it("compiles SAMEPERIODLASTYEAR", () => {
    const result = sql("SELECT SAMEPERIODLASTYEAR(order_date) FROM orders");
    expect(contains(result, "ORDER_DATE")).toBe(true);
    expect(contains(result, "INTERVAL")).toBe(true);
  });

  it("compiles YTD", () => {
    const result = sql("SELECT YTD(order_date) FROM orders");
    expect(contains(result, "DATE_TRUNC")).toBe(true);
    expect(contains(result, "CURRENT_DATE")).toBe(true);
  });

  it("compiles QTD", () => {
    const result = sql("SELECT QTD(order_date) FROM orders");
    expect(contains(result, "quarter")).toBe(true);
  });

  it("compiles MTD", () => {
    const result = sql("SELECT MTD(order_date) FROM orders");
    expect(contains(result, "month")).toBe(true);
  });

  it("compiles DATESBETWEEN", () => {
    const result = sql("SELECT DATESBETWEEN(order_date, '2024-01-01', '2024-12-31') FROM orders");
    expect(contains(result, ">=")).toBe(true);
    expect(contains(result, "<=")).toBe(true);
  });

  it("compiles ROLLINGN", () => {
    const result = sql("SELECT ROLLINGN(order_date, 30) FROM orders");
    expect(contains(result, "30")).toBe(true);
    expect(contains(result, "CURRENT_DATE")).toBe(true);
  });

  it("compiles TIME THIS_MONTH via WHERE", () => {
    const result = sql("SELECT id FROM orders WHERE TIME LAST_MONTH");
    expect(contains(result, "DATE_TRUNC")).toBe(true);
    expect(contains(result, "month")).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// IF / SWITCH
// ═══════════════════════════════════════════════════════════════════════════

describe("IF / SWITCH", () => {
  it("compiles IF with true/false branches", () => {
    const result = sql("SELECT IF(age > 18, 'adult', 'minor') AS category FROM users");
    expect(contains(result, "CASE WHEN")).toBe(true);
    expect(contains(result, "THEN")).toBe(true);
    expect(contains(result, "ELSE")).toBe(true);
    expect(contains(result, "END")).toBe(true);
  });

  it("compiles IF with no false branch", () => {
    const result = sql("SELECT IF(active = 1, 'yes') FROM users");
    expect(contains(result, "CASE WHEN")).toBe(true);
    expect(contains(result, "ELSE NULL")).toBe(true);
  });

  it("compiles SWITCH with base expression", () => {
    const result = sql("SELECT SWITCH(status, 1, 'Active', 2, 'Inactive') FROM users");
    expect(contains(result, "CASE")).toBe(true);
    expect(contains(result, "WHEN")).toBe(true);
  });

  it("compiles SWITCH with default", () => {
    const result = sql("SELECT SWITCH(region, 'NA', 'North America', 'EU', 'Europe', 'Other') FROM sales");
    expect(contains(result, "CASE")).toBe(true);
    expect(contains(result, "ELSE")).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CONTEXT CLEARING
// ═══════════════════════════════════════════════════════════════════════════

describe("Context Clearing", () => {
  it("compiles ALL(table)", () => {
    const result = sql("SELECT ALL(sales) FROM sales");
    expect(contains(result, "ALL(SALES)")).toBe(true);
  });

  it("compiles ALLSELECTED(table)", () => {
    const result = sql("SELECT ALLSELECTED(sales) FROM sales");
    expect(contains(result, "ALLSELECTED(SALES)")).toBe(true);
  });

  it("compiles ALLEXCEPT(table, col)", () => {
    const result = sql("SELECT ALLEXCEPT(sales, region) FROM sales");
    expect(contains(result, "ALLEXCEPT(SALES, REGION)")).toBe(true);
  });

  it("compiles REMOVEFILTERS(table)", () => {
    const result = sql("SELECT REMOVEFILTERS(sales) FROM sales");
    expect(contains(result, "REMOVEFILTERS(SALES)")).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// RELATIONSHIP FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

describe("Relationship Functions", () => {
  it("compiles RELATED(table.column)", () => {
    const result = sql("SELECT RELATED(departments.name) FROM employees");
    expect(contains(result, "DEPARTMENTS")).toBe(true);
    expect(contains(result, "NAME")).toBe(true);
  });

  it("compiles RELATEDTABLE(table)", () => {
    const result = sql("SELECT RELATEDTABLE(orders) FROM customers");
    expect(contains(result, "ORDERS")).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// TEXT FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

describe("Text Functions", () => {
  it("compiles UPPER", () => {
    expect(contains(sql("SELECT UPPER(name) FROM users"), "UPPER")).toBe(true);
  });

  it("compiles LOWER", () => {
    expect(contains(sql("SELECT LOWER(email) FROM users"), "LOWER")).toBe(true);
  });

  it("compiles TRIM", () => {
    expect(contains(sql("SELECT TRIM(name) FROM users"), "TRIM")).toBe(true);
  });

  it("compiles LEN", () => {
    expect(contains(sql("SELECT LEN(name) FROM users"), "LENGTH")).toBe(true);
  });

  it("compiles CONCAT (postgresql)", () => {
    const result = sql("SELECT CONCAT(first_name, ' ', last_name) AS full_name FROM users");
    expect(contains(result, "||")).toBe(true);
  });

  it("compiles CONCAT (bigquery)", () => {
    const result = sql("SELECT CONCAT(first_name, ' ', last_name) AS full_name FROM users", "bigquery");
    expect(contains(result, "CONCAT")).toBe(true);
  });

  it("compiles IFERROR", () => {
    const result = sql("SELECT IFERROR(amount / quantity, 0) AS price FROM orders");
    expect(contains(result, "CASE WHEN")).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// DATE FUNCTIONS (multi-dialect)
// ═══════════════════════════════════════════════════════════════════════════

describe("Date Functions", () => {
  it("compiles DATE_TRUNC (postgresql)", () => {
    expect(contains(sql("SELECT DATE_TRUNC('month', created_at) FROM t", "postgresql"), "DATE_TRUNC")).toBe(true);
  });

  it("compiles DATE_TRUNC (mysql)", () => {
    expect(contains(sql("SELECT DATE_TRUNC('month', created_at) FROM t", "mysql"), "DATE_FORMAT")).toBe(true);
  });

  it("compiles DATE_ADD (postgresql)", () => {
    expect(contains(sql("SELECT DATE_ADD(created_at, 'day', 7) FROM t", "postgresql"), "INTERVAL")).toBe(true);
  });

  it("compiles DATE_ADD (snowflake)", () => {
    expect(contains(sql("SELECT DATE_ADD(created_at, 'day', 7) FROM t", "snowflake"), "DATEADD")).toBe(true);
  });

  it("compiles DATE_DIFF (bigquery)", () => {
    expect(contains(sql("SELECT DATE_DIFF(end_date, start_date, 'day') FROM t", "bigquery"), "DATE_DIFF")).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// SEMANTIC MODEL (METRIC / DIMENSION)
// ═══════════════════════════════════════════════════════════════════════════

describe("Semantic Model", () => {
  it("compiles METRIC keyword", () => {
    expect(contains(sql("SELECT METRIC revenue FROM sales"), "REVENUE")).toBe(true);
  });

  it("compiles DIMENSION keyword", () => {
    expect(contains(sql("SELECT DIMENSION region FROM sales"), "REGION")).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// DIALECT COMPILATION
// ═══════════════════════════════════════════════════════════════════════════

describe("Dialect Variants", () => {
  it("compiles for mysql", () => {
    expect(contains(sql("SELECT DATE_TRUNC('month', created_at) FROM t", "mysql"), "DATE_FORMAT")).toBe(true);
  });

  it("compiles for bigquery", () => {
    const result = sql("SELECT DATE_TRUNC('month', created_at) FROM t", "bigquery");
    expect(contains(result, "DATE_TRUNC")).toBe(true);
  });

  it("compiles for snowflake", () => {
    expect(contains(sql("SELECT DATE_ADD(created_at, 'day', 7) FROM t", "snowflake"), "DATEADD")).toBe(true);
  });

  it("compiles for duckdb", () => {
    expect(contains(sql("SELECT DATE_TRUNC('month', created_at) FROM t", "duckdb"), "DATE_TRUNC")).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// DAG (Dependency Graph)
// ═══════════════════════════════════════════════════════════════════════════

describe("MeasureDAG", () => {
  it("detects no circular references", () => {
    const dag = new MeasureDAG();
    const l1 = new L2("SUM(revenue)");
    const p1 = new P2(l1.tokenize());
    dag.addMeasure("TotalRevenue", p1.parseExpression());

    const l2 = new L2("[TotalRevenue] / 12");
    const p2 = new P2(l2.tokenize());
    dag.addMeasure("MonthlyRevenue", p2.parseExpression());

    const result = dag.validate();
    expect(result.valid).toBe(true);
    expect(result.executionOrder).toContain("TOTALREVENUE");
    expect(result.executionOrder).toContain("MONTHLYREVENUE");
    expect(result.executionOrder.indexOf("TOTALREVENUE")).toBeLessThan(
      result.executionOrder.indexOf("MONTHLYREVENUE")
    );
  });

  it("detects circular references", () => {
    const dag = new MeasureDAG();
    const l1 = new L2("[MeasureB]");
    dag.addMeasure("MeasureA", new P2(l1.tokenize()).parseExpression());

    const l2 = new L2("[MeasureA]");
    dag.addMeasure("MeasureB", new P2(l2.tokenize()).parseExpression());

    const result = dag.validate();
    expect(result.valid).toBe(false);
    expect(result.circularReferences.length).toBeGreaterThan(0);
  });

  it("gets transitive dependencies", () => {
    const dag = new MeasureDAG();
    dag.addMeasure("Base", new P2(new L2("1").tokenize()).parseExpression());
    dag.addMeasure("Mid", new P2(new L2("[Base] + 1").tokenize()).parseExpression());
    dag.addMeasure("Top", new P2(new L2("[Mid] * 2").tokenize()).parseExpression());

    const deps = dag.getTransitiveDependencies("Top");
    expect(deps.has("MID")).toBe(true);
    expect(deps.has("BASE")).toBe(true);
  });

  it("gets dependents", () => {
    const dag = new MeasureDAG();
    dag.addMeasure("Base", new P2(new L2("1").tokenize()).parseExpression());
    dag.addMeasure("Derived", new P2(new L2("[Base] + 1").tokenize()).parseExpression());

    const dependents = dag.getDependents("Base");
    expect(dependents).toContain("DERIVED");
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// ERROR HANDLING
// ═══════════════════════════════════════════════════════════════════════════

describe("Error Handling", () => {
  it("throws on invalid syntax", () => {
    expect(() => sql("SELECT FROM WHERE")).toThrow();
  });

  it("throws on unexpected token", () => {
    expect(() => sql("SELECT * FROM @invalid")).toThrow();
  });

  it("compileOQL works for basic query", () => {
    expect(() => sql("SELECT 1 FROM t")).not.toThrow();
  });
});
