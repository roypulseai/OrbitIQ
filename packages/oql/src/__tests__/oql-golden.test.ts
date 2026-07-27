import { describe, it, expect } from "vitest";
import { compileOQL, MeasureDAG, Lexer, Parser } from "../index";

function sql(oql: string, dialect: string = "postgresql", parameterized = false): string {
  return compileOQL(oql, { dialect, parameterized }).sql.trim();
}

function sqlP(oql: string): { sql: string; params: unknown[] } {
  return compileOQL(oql, { dialect: "postgresql", parameterized: true });
}

function contains(haystack: string, needle: string): boolean {
  return haystack.toUpperCase().includes(needle.toUpperCase());
}

// ═══════════════════════════════════════════════════════════════════════════
// GOLDEN TESTS — Basic SELECT
// ═══════════════════════════════════════════════════════════════════════════

describe("Golden: Basic SELECT", () => {
  it("simple 2-column select uppercases identifiers", () => {
    const s = sql("SELECT id, name FROM users");
    expect(s).toContain('"ID"');
    expect(s).toContain('"NAME"');
    expect(s).toContain('"USERS"');
  });

  it("select with WHERE equality", () => {
    const s = sql("SELECT id FROM users WHERE age > 18");
    expect(s).toContain("WHERE");
    expect(s).toContain('"AGE" > 18');
  });

  it("select with WHERE string equality", () => {
    const s = sql("SELECT id FROM users WHERE name = 'Alice'");
    expect(s).toContain("'Alice'");
  });

  it("GROUP BY + ORDER BY", () => {
    const s = sql("SELECT region, SUM(revenue) AS total FROM sales GROUP BY region ORDER BY total DESC");
    expect(s).toContain('GROUP BY "REGION"');
    expect(s).toContain("SUM");
    expect(s).toContain("ORDER BY");
    expect(s).toContain("DESC");
  });

  it("LEFT JOIN", () => {
    const s = sql('SELECT u.name, o.id FROM users u LEFT JOIN orders o ON u.id = o.user_id');
    expect(s).toContain('LEFT JOIN');
    expect(s).toContain('ON');
  });

  it("INNER JOIN", () => {
    const s = sql('SELECT a.id, b.val FROM t1 a INNER JOIN t2 b ON a.id = b.t1_id');
    expect(s).toContain('INNER JOIN');
  });

  it("HAVING clause", () => {
    const s = sql('SELECT dept, COUNT(*) AS cnt FROM emp GROUP BY dept HAVING COUNT(*) > 5');
    expect(s).toContain('HAVING');
    expect(s).toContain('COUNT');
  });

  it("LIMIT and OFFSET", () => {
    const s = sql('SELECT id FROM users LIMIT 10 OFFSET 5');
    expect(s).toContain('LIMIT 10');
    expect(s).toContain('OFFSET 5');
  });

  it("BETWEEN", () => {
    const s = sql('SELECT id FROM t WHERE age BETWEEN 18 AND 65');
    expect(s).toContain('BETWEEN');
  });

  it("IN clause", () => {
    const s = sql("SELECT id FROM t WHERE status IN ('a', 'b')");
    expect(s).toContain('IN');
  });

  it("IS NULL and IS NOT NULL", () => {
    const s = sql('SELECT id FROM t WHERE name IS NULL AND email IS NOT NULL');
    expect(s).toContain('IS NULL');
    expect(s).toContain('IS NOT NULL');
  });

  it("LIKE", () => {
    const s = sql("SELECT id FROM t WHERE name LIKE '%test%'");
    expect(s).toContain("LIKE");
  });

  it("NOT", () => {
    const s = sql('SELECT id FROM t WHERE NOT active');
    expect(s).toContain('NOT');
  });

  it("OR", () => {
    const s = sql('SELECT id FROM t WHERE a = 1 OR b = 2');
    expect(s).toContain('OR');
  });

  it("arithmetic", () => {
    const s = sql('SELECT id + 1 AS next_id FROM t');
    expect(s).toContain('+');
  });

  it("multiple aggregates", () => {
    const s = sql('SELECT MIN(price), MAX(price), AVG(price) FROM products');
    expect(s).toContain('MIN');
    expect(s).toContain('MAX');
    expect(s).toContain('AVG');
  });

  it("COUNTDISTINCT", () => {
    const s = sql('SELECT COUNTDISTINCT(user_id) FROM orders');
    expect(s).toContain('COUNT(DISTINCT');
  });

  it("boolean literals", () => {
    const s = sql('SELECT id FROM t WHERE active = TRUE');
    expect(s).toContain('TRUE');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// GOLDEN TESTS — Parameterized Queries
// ═══════════════════════════════════════════════════════════════════════════

describe("Golden: Parameterized Queries", () => {
  it("string + integer parameters", () => {
    const { sql: s, params } = sqlP("SELECT id FROM users WHERE name = 'John' AND age > 25");
    expect(s).toContain('$1');
    expect(s).toContain('$2');
    expect(s).not.toContain("'John'");
    expect(params).toContain("John");
    expect(params).toContain(25);
  });

  it("non-parameterized keeps literals inline", () => {
    const s = sql("SELECT id FROM t WHERE name = 'Alice'", "postgresql", false);
    expect(s).toContain("'Alice'");
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// GOLDEN TESTS — Statistical Functions
// ═══════════════════════════════════════════════════════════════════════════

describe("Golden: Statistical Functions", () => {
  it("MEDIAN → postgresql PERCENTILE_CONT", () => {
    const s = sql("SELECT MEDIAN(salary) FROM employees", "postgresql");
    expect(s).toContain('PERCENTILE_CONT(0.5)');
    expect(s).toContain('WITHIN GROUP');
    expect(s).toContain('"SALARY"');
  });

  it("MEDIAN → bigquery APPROX_QUANTILES", () => {
    const s = sql("SELECT MEDIAN(salary) FROM employees", "bigquery");
    expect(s).toContain('APPROX_QUANTILES');
    expect(s).toContain('OFFSET(50)');
  });

  it("MEDIAN → mysql MEDIAN", () => {
    expect(sql("SELECT MEDIAN(salary) FROM employees", "mysql"))
      .toContain('MEDIAN');
  });

  it("PERCENTILE → postgresql PERCENTILE_CONT(0.9)", () => {
    const s = sql("SELECT PERCENTILE(salary, 0.9) FROM employees");
    expect(s).toContain('PERCENTILE_CONT(0.9)');
    expect(s).toContain('WITHIN GROUP');
  });

  it("STDEV → STDDEV", () => {
    expect(sql("SELECT STDEV(salary) FROM employees")).toContain('STDDEV');
  });

  it("VARIANCE stays VARIANCE", () => {
    expect(sql("SELECT VARIANCE(salary) FROM employees")).toContain('VARIANCE');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// GOLDEN TESTS — CALCULATE
// ═══════════════════════════════════════════════════════════════════════════

describe("Golden: CALCULATE", () => {
  it("CALCULATE without filters passes through", () => {
    const s = sql("SELECT CALCULATE(SUM(revenue)) FROM sales");
    expect(s).toContain('SUM');
  });

  it("CALCULATE with filter emits subquery", () => {
    const s = sql("SELECT CALCULATE(SUM(revenue), region = 'EMEA') FROM sales");
    expect(s).toContain('SUM');
    expect(s).toContain('EMEA');
  });

  it("CALCULATE with ALL emits warning", () => {
    const { warnings } = compileOQL("SELECT CALCULATE(SUM(revenue), ALL(sales)) FROM sales", { dialect: "postgresql", parameterized: false });
    expect(warnings.some(w => w.includes('Context function'))).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// GOLDEN TESTS — Window / Ranking Functions
// ═══════════════════════════════════════════════════════════════════════════

describe("Golden: Window Functions", () => {
  it("RANK() OVER (ORDER BY)", () => {
    const s = sql('SELECT RANK() OVER (ORDER BY revenue DESC) AS r FROM sales');
    expect(s).toContain('RANK()');
    expect(s).toContain('OVER');
    expect(s).toContain('ORDER BY');
    expect(s).toContain('DESC');
  });

  it("DENSERANK() OVER (PARTITION BY ... ORDER BY)", () => {
    const s = sql('SELECT DENSERANK() OVER (PARTITION BY region ORDER BY revenue DESC) AS dr FROM sales');
    expect(s).toContain('DENSE_RANK()');
    expect(s).toContain('PARTITION BY');
  });

  it("RUNNINGSUM with default ROWS frame", () => {
    const s = sql('SELECT RUNNINGSUM(amount) OVER (ORDER BY dt) AS rt FROM orders');
    expect(contains(s, 'SUM'));
    expect(s).toContain('ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW');
  });

  it("MOVINGAVERAGE with default ROWS frame", () => {
    const s = sql('SELECT MOVINGAVERAGE(amount) OVER (ORDER BY dt) AS ma FROM orders');
    expect(contains(s, 'AVG'));
    expect(s).toContain('ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW');
  });

  it("PERCENTOFTOTAL", () => {
    const s = sql('SELECT PERCENTOFTOTAL(revenue) OVER () AS pct FROM sales');
    expect(s).toContain('ROUND');
    expect(s).toContain('100.0');
    expect(s).toContain('NULLIF');
    expect(s).toContain('OVER');
  });

  it("window with PARTITION BY and ORDER BY", () => {
    const s = sql('SELECT RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS r FROM emp');
    expect(contains(s, 'PARTITION BY'));
    expect(contains(s, 'ORDER BY'));
    expect(s).toContain('DESC');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// GOLDEN TESTS — Time Intelligence (PostgreSQL dialect)
// ═══════════════════════════════════════════════════════════════════════════

describe("Golden: Time Intelligence (postgresql)", () => {
  const D = "postgresql";

  it("YTD", () => {
    const s = sql("SELECT YTD(order_date) FROM orders", D);
    expect(s).toContain('DATE_TRUNC');
    expect(s).toContain('CURRENT_DATE');
    expect(contains(s, 'year'));
  });

  it("QTD", () => {
    const s = sql("SELECT QTD(order_date) FROM orders", D);
    expect(s).toContain('DATE_TRUNC');
    expect(contains(s, 'quarter'));
  });

  it("MTD", () => {
    const s = sql("SELECT MTD(order_date) FROM orders", D);
    expect(s).toContain('DATE_TRUNC');
    expect(contains(s, 'month'));
  });

  it("DATESBETWEEN", () => {
    const s = sql("SELECT DATESBETWEEN(order_date, '2024-01-01', '2024-12-31') FROM orders", D);
    expect(s).toContain(">=");
    expect(s).toContain("<=");
    expect(s).toContain("'2024-01-01'");
    expect(s).toContain("'2024-12-31'");
  });

  it("ROLLINGN with 30 days", () => {
    const s = sql("SELECT ROLLINGN(order_date, 30) FROM orders", D);
    expect(s).toContain('30');
    expect(s).toContain('CURRENT_DATE');
    expect(s).toContain('INTERVAL');
  });

  it("SAMEPERIODLASTYEAR", () => {
    const s = sql("SELECT SAMEPERIODLASTYEAR(order_date) FROM orders", D);
    expect(s).toContain('DATE_TRUNC');
    expect(s).toContain('INTERVAL');
    expect(s).toContain('year');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// GOLDEN TESTS — Time Intelligence (BigQuery dialect)
// ═══════════════════════════════════════════════════════════════════════════

describe("Golden: Time Intelligence (bigquery)", () => {
  const D = "bigquery";

  it("YTD uses CURRENT_DATE()", () => {
    const s = sql("SELECT YTD(order_date) FROM orders", D);
    expect(s).toContain('CURRENT_DATE()');
    expect(s).toContain('DATE_TRUNC');
  });

  it("ROLLINGN uses DATE_SUB", () => {
    const s = sql("SELECT ROLLINGN(order_date, 7) FROM orders", D);
    expect(s).toContain('DATE_SUB');
    expect(s).toContain('INTERVAL');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// GOLDEN TESTS — IF / SWITCH
// ═══════════════════════════════════════════════════════════════════════════

describe("Golden: IF / SWITCH", () => {
  it("IF with both branches → CASE WHEN ... THEN ... ELSE ... END", () => {
    const s = sql("SELECT IF(age > 18, 'adult', 'minor') AS category FROM users");
    expect(s).toContain('CASE WHEN');
    expect(s).toContain("THEN 'adult'");
    expect(s).toContain("ELSE 'minor'");
    expect(s).toContain('END');
  });

  it("IF without false branch → ELSE NULL", () => {
    const s = sql("SELECT IF(active = 1, 'yes') FROM users");
    expect(s).toContain('CASE WHEN');
    expect(s).toContain("ELSE NULL");
    expect(s).toContain('END');
  });

  it("SWITCH with base expression", () => {
    const s = sql("SELECT SWITCH(status, 1, 'Active', 2, 'Inactive') FROM users");
    expect(s).toContain('CASE');
    expect(s).toContain('WHEN');
    expect(s).toContain('END');
  });

  it("SWITCH with default", () => {
    const s = sql("SELECT SWITCH(region, 'NA', 'North America', 'EU', 'Europe', 'Other') FROM sales");
    expect(s).toContain('CASE');
    expect(s).toContain('ELSE');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// GOLDEN TESTS — Context Clearing
// ═══════════════════════════════════════════════════════════════════════════

describe("Golden: Context Clearing", () => {
  it("ALL(SALES) → comment placeholder", () => {
    expect(sql("SELECT ALL(sales) FROM sales")).toContain('/* ALL(SALES) */');
  });

  it("ALLSELECTED(SALES) → comment placeholder", () => {
    expect(sql("SELECT ALLSELECTED(sales) FROM sales")).toContain('/* ALLSELECTED(SALES) */');
  });

  it("ALLEXCEPT(SALES, REGION) → comment with column", () => {
    expect(sql("SELECT ALLEXCEPT(sales, region) FROM sales")).toContain('/* ALLEXCEPT(SALES, REGION) */');
  });

  it("REMOVEFILTERS(SALES) → comment placeholder", () => {
    expect(sql("SELECT REMOVEFILTERS(sales) FROM sales")).toContain('/* REMOVEFILTERS(SALES) */');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// GOLDEN TESTS — Relationship Functions
// ═══════════════════════════════════════════════════════════════════════════

describe("Golden: Relationship Functions", () => {
  it("RELATED(DEPARTMENTS.NAME) → qualified identifier", () => {
    const s = sql("SELECT RELATED(departments.name) FROM employees");
    expect(s).toContain('"DEPARTMENTS"."NAME"');
  });

  it("RELATEDTABLE(ORDERS) → subquery placeholder", () => {
    const s = sql("SELECT RELATEDTABLE(orders) FROM customers");
    expect(s).toContain('SELECT');
    expect(s).toContain('"ORDERS"');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// GOLDEN TESTS — Text Functions
// ═══════════════════════════════════════════════════════════════════════════

describe("Golden: Text Functions", () => {
  it("UPPER", () => {
    expect(sql("SELECT UPPER(name) FROM users")).toContain('UPPER');
  });

  it("LOWER", () => {
    expect(sql("SELECT LOWER(email) FROM users")).toContain('LOWER');
  });

  it("TRIM", () => {
    expect(sql("SELECT TRIM(name) FROM users")).toContain('TRIM');
  });

  it("LEN → LENGTH", () => {
    expect(sql("SELECT LEN(name) FROM users")).toContain('LENGTH');
  });

  it("CONCAT → || in postgresql", () => {
    const s = sql("SELECT CONCAT(first_name, ' ', last_name) AS full_name FROM users", "postgresql");
    expect(s).toContain('||');
  });

  it("CONCAT → CONCAT() in bigquery", () => {
    const s = sql("SELECT CONCAT(first_name, ' ', last_name) AS full_name FROM users", "bigquery");
    expect(s).toContain('CONCAT');
  });

  it("IFERROR → CASE WHEN in postgresql", () => {
    const s = sql("SELECT IFERROR(amount / quantity, 0) AS price FROM orders", "postgresql");
    expect(s).toContain('CASE WHEN');
  });

  it("IFERROR → IFNULL in bigquery", () => {
    const s = sql("SELECT IFERROR(amount / quantity, 0) AS price FROM orders", "bigquery");
    expect(s).toContain('IFNULL');
  });

  it("IFERROR → COALESCE in mysql", () => {
    const s = sql("SELECT IFERROR(amount / quantity, 0) AS price FROM orders", "mysql");
    expect(s).toContain('COALESCE');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// GOLDEN TESTS — Date Functions (Multi-dialect)
// ═══════════════════════════════════════════════════════════════════════════

describe("Golden: Date Functions", () => {
  it("DATE_TRUNC → DATE_TRUNC in postgresql", () => {
    expect(sql("SELECT DATE_TRUNC('month', created_at) FROM t", "postgresql"))
      .toContain("DATE_TRUNC('month'");
  });

  it("DATE_TRUNC → DATE_FORMAT in mysql", () => {
    const s = sql("SELECT DATE_TRUNC('month', created_at) FROM t", "mysql");
    expect(s).toContain('DATE_FORMAT');
  });

  it("DATE_TRUNC → DATE_TRUNC in bigquery", () => {
    const s = sql("SELECT DATE_TRUNC('month', created_at) FROM t", "bigquery");
    expect(s).toContain('DATE_TRUNC');
  });

  it("DATE_TRUNC → DATE_TRUNC in duckdb", () => {
    expect(sql("SELECT DATE_TRUNC('month', created_at) FROM t", "duckdb"))
      .toContain("DATE_TRUNC('month'");
  });

  it("DATE_ADD → INTERVAL in postgresql (clean quotes)", () => {
    const s = sql("SELECT DATE_ADD(created_at, 'day', 7) FROM t", "postgresql");
    expect(s).toContain("INTERVAL");
    expect(s).toContain("7 day");
    expect(s).not.toContain("'day'");
  });

  it("DATE_ADD → DATE_ADD in mysql", () => {
    const s = sql("SELECT DATE_ADD(created_at, 'day', 7) FROM t", "mysql");
    expect(s).toContain('DATE_ADD');
    expect(s).toContain('INTERVAL');
  });

  it("DATE_ADD → DATEADD in snowflake", () => {
    const s = sql("SELECT DATE_ADD(created_at, 'day', 7) FROM t", "snowflake");
    expect(s).toContain('DATEADD');
  });

  it("DATE_DIFF → EXTRACT in postgresql", () => {
    const s = sql("SELECT DATE_DIFF(end_date, start_date, 'day') FROM t", "postgresql");
    expect(s).toContain('EXTRACT');
    expect(s).toContain('86400');
  });

  it("DATE_DIFF → DATEDIFF in mysql", () => {
    const s = sql("SELECT DATE_DIFF(end_date, start_date, 'day') FROM t", "mysql");
    expect(s).toContain('DATEDIFF');
  });

  it("DATE_DIFF → DATE_DIFF in bigquery", () => {
    const s = sql("SELECT DATE_DIFF(end_date, start_date, 'day') FROM t", "bigquery");
    expect(s).toContain('DATE_DIFF');
  });

  it("DATE_DIFF → DATEDIFF in snowflake", () => {
    const s = sql("SELECT DATE_DIFF(end_date, start_date, 'day') FROM t", "snowflake");
    expect(s).toContain('DATEDIFF');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// GOLDEN TESTS — TIME filter expressions
// ═══════════════════════════════════════════════════════════════════════════

describe("Golden: TIME filters", () => {
  it("TIME TODAY", () => {
    const s = sql("SELECT id FROM orders WHERE TIME TODAY");
    expect(s).toContain('CURRENT_DATE');
    expect(s).toContain('>=');
    expect(s).toContain('<');
  });

  it("TIME YESTERDAY", () => {
    const s = sql("SELECT id FROM orders WHERE TIME YESTERDAY");
    expect(s).toContain('CURRENT_DATE');
    expect(s).toContain('INTERVAL');
  });

  it("TIME THIS_MONTH (compound token)", () => {
    const s = sql("SELECT id FROM orders WHERE TIME THIS_MONTH");
    expect(contains(s, 'month')).toBe(true);
    expect(s).toContain('DATE_TRUNC');
  });

  it("TIME LAST_MONTH (compound token)", () => {
    const s = sql("SELECT id FROM orders WHERE TIME LAST_MONTH");
    expect(contains(s, 'month')).toBe(true);
    expect(s).toContain('DATE_TRUNC');
  });

  it("TIME THIS_WEEK (compound token)", () => {
    const s = sql("SELECT id FROM orders WHERE TIME THIS_WEEK");
    expect(contains(s, 'week')).toBe(true);
  });

  it("TIME LAST_WEEK (compound token)", () => {
    const s = sql("SELECT id FROM orders WHERE TIME LAST_WEEK");
    expect(contains(s, 'week')).toBe(true);
  });

  it("TIME THIS_QUARTER (compound token)", () => {
    const s = sql("SELECT id FROM orders WHERE TIME THIS_QUARTER");
    expect(contains(s, 'quarter')).toBe(true);
  });

  it("TIME LAST_QUARTER (compound token)", () => {
    const s = sql("SELECT id FROM orders WHERE TIME LAST_QUARTER");
    expect(contains(s, 'quarter')).toBe(true);
  });

  it("TIME THIS_YEAR (compound token)", () => {
    const s = sql("SELECT id FROM orders WHERE TIME THIS_YEAR");
    expect(contains(s, 'year')).toBe(true);
  });

  it("TIME LAST_YEAR (compound token)", () => {
    const s = sql("SELECT id FROM orders WHERE TIME LAST_YEAR");
    expect(contains(s, 'year')).toBe(true);
  });

  it("TIME TODAY in bigquery → CURRENT_DATE()", () => {
    const s = sql("SELECT id FROM orders WHERE TIME TODAY", "bigquery");
    expect(s).toContain('CURRENT_DATE()');
  });

  it("TIME THIS_MONTH in bigquery → CURRENT_DATE()", () => {
    const s = sql("SELECT id FROM orders WHERE TIME THIS_MONTH", "bigquery");
    expect(s).toContain('CURRENT_DATE()');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// GOLDEN TESTS — Semantic Model keywords
// ═══════════════════════════════════════════════════════════════════════════

describe("Golden: Semantic Model", () => {
  it("METRIC keyword", () => {
    expect(sql("SELECT METRIC revenue FROM sales")).toContain('"REVENUE"');
  });

  it("DIMENSION keyword", () => {
    expect(sql("SELECT DIMENSION region FROM sales")).toContain('"REGION"');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// GOLDEN TESTS — All Dialects
// ═══════════════════════════════════════════════════════════════════════════

describe("Golden: Dialect Variants", () => {
  it("DATE_TRUNC for mysql → DATE_FORMAT", () => {
    expect(sql("SELECT DATE_TRUNC('month', created_at) FROM t", "mysql"))
      .toContain('DATE_FORMAT');
  });

  it("DATE_TRUNC for bigquery → DATE_TRUNC", () => {
    expect(sql("SELECT DATE_TRUNC('month', created_at) FROM t", "bigquery"))
      .toContain('DATE_TRUNC');
  });

  it("DATE_ADD for snowflake → DATEADD", () => {
    expect(sql("SELECT DATE_ADD(created_at, 'day', 7) FROM t", "snowflake"))
      .toContain('DATEADD');
  });

  it("DATE_TRUNC for duckdb → DATE_TRUNC", () => {
    expect(sql("SELECT DATE_TRUNC('month', created_at) FROM t", "duckdb"))
      .toContain('DATE_TRUNC');
  });

  it("MEDIAN for duckdb → PERCENTILE_CONT", () => {
    expect(sql("SELECT MEDIAN(salary) FROM employees", "duckdb"))
      .toContain('PERCENTILE_CONT(0.5)');
  });

  it("MEDIAN for snowflake → MEDIAN", () => {
    expect(sql("SELECT MEDIAN(salary) FROM employees", "snowflake"))
      .toContain('MEDIAN');
  });

  it("CONCAT for mysql → CONCAT()", () => {
    expect(sql("SELECT CONCAT(a, b) FROM t", "mysql"))
      .toContain('CONCAT');
  });

  it("CONCAT for snowflake → CONCAT()", () => {
    expect(sql("SELECT CONCAT(a, b) FROM t", "snowflake"))
      .toContain('CONCAT');
  });

  it("FORMAT for postgresql → TO_CHAR", () => {
    expect(sql("SELECT FORMAT(created_at, 'YYYY-MM') FROM t", "postgresql"))
      .toContain('TO_CHAR');
  });

  it("FORMAT for mysql → FORMAT", () => {
    expect(sql("SELECT FORMAT(created_at, 'YYYY-MM') FROM t", "mysql"))
      .toContain('FORMAT');
  });

  it("LEFT function passes through all dialects", () => {
    for (const d of ["postgresql", "mysql", "bigquery", "snowflake", "duckdb"]) {
      expect(sql("SELECT LEFT(name, 5) FROM t", d)).toContain('LEFT(');
    }
  });

  it("RIGHT function passes through all dialects", () => {
    for (const d of ["postgresql", "mysql", "bigquery", "snowflake", "duckdb"]) {
      expect(sql("SELECT RIGHT(name, 5) FROM t", d)).toContain('RIGHT(');
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// GOLDEN TESTS — MeasureDAG
// ═══════════════════════════════════════════════════════════════════════════

function makeMeasure(name: string, oqlExpr: string) {
  const l = new Lexer(oqlExpr);
  const p = new Parser(l.tokenize());
  return p.parseExpression();
}

describe("Golden: MeasureDAG", () => {
  it("linear dependency order preserved", () => {
    const dag = new MeasureDAG();
    dag.addMeasure("TotalRevenue", makeMeasure("TotalRevenue", "SUM(revenue)"));
    dag.addMeasure("MonthlyRevenue", makeMeasure("MonthlyRevenue", "SUM(revenue) / 12"));

    const result = dag.validate();
    expect(result.valid).toBe(true);
    expect(result.executionOrder).toContain("TOTALREVENUE");
    expect(result.executionOrder).toContain("MONTHLYREVENUE");
  });

  it("3-level deep linear chain", () => {
    const dag = new MeasureDAG();
    dag.addMeasure("Base", makeMeasure("Base", "SUM(revenue)"));
    dag.addMeasure("Mid", makeMeasure("Mid", "[Base] + 1"));
    dag.addMeasure("Top", makeMeasure("Top", "[Mid] * 2"));

    const result = dag.validate();
    expect(result.valid).toBe(true);
  });

  it("transitive dependencies", () => {
    const dag = new MeasureDAG();
    dag.addMeasure("Base", makeMeasure("Base", "SUM(revenue)"));
    dag.addMeasure("Mid", makeMeasure("Mid", "[Base] + 1"));
    dag.addMeasure("Top", makeMeasure("Top", "[Mid] * 2"));

    const deps = dag.getTransitiveDependencies("Top");
    expect(deps.has("MID")).toBe(true);
    expect(deps.has("BASE")).toBe(true);
  });

  it("dependents", () => {
    const dag = new MeasureDAG();
    dag.addMeasure("Base", makeMeasure("Base", "SUM(revenue)"));
    dag.addMeasure("Derived", makeMeasure("Derived", "[Base] + 1"));

    const dependents = dag.getDependents("Base");
    expect(dependents).toContain("DERIVED");
  });

  it("diamond dependency (A→B, A→C, B→D, C→D)", () => {
    const dag = new MeasureDAG();
    dag.addMeasure("D", makeMeasure("D", "SUM(sales)"));
    dag.addMeasure("B", makeMeasure("B", "[D] + 1"));
    dag.addMeasure("C", makeMeasure("C", "[D] * 2"));
    dag.addMeasure("A", makeMeasure("A", "[B] + [C]"));

    const result = dag.validate();
    expect(result.valid).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// GOLDEN TESTS — Error Handling
// ═══════════════════════════════════════════════════════════════════════════

describe("Golden: Error Handling", () => {
  it("throws on invalid syntax (missing FROM target)", () => {
    expect(() => sql("SELECT FROM WHERE")).toThrow();
  });

  it("throws on unexpected token", () => {
    expect(() => sql("SELECT * FROM @invalid")).toThrow();
  });

  it("basic valid query does not throw", () => {
    expect(() => sql("SELECT 1 FROM t")).not.toThrow();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// GOLDEN TESTS — Complex / Compound Queries
// ═══════════════════════════════════════════════════════════════════════════

describe("Golden: Complex Queries", () => {
  it("multi-join with WHERE, GROUP BY, HAVING, ORDER BY, LIMIT", () => {
    const s = sql(`
      SELECT c.name, SUM(o.amount) AS total
      FROM customers c
      LEFT JOIN orders o ON c.id = o.customer_id
      LEFT JOIN products p ON o.product_id = p.id
      WHERE o.status = 'completed'
      GROUP BY c.name
      HAVING SUM(o.amount) > 1000
      ORDER BY total DESC
      LIMIT 10
    `);
    expect(s).toContain('LEFT JOIN');
    expect(s).toContain('WHERE');
    expect(s).toContain('GROUP BY');
    expect(s).toContain('HAVING');
    expect(s).toContain('ORDER BY');
    expect(s).toContain('LIMIT 10');
  });

  it("CALCULATE with filter + window function", () => {
    const s = sql("SELECT CALCULATE(SUM(revenue), region = 'EMEA'), RANK() OVER (ORDER BY revenue DESC) FROM sales");
    expect(s).toContain('SUM');
    expect(s).toContain('RANK()');
    expect(s).toContain('OVER');
    expect(s).toContain('EMEA');
  });

  it("nested functions: UPPER(TRIM(name))", () => {
    const s = sql("SELECT UPPER(TRIM(name)) FROM users");
    expect(s).toContain('UPPER');
    expect(s).toContain('TRIM');
  });

  it("multiple window functions in one query", () => {
    const s = sql("SELECT RANK() OVER (ORDER BY revenue DESC), DENSERANK() OVER (PARTITION BY region ORDER BY revenue DESC) FROM sales");
    expect(s).toContain('RANK()');
    expect(s).toContain('DENSE_RANK()');
    expect(s).toContain('OVER');
  });

  it("complex WHERE with AND/OR/NOT", () => {
    const s = sql("SELECT id FROM t WHERE (a = 1 OR b = 2) AND NOT (c = 3)");
    expect(s).toContain('AND');
    expect(s).toContain('OR');
    expect(s).toContain('NOT');
  });

  it("CASE via IF inside CALCULATE", () => {
    const s = sql("SELECT CALCULATE(SUM(IF(revenue > 1000, revenue, 0))) FROM sales");
    expect(s).toContain('SUM');
    expect(s).toContain('CASE WHEN');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// GOLDEN TESTS — Edge Cases
// ═══════════════════════════════════════════════════════════════════════════

describe("Golden: Edge Cases", () => {
  it("empty string in literal", () => {
    const { params } = sqlP("SELECT id FROM t WHERE name = ''");
    expect(params).toContain("");
  });

  it("star select", () => {
    const s = sql("SELECT * FROM t");
    expect(s).toContain('*');
  });

  it("column alias with AS", () => {
    const s = sql("SELECT name AS user_name FROM users");
    expect(contains(s, 'AS "USER_NAME"')).toBe(true);
  });

  it("integer literal in expression", () => {
    const s = sql("SELECT 42 AS answer FROM t");
    expect(s).toContain('42');
  });

  it("arithmetic in WHERE clause", () => {
    const s = sql("SELECT id FROM t WHERE price * quantity > 100");
    expect(s).toContain('*');
    expect(s).toContain('>');
  });
});
