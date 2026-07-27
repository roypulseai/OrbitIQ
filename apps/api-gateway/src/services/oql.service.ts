import { Injectable, BadRequestException } from "@nestjs/common";

interface OQLCompileResult {
  sql: string;
  params: unknown[];
  warnings: string[];
}

interface OQLValidateResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

@Injectable()
export class OQLService {
  compile(oql: string, dialect: string = "postgresql"): OQLCompileResult {
    try {
      const { compileOQL } = require("@orbitiq/oql");
      return compileOQL(oql, { dialect: dialect as any, parameterized: true });
    } catch (error) {
      throw new BadRequestException(
        `OQL compilation failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  validate(oql: string): OQLValidateResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const result = this.compile(oql);
      warnings.push(...result.warnings);

      if (oql.trim().toUpperCase().startsWith("SELECT *")) {
        warnings.push("Consider selecting specific columns instead of using SELECT *");
      }

      if (!oql.toUpperCase().includes("LIMIT")) {
        warnings.push("Consider adding a LIMIT clause to prevent large result sets");
      }

      if (oql.toUpperCase().includes("DELETE") || oql.toUpperCase().includes("UPDATE") || oql.toUpperCase().includes("INSERT")) {
        errors.push("OQL only supports SELECT queries");
      }

      return { valid: errors.length === 0, errors, warnings };
    } catch (error) {
      return {
        valid: false,
        errors: [error instanceof Error ? error.message : String(error)],
        warnings,
      };
    }
  }

  explain(oql: string): string[] {
    const steps: string[] = [];

    try {
      const { Lexer, Parser, Compiler, MeasureDAG } = require("@orbitiq/oql");

      steps.push("1. Tokenizing OQL query...");
      const lexer = new Lexer(oql);
      const tokens = lexer.tokenize();
      steps.push(`   Found ${tokens.length} tokens`);

      steps.push("2. Parsing tokens into AST...");
      const parser = new Parser(tokens);
      const ast = parser.parse();
      steps.push(`   AST type: ${ast.type}`);
      steps.push(`   Columns: ${ast.columns.length}`);
      steps.push(`   From: ${ast.from.table}`);
      steps.push(`   Joins: ${ast.joins.length}`);

      if (ast.where) steps.push("   Where: present");
      if (ast.groupBy) steps.push(`   GroupBy: ${ast.groupBy.columns.length} columns`);
      if (ast.orderBy) steps.push(`   OrderBy: ${ast.orderBy.columns.length} columns`);
      if (ast.limit) steps.push(`   Limit: ${ast.limit.value}`);
      if (ast.offset) steps.push(`   Offset: ${ast.offset.value}`);

      // Check for special features
      const features: string[] = [];
      for (const col of ast.columns) {
        const expr = col.expression;
        if (expr.type === "CALCULATE") features.push("CALCULATE");
        if (expr.type === "WINDOW") features.push(`Window(${expr.function})`);
        if (expr.type === "TIME_INTEL") features.push(`TimeIntel(${expr.function})`);
        if (expr.type === "IF") features.push("IF");
        if (expr.type === "SWITCH") features.push("SWITCH");
        if (expr.type === "CONTEXT_CLEAR") features.push(`ContextClear(${expr.function})`);
      }
      if (features.length > 0) {
        steps.push(`   Special features: ${[...new Set(features)].join(", ")}`);
      }

      steps.push("3. Compiling AST to SQL...");
      const compiler = new Compiler({ dialect: "postgresql", parameterized: true });
      const result = compiler.compile(ast);

      steps.push(`   Generated SQL (${result.sql.length} chars)`);
      steps.push(`   Parameters: ${result.params.length}`);

      if (result.warnings.length > 0) {
        steps.push(`   Warnings: ${result.warnings.join(", ")}`);
      }

      steps.push("4. Compilation complete!");
      return steps;
    } catch (error) {
      steps.push(`Error: ${error instanceof Error ? error.message : String(error)}`);
      return steps;
    }
  }

  getExamples(): { name: string; oql: string; description: string }[] {
    return [
      {
        name: "Basic SELECT",
        oql: "SELECT id, name, email FROM users LIMIT 10",
        description: "Simple select with column list",
      },
      {
        name: "With Aggregation",
        oql: "SELECT region, SUM(revenue) AS total_revenue FROM sales GROUP BY region ORDER BY total_revenue DESC",
        description: "Aggregation with GROUP BY",
      },
      {
        name: "CALCULATE with Filter",
        oql: "SELECT CALCULATE(SUM(revenue), region = 'EMEA') AS emea_revenue FROM sales",
        description: "DAX-equivalent CALCULATE with explicit filter context",
      },
      {
        name: "Window Function — Running Total",
        oql: "SELECT order_date, SUM(amount) OVER (ORDER BY order_date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_total FROM orders",
        description: "Running total using window function",
      },
      {
        name: "Window Function — Rank",
        oql: "SELECT RANK() OVER (PARTITION BY region ORDER BY revenue DESC) AS revenue_rank FROM sales",
        description: "Rank within partitions",
      },
      {
        name: "Moving Average",
        oql: "SELECT order_date, MOVINGAVERAGE(amount) OVER (ORDER BY order_date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS avg_7day FROM orders",
        description: "7-day moving average",
      },
      {
        name: "YTD Filter",
        oql: "SELECT order_date, SUM(amount) AS ytd_revenue FROM sales WHERE YTD(order_date) GROUP BY order_date",
        description: "Year-to-date filter",
      },
      {
        name: "SAMEPERIODLASTYEAR",
        oql: "SELECT SAMEPERIODLASTYEAR(order_date) AS last_year_revenue FROM sales",
        description: "Compare with same period last year",
      },
      {
        name: "IF Function",
        oql: "SELECT IF(revenue > 100000, 'Large', 'Small') AS segment FROM accounts",
        description: "Conditional logic",
      },
      {
        name: "SWITCH Function",
        oql: "SELECT SWITCH(region, 'NA', 'North America', 'EU', 'Europe', 'Other') AS region_name FROM sales",
        description: "Multi-way conditional",
      },
      {
        name: "ALL Context Clearing",
        oql: "SELECT CALCULATE(SUM(revenue), ALL(sales)) AS total_revenue FROM sales",
        description: "Remove filters with ALL context function",
      },
      {
        name: "Time Intelligence — YTD",
        oql: "SELECT CALCULATE(SUM(revenue), YTD(order_date)) AS ytd_revenue FROM sales",
        description: "Year-to-date using CALCULATE + YTD",
      },
      {
        name: "Median & Percentile",
        oql: "SELECT department, MEDIAN(salary) AS median_salary, PERCENTILE(salary, 0.9) AS p90_salary FROM employees GROUP BY department",
        description: "Statistical functions",
      },
      {
        name: "Text Functions",
        oql: "SELECT UPPER(TRIM(name)) AS clean_name, LEFT(email, 3) AS email_prefix FROM users",
        description: "Text manipulation functions",
      },
      {
        name: "Time Intelligence — DateAdd",
        oql: "SELECT DATEADD(order_date, -30, 'day') AS prior_date FROM orders",
        description: "Date arithmetic",
      },
      {
        name: "Complex CALCULATE",
        oql: "SELECT CALCULATE(SUM(revenue), ALL(sales), region = 'EMEA') AS emea_no_filter FROM sales",
        description: "CALCULATE with context clearing + filter",
      },
      {
        name: "JOIN Query",
        oql: "SELECT u.name, COUNT(o.id) AS order_count FROM users u LEFT JOIN orders o ON u.id = o.user_id GROUP BY u.name ORDER BY order_count DESC",
        description: "Join with aggregation",
      },
      {
        name: "Metric & Dimension",
        oql: "SELECT METRIC revenue, DIMENSION region FROM sales WHERE TIME LAST_MONTH",
        description: "Using semantic model concepts",
      },
      {
        name: "HAVING Clause",
        oql: "SELECT department, AVG(salary) AS avg_salary FROM employees GROUP BY department HAVING AVG(salary) > 50000",
        description: "Filtering aggregated results",
      },
      {
        name: "Percent of Total",
        oql: "SELECT region, SUM(revenue) AS revenue, PERCENTOFTOTAL(SUM(revenue)) OVER (PARTITION BY region ORDER BY revenue) AS pct_total FROM sales",
        description: "Percentage of total using window function",
      },
    ];
  }

  getKeywords(): string[] {
    return [
      // SQL basics
      "SELECT", "FROM", "WHERE", "GROUP", "BY", "ORDER", "ASC", "DESC",
      "LIMIT", "OFFSET", "JOIN", "LEFT", "RIGHT", "FULL", "INNER", "ON",
      "AND", "OR", "NOT", "IN", "LIKE", "BETWEEN", "IS", "NULL", "AS", "HAVING",
      // Semantic model
      "METRIC", "DIMENSION", "FILTER", "TIME",
      "LAST", "NEXT", "TODAY", "YESTERDAY", "THIS", "WEEK", "MONTH", "QUARTER", "YEAR",
      // Aggregate functions
      "SUM", "AVG", "COUNT", "MIN", "MAX", "COUNTDISTINCT",
      "MEDIAN", "PERCENTILE", "STDEV", "VARIANCE",
      // Date functions
      "DATE_TRUNC", "DATE_ADD", "DATE_SUB", "DATE_DIFF",
      // CALCULATE
      "CALCULATE",
      // Context clearing
      "ALL", "ALLEXCEPT", "ALLSELECTED", "REMOVEFILTERS", "KEEPFILTERS",
      // Time intelligence
      "SAMEPERIODLASTYEAR", "DATEADD", "DATESBETWEEN", "YTD", "QTD", "MTD",
      "PARALLELPERIOD", "ROLLINGN",
      // Window/ranking
      "RANK", "DENSERANK", "RUNNINGSUM", "MOVINGAVERAGE", "PERCENTOFTOTAL",
      "OVER", "PARTITION", "ROWS", "RANGE",
      // Relationship
      "RELATED", "RELATEDTABLE",
      // Logical
      "IF", "SWITCH", "IFERROR",
      // Text
      "CONCAT", "FORMAT", "LEFT", "RIGHT", "MID", "TRIM", "LEN", "UPPER", "LOWER",
    ].sort();
  }

  getFunctions(): string[] {
    return [
      // Aggregate
      "SUM", "AVG", "COUNT", "MIN", "MAX", "COUNTDISTINCT",
      "MEDIAN", "PERCENTILE", "STDEV", "VARIANCE",
      // Date
      "DATE_TRUNC", "DATE_ADD", "DATE_SUB", "DATE_DIFF",
      // CALCULATE
      "CALCULATE",
      // Context clearing
      "ALL", "ALLEXCEPT", "ALLSELECTED", "REMOVEFILTERS", "KEEPFILTERS",
      // Time intelligence
      "SAMEPERIODLASTYEAR", "DATEADD", "DATESBETWEEN", "YTD", "QTD", "MTD",
      "PARALLELPERIOD", "ROLLINGN",
      // Window/ranking
      "RANK", "DENSERANK", "RUNNINGSUM", "MOVINGAVERAGE", "PERCENTOFTOTAL",
      // Relationship
      "RELATED", "RELATEDTABLE",
      // Logical
      "IF", "SWITCH", "IFERROR",
      // Text
      "CONCAT", "FORMAT", "LEFT", "RIGHT", "MID", "TRIM", "LEN", "UPPER", "LOWER",
    ];
  }
}
