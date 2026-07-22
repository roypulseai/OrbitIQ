import {
  ASTNode,
  SelectStatement,
  ColumnExpression,
  FromClause,
  WhereClause,
  GroupByClause,
  OrderByClause,
  LimitClause,
  OffsetClause,
  JoinClause,
  HavingClause,
  AggregateExpression,
  TimeExpression,
  BinaryExpression,
  UnaryExpression,
  LiteralExpression,
  IdentifierExpression,
  FunctionExpression,
} from "./parser";

export interface CompileOptions {
  dialect?: "postgresql" | "mysql" | "bigquery" | "snowflake";
  parameterized?: boolean;
}

export interface CompileResult {
  sql: string;
  params: unknown[];
  warnings: string[];
}

export class Compiler {
  private options: CompileOptions;
  private params: unknown[] = [];
  private warnings: string[] = [];
  private paramIndex: number = 0;

  constructor(options: CompileOptions = {}) {
    this.options = {
      dialect: "postgresql",
      parameterized: true,
      ...options,
    };
  }

  compile(statement: SelectStatement): CompileResult {
    this.params = [];
    this.warnings = [];
    this.paramIndex = 0;

    const sql = this.compileSelect(statement);

    return {
      sql,
      params: this.params,
      warnings: this.warnings,
    };
  }

  private compileSelect(statement: SelectStatement): string {
    const parts: string[] = [];

    // SELECT clause
    parts.push("SELECT");
    parts.push(statement.columns.map((col) => this.compileColumn(col)).join(",\n  "));

    // FROM clause
    parts.push("FROM");
    parts.push(this.compileFrom(statement.from));

    // JOIN clauses
    for (const join of statement.joins) {
      parts.push(this.compileJoin(join));
    }

    // WHERE clause
    if (statement.where) {
      parts.push(this.compileWhere(statement.where));
    }

    // GROUP BY clause
    if (statement.groupBy) {
      parts.push(this.compileGroupBy(statement.groupBy));
    }

    // HAVING clause
    if (statement.having) {
      parts.push(this.compileHaving(statement.having));
    }

    // ORDER BY clause
    if (statement.orderBy) {
      parts.push(this.compileOrderBy(statement.orderBy));
    }

    // LIMIT clause
    if (statement.limit) {
      parts.push(this.compileLimit(statement.limit));
    }

    // OFFSET clause
    if (statement.offset) {
      parts.push(this.compileOffset(statement.offset));
    }

    return parts.join("\n");
  }

  private compileColumn(column: ColumnExpression): string {
    const expression = this.compileExpression(column.expression);
    const alias = column.alias || this.inferAlias(column.expression);

    if (alias) {
      return `${expression} AS "${alias}"`;
    }

    return expression;
  }

  private inferAlias(expression: ASTNode): string | undefined {
    if (expression.type === "IDENTIFIER") {
      return expression.name;
    }

    if (expression.type === "AGGREGATE") {
      return expression.alias || this.inferAlias(expression.expression);
    }

    if (expression.type === "FUNCTION") {
      return expression.name.toLowerCase();
    }

    return undefined;
  }

  private compileFrom(from: FromClause): string {
    let sql = `"${from.table}"`;

    if (from.alias) {
      sql += ` AS "${from.alias}"`;
    }

    return sql;
  }

  private compileJoin(join: JoinClause): string {
    const onClause = this.compileExpression(join.on);
    let sql = `${join.joinType} JOIN "${join.table}"`;

    if (join.alias) {
      sql += ` AS "${join.alias}"`;
    }

    sql += `\n  ON ${onClause}`;

    return sql;
  }

  private compileWhere(where: WhereClause): string {
    const condition = this.compileExpression(where.condition);
    return `WHERE ${condition}`;
  }

  private compileGroupBy(groupBy: GroupByClause): string {
    const columns = groupBy.columns.map((col) => {
      if (col.type === "IDENTIFIER") {
        return `"${col.name}"`;
      }
      return this.compileExpression(col.expression);
    });

    return `GROUP BY ${columns.join(", ")}`;
  }

  private compileHaving(having: HavingClause): string {
    const condition = this.compileExpression(having.condition);
    return `HAVING ${condition}`;
  }

  private compileOrderBy(orderBy: OrderByClause): string {
    const columns = orderBy.columns.map((col) => {
      const expression = this.compileExpression(col.expression);
      return `${expression} ${col.direction}`;
    });

    return `ORDER BY ${columns.join(", ")}`;
  }

  private compileLimit(limit: LimitClause): string {
    return `LIMIT ${limit.value}`;
  }

  private compileOffset(offset: OffsetClause): string {
    return `OFFSET ${offset.value}`;
  }

  private compileExpression(node: ASTNode): string {
    switch (node.type) {
      case "BINARY":
        return this.compileBinaryExpression(node);
      case "UNARY":
        return this.compileUnaryExpression(node);
      case "LITERAL":
        return this.compileLiteral(node);
      case "IDENTIFIER":
        return this.compileIdentifier(node);
      case "FUNCTION":
        return this.compileFunction(node);
      case "AGGREGATE":
        return this.compileAggregate(node);
      case "TIME":
        return this.compileTime(node);
      case "COLUMN":
        return this.compileExpression(node.expression);
      case "METRIC":
        return `"${node.name}"`;
      case "DIMENSION":
        return `"${node.name}"`;
      case "FILTER":
        return this.compileExpression(node.condition);
      default:
        throw new Error(`Unknown node type: ${(node as ASTNode).type}`);
    }
  }

  private compileBinaryExpression(node: BinaryExpression): string {
    const left = this.compileExpression(node.left);
    const right = this.compileExpression(node.right);

    switch (node.operator) {
      case "AND":
        return `(${left} AND ${right})`;
      case "OR":
        return `(${left} OR ${right})`;
      case "BETWEEN":
        return `${left} BETWEEN ${right}`;
      case "IN":
        return `${left} IN (${right})`;
      default:
        return `${left} ${node.operator} ${right}`;
    }
  }

  private compileUnaryExpression(node: UnaryExpression): string {
    const operand = this.compileExpression(node.operand);

    switch (node.operator) {
      case "NOT":
        return `NOT (${operand})`;
      case "IS_NULL":
        return `${operand} IS NULL`;
      case "IS_NOT_NULL":
        return `${operand} IS NOT NULL`;
      case "-":
        return `(-${operand})`;
      default:
        return `${node.operator} ${operand}`;
    }
  }

  private compileLiteral(node: LiteralExpression): string {
    if (this.options.parameterized) {
      this.params.push(node.value);
      this.paramIndex++;
      return `$${this.paramIndex}`;
    }

    switch (node.dataType) {
      case "string":
        return `'${node.value}'`;
      case "number":
        return String(node.value);
      case "boolean":
        return node.value ? "TRUE" : "FALSE";
      default:
        return String(node.value);
    }
  }

  private compileIdentifier(node: IdentifierExpression): string {
    if (node.table) {
      return `"${node.table}"."${node.name}"`;
    }
    return `"${node.name}"`;
  }

  private compileFunction(node: FunctionExpression): string {
    const args = node.arguments.map((arg) => this.compileExpression(arg));

    switch (node.name) {
      case "DATE_TRUNC":
        return this.compileDateTrunc(args);
      case "DATE_ADD":
        return this.compileDateAdd(args);
      case "DATE_SUB":
        return this.compileDateSub(args);
      case "DATE_DIFF":
        return this.compileDateDiff(args);
      default:
        return `${node.name}(${args.join(", ")})`;
    }
  }

  private compileDateTrunc(args: string[]): string {
    if (this.options.dialect === "postgresql") {
      return `DATE_TRUNC(${args.join(", ")})`;
    }
    if (this.options.dialect === "mysql") {
      return `DATE_FORMAT(${args[1]}, ${args[0]})`;
    }
    if (this.options.dialect === "bigquery") {
      return `DATE_TRUNC(${args[1]}, ${args[0]})`;
    }
    if (this.options.dialect === "snowflake") {
      return `DATE_TRUNC(${args.join(", ")})`;
    }
    return `DATE_TRUNC(${args.join(", ")})`;
  }

  private compileDateAdd(args: string[]): string {
    if (this.options.dialect === "postgresql") {
      return `${args[0]} + INTERVAL '${args[2]} ${args[1]}'`;
    }
    if (this.options.dialect === "mysql") {
      return `DATE_ADD(${args[0]}, INTERVAL ${args[2]} ${args[1]})`;
    }
    if (this.options.dialect === "bigquery") {
      return `DATE_ADD(${args[0]}, INTERVAL ${args[2]} ${args[1]})`;
    }
    if (this.options.dialect === "snowflake") {
      return `DATEADD(${args[1]}, ${args[2]}, ${args[0]})`;
    }
    return `DATE_ADD(${args.join(", ")})`;
  }

  private compileDateSub(args: string[]): string {
    if (this.options.dialect === "postgresql") {
      return `${args[0]} - INTERVAL '${args[2]} ${args[1]}'`;
    }
    if (this.options.dialect === "mysql") {
      return `DATE_SUB(${args[0]}, INTERVAL ${args[2]} ${args[1]})`;
    }
    if (this.options.dialect === "bigquery") {
      return `DATE_SUB(${args[0]}, INTERVAL ${args[2]} ${args[1]})`;
    }
    if (this.options.dialect === "snowflake") {
      return `DATEADD(${args[1]}, -${args[2]}, ${args[0]})`;
    }
    return `DATE_SUB(${args.join(", ")})`;
  }

  private compileDateDiff(args: string[]): string {
    if (this.options.dialect === "postgresql") {
      return `EXTRACT(EPOCH FROM ${args[0]} - ${args[1]}) / 86400`;
    }
    if (this.options.dialect === "mysql") {
      return `DATEDIFF(${args[0]}, ${args[1]})`;
    }
    if (this.options.dialect === "bigquery") {
      return `DATE_DIFF(${args[0]}, ${args[1]}, ${args[2] || "DAY"})`;
    }
    if (this.options.dialect === "snowflake") {
      return `DATEDIFF(${args[2] || "day"}, ${args[1]}, ${args[0]})`;
    }
    return `DATEDIFF(${args.join(", ")})`;
  }

  private compileAggregate(node: AggregateExpression): string {
    const expr = this.compileExpression(node.expression);

    switch (node.function) {
      case "COUNTDISTINCT":
        return `COUNT(DISTINCT ${expr})`;
      default:
        return `${node.function}(${expr})`;
    }
  }

  private compileTime(node: TimeExpression): string {
    const dateColumn = node.dateColumn || "created_at";

    switch (node.period) {
      case "TODAY":
        return `${dateColumn} >= CURRENT_DATE AND ${dateColumn} < CURRENT_DATE + INTERVAL '1 day'`;
      case "YESTERDAY":
        return `${dateColumn} >= CURRENT_DATE - INTERVAL '1 day' AND ${dateColumn} < CURRENT_DATE`;
      case "THIS_WEEK":
        return `${dateColumn} >= DATE_TRUNC('week', CURRENT_DATE) AND ${dateColumn} < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '1 week'`;
      case "LAST_WEEK":
        return `${dateColumn} >= DATE_TRUNC('week', CURRENT_DATE) - INTERVAL '1 week' AND ${dateColumn} < DATE_TRUNC('week', CURRENT_DATE)`;
      case "THIS_MONTH":
        return `${dateColumn} >= DATE_TRUNC('month', CURRENT_DATE) AND ${dateColumn} < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'`;
      case "LAST_MONTH":
        return `${dateColumn} >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month' AND ${dateColumn} < DATE_TRUNC('month', CURRENT_DATE)`;
      case "THIS_QUARTER":
        return `${dateColumn} >= DATE_TRUNC('quarter', CURRENT_DATE) AND ${dateColumn} < DATE_TRUNC('quarter', CURRENT_DATE) + INTERVAL '1 quarter'`;
      case "LAST_QUARTER":
        return `${dateColumn} >= DATE_TRUNC('quarter', CURRENT_DATE) - INTERVAL '1 quarter' AND ${dateColumn} < DATE_TRUNC('quarter', CURRENT_DATE)`;
      case "THIS_YEAR":
        return `${dateColumn} >= DATE_TRUNC('year', CURRENT_DATE) AND ${dateColumn} < DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '1 year'`;
      case "LAST_YEAR":
        return `${dateColumn} >= DATE_TRUNC('year', CURRENT_DATE) - INTERVAL '1 year' AND ${dateColumn} < DATE_TRUNC('year', CURRENT_DATE)`;
      default:
        return `${dateColumn} >= CURRENT_DATE`;
    }
  }
}
