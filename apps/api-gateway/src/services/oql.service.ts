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
  private readonly reservedWords = new Set([
    "SELECT", "FROM", "WHERE", "GROUP", "BY", "ORDER", "ASC", "DESC",
    "LIMIT", "OFFSET", "JOIN", "LEFT", "RIGHT", "FULL", "INNER", "ON",
    "AND", "OR", "NOT", "IN", "LIKE", "BETWEEN", "IS", "NULL", "TRUE",
    "FALSE", "AS", "HAVING", "FILTER", "METRIC", "DIMENSION", "TIME",
    "LAST", "NEXT", "TODAY", "YESTERDAY", "THIS", "WEEK", "MONTH",
    "QUARTER", "YEAR", "SUM", "AVG", "COUNT", "MIN", "MAX", "COUNTDISTINCT",
    "DATE_TRUNC", "DATE_ADD", "DATE_SUB", "DATE_DIFF",
  ]);

  compile(oql: string, dialect: string = "postgresql"): OQLCompileResult {
    try {
      // Dynamic import to avoid circular dependencies
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
      // Try to compile the OQL
      const result = this.compile(oql);

      // Check for common issues
      if (oql.trim().toUpperCase().startsWith("SELECT *")) {
        warnings.push("Consider selecting specific columns instead of using SELECT *");
      }

      if (!oql.toUpperCase().includes("LIMIT")) {
        warnings.push("Consider adding a LIMIT clause to prevent large result sets");
      }

      if (oql.toUpperCase().includes("DELETE") || oql.toUpperCase().includes("UPDATE") || oql.toUpperCase().includes("INSERT")) {
        errors.push("OQL only supports SELECT queries");
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings,
      };
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
      const { Lexer, Parser } = require("@orbitiq/oql");

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

      if (ast.where) {
        steps.push(`   Where: present`);
      }
      if (ast.groupBy) {
        steps.push(`   GroupBy: ${ast.groupBy.columns.length} columns`);
      }
      if (ast.orderBy) {
        steps.push(`   OrderBy: ${ast.orderBy.columns.length} columns`);
      }
      if (ast.limit) {
        steps.push(`   Limit: ${ast.limit.value}`);
      }
      if (ast.offset) {
        steps.push(`   Offset: ${ast.offset.value}`);
      }

      steps.push("3. Compiling AST to SQL...");
      const { Compiler } = require("@orbitiq/oql");
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
        name: "Time Intelligence",
        oql: "SELECT DATE_TRUNC('month', created_at) AS month, COUNT(*) AS signups FROM users WHERE TIME THIS_MONTH GROUP BY month ORDER BY month",
        description: "Time-based filtering and grouping",
      },
      {
        name: "Complex Filters",
        oql: "SELECT * FROM orders WHERE status = 'completed' AND total > 100 AND created_at >= '2024-01-01' LIMIT 50",
        description: "Multiple filter conditions",
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
        name: "Date Functions",
        oql: "SELECT DATE_TRUNC('quarter', order_date) AS quarter, SUM(amount) AS revenue FROM orders WHERE order_date >= DATE_TRUNC('year', CURRENT_DATE) GROUP BY quarter",
        description: "Date truncation and filtering",
      },
    ];
  }

  getKeywords(): string[] {
    return Array.from(this.reservedWords).sort();
  }

  getFunctions(): string[] {
    return [
      "SUM", "AVG", "COUNT", "MIN", "MAX", "COUNTDISTINCT",
      "DATE_TRUNC", "DATE_ADD", "DATE_SUB", "DATE_DIFF",
    ];
  }
}
