import {
  ASTNode, SelectStatement, ColumnExpression, FromClause, WhereClause,
  GroupByClause, OrderByClause, LimitClause, OffsetClause, JoinClause,
  HavingClause, AggregateExpression, TimeExpression, BinaryExpression,
  UnaryExpression, LiteralExpression, IdentifierExpression, FunctionExpression,
  CalculateExpression, FilterModifier, WindowExpression, WindowFrame,
  TimeIntelExpression, ContextClearExpression, RelationshipExpression,
  IfExpression, SwitchExpression,
} from "./parser";

export interface CompileOptions {
  dialect?: "postgresql" | "mysql" | "bigquery" | "snowflake" | "duckdb";
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
  private measureRegistry: Map<string, ASTNode> = new Map();

  constructor(options: CompileOptions = {}) {
    this.options = { dialect: "postgresql", parameterized: true, ...options };
  }

  registerMeasure(name: string, expression: ASTNode): void {
    this.measureRegistry.set(name.toUpperCase(), expression);
  }

  compile(statement: SelectStatement): CompileResult {
    this.params = [];
    this.warnings = [];
    this.paramIndex = 0;
    const sql = this.compileSelect(statement);
    return { sql, params: this.params, warnings: this.warnings };
  }

  private compileSelect(statement: SelectStatement): string {
    const parts: string[] = [];

    parts.push("SELECT");
    parts.push(statement.columns.map((col) => this.compileColumn(col)).join(",\n  "));
    parts.push("FROM");
    parts.push(this.compileFrom(statement.from));

    for (const join of statement.joins) {
      parts.push(this.compileJoin(join));
    }

    if (statement.where) parts.push(this.compileWhere(statement.where));
    if (statement.groupBy) parts.push(this.compileGroupBy(statement.groupBy));
    if (statement.having) parts.push(this.compileHaving(statement.having));
    if (statement.orderBy) parts.push(this.compileOrderBy(statement.orderBy));
    if (statement.limit) parts.push(this.compileLimit(statement.limit));
    if (statement.offset) parts.push(this.compileOffset(statement.offset));

    return parts.join("\n");
  }

  private compileColumn(column: ColumnExpression): string {
    const expression = this.compileExpression(column.expression);
    const alias = column.alias || this.inferAlias(column.expression);
    if (alias) return `${expression} AS "${alias}"`;
    return expression;
  }

  private inferAlias(expression: ASTNode): string | undefined {
    if (expression.type === "IDENTIFIER") return expression.name;
    if (expression.type === "AGGREGATE") return expression.alias || this.inferAlias(expression.expression);
    if (expression.type === "FUNCTION") return expression.name.toLowerCase();
    if (expression.type === "CALCULATE") return "calculate_result";
    if (expression.type === "WINDOW") return `${expression.function.toLowerCase()}_result`;
    if (expression.type === "TIME_INTEL") return `${expression.function.toLowerCase()}_result`;
    if (expression.type === "IF") return "if_result";
    if (expression.type === "SWITCH") return "switch_result";
    return undefined;
  }

  private compileFrom(from: FromClause): string {
    let sql = `"${from.table}"`;
    if (from.alias) sql += ` AS "${from.alias}"`;
    return sql;
  }

  private compileJoin(join: JoinClause): string {
    const onClause = this.compileExpression(join.on);
    let sql = `${join.joinType} JOIN "${join.table}"`;
    if (join.alias) sql += ` AS "${join.alias}"`;
    sql += `\n  ON ${onClause}`;
    return sql;
  }

  private compileWhere(where: WhereClause): string {
    return `WHERE ${this.compileExpression(where.condition)}`;
  }

  private compileGroupBy(groupBy: GroupByClause): string {
    const columns = groupBy.columns.map((col) => {
      if (col.type === "IDENTIFIER") return `"${col.name}"`;
      return this.compileExpression(col.expression);
    });
    return `GROUP BY ${columns.join(", ")}`;
  }

  private compileHaving(having: HavingClause): string {
    return `HAVING ${this.compileExpression(having.condition)}`;
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

  // ─── Expression Compiler ──────────────────────────────────────────────

  compileExpression(node: ASTNode): string {
    switch (node.type) {
      case "BINARY": return this.compileBinaryExpression(node);
      case "UNARY": return this.compileUnaryExpression(node);
      case "LITERAL": return this.compileLiteral(node);
      case "IDENTIFIER": return this.compileIdentifier(node);
      case "FUNCTION": return this.compileFunction(node);
      case "AGGREGATE": return this.compileAggregate(node);
      case "TIME": return this.compileTime(node);
      case "COLUMN": return this.compileExpression(node.expression);
      case "METRIC": return `"${node.name}"`;
      case "DIMENSION": return `"${node.name}"`;
      case "FILTER": return this.compileExpression(node.condition);
      case "CALCULATE": return this.compileCalculate(node);
      case "WINDOW": return this.compileWindow(node);
      case "TIME_INTEL": return this.compileTimeIntel(node);
      case "CONTEXT_CLEAR": return this.compileContextClear(node);
      case "RELATIONSHIP": return this.compileRelationship(node);
      case "IF": return this.compileIf(node);
      case "SWITCH": return this.compileSwitch(node);
      default:
        throw new Error(`Unknown node type: ${(node as ASTNode).type}`);
    }
  }

  private compileBinaryExpression(node: BinaryExpression): string {
    const left = this.compileExpression(node.left);
    const right = this.compileExpression(node.right);

    switch (node.operator) {
      case "AND": return `(${left} AND ${right})`;
      case "OR": return `(${left} OR ${right})`;
      case "BETWEEN": return `${left} BETWEEN ${right}`;
      case "IN": return `${left} IN (${right})`;
      default: return `${left} ${node.operator} ${right}`;
    }
  }

  private compileUnaryExpression(node: UnaryExpression): string {
    const operand = this.compileExpression(node.operand);
    switch (node.operator) {
      case "NOT": return `NOT (${operand})`;
      case "IS_NULL": return `${operand} IS NULL`;
      case "IS_NOT_NULL": return `${operand} IS NOT NULL`;
      case "-": return `(-${operand})`;
      default: return `${node.operator} ${operand}`;
    }
  }

  private compileLiteral(node: LiteralExpression): string {
    if (this.options.parameterized) {
      this.params.push(node.value);
      this.paramIndex++;
      return `$${this.paramIndex}`;
    }
    switch (node.dataType) {
      case "string": return `'${String(node.value).replace(/'/g, "''")}'`;
      case "number": return String(node.value);
      case "boolean": return node.value ? "TRUE" : "FALSE";
      default: return String(node.value);
    }
  }

  private compileIdentifier(node: IdentifierExpression): string {
    if (node.table) return `"${node.table}"."${node.name}"`;
    return `"${node.name}"`;
  }

  // ─── Functions ────────────────────────────────────────────────────────

  private compileFunction(node: FunctionExpression): string {
    const args = node.arguments.map((arg) => this.compileExpression(arg));

    switch (node.name) {
      case "DATE_TRUNC": return this.compileDateTrunc(args);
      case "DATE_ADD": return this.compileDateAdd(args);
      case "DATE_SUB": return this.compileDateSub(args);
      case "DATE_DIFF": return this.compileDateDiff(args);
      case "IFERROR": return this.compileIfError(args);
      case "CONCAT": return this.compileConcat(args);
      case "FORMAT": return this.compileFormat(args);
      case "LEFT": return `LEFT(${args.join(", ")})`;
      case "RIGHT": return `RIGHT(${args.join(", ")})`;
      case "MID":
      case "SUBSTRING": return `SUBSTRING(${args.join(", ")})`;
      case "TRIM": return `TRIM(${args.join(", ")})`;
      case "LEN": return this.compileLen(args);
      case "UPPER": return `UPPER(${args.join(", ")})`;
      case "LOWER": return `LOWER(${args.join(", ")})`;
      default: return `${node.name}(${args.join(", ")})`;
    }
  }

  private compileIfError(args: string[]): string {
    if (this.options.dialect === "postgresql" || this.options.dialect === "duckdb") {
      return `CASE WHEN ${args[0]} IS NULL THEN ${args[1] || 'NULL'} ELSE ${args[0]} END`;
    }
    if (this.options.dialect === "bigquery") {
      return `IFNULL(${args[0]}, ${args[1] || 'NULL'})`;
    }
    return `COALESCE(${args[0]}, ${args[1] || 'NULL'})`;
  }

  private compileConcat(args: string[]): string {
    if (this.options.dialect === "postgresql" || this.options.dialect === "duckdb") {
      return args.join(" || ");
    }
    if (this.options.dialect === "mysql") {
      return `CONCAT(${args.join(", ")})`;
    }
    if (this.options.dialect === "bigquery" || this.options.dialect === "snowflake") {
      return `CONCAT(${args.join(", ")})`;
    }
    return args.join(" || ");
  }

  private compileFormat(args: string[]): string {
    if (this.options.dialect === "postgresql" || this.options.dialect === "duckdb") {
      return `TO_CHAR(${args.join(", ")})`;
    }
    if (this.options.dialect === "mysql") {
      return `FORMAT(${args.join(", ")})`;
    }
    if (this.options.dialect === "bigquery") {
      return `FORMAT(${args.join(", ")})`;
    }
    if (this.options.dialect === "snowflake") {
      return `TO_CHAR(${args.join(", ")})`;
    }
    return `CAST(${args[0]} AS TEXT)`;
  }

  private compileLen(args: string[]): string {
    if (this.options.dialect === "mysql") return `LENGTH(${args.join(", ")})`;
    return `LENGTH(${args.join(", ")})`;
  }

  private compileDateTrunc(args: string[]): string {
    switch (this.options.dialect) {
      case "mysql": return `DATE_FORMAT(${args[1]}, ${args[0]})`;
      case "bigquery": return `DATE_TRUNC(${args[1]}, ${args[0]})`;
      case "snowflake": case "duckdb": return `DATE_TRUNC(${args.join(", ")})`;
      default: return `DATE_TRUNC(${args.join(", ")})`;
    }
  }

  private compileDateAdd(args: string[]): string {
    switch (this.options.dialect) {
      case "postgresql": case "duckdb": return `${args[0]} + INTERVAL '${this.stripQuotes(args[2])} ${this.stripQuotes(args[1])}'`;
      case "mysql": return `DATE_ADD(${args[0]}, INTERVAL ${this.stripQuotes(args[2])} ${this.stripQuotes(args[1])})`;
      case "bigquery": return `DATE_ADD(${args[0]}, INTERVAL ${this.stripQuotes(args[2])} ${this.stripQuotes(args[1])})`;
      case "snowflake": return `DATEADD(${this.stripQuotes(args[1])}, ${this.stripQuotes(args[2])}, ${args[0]})`;
      default: return `DATE_ADD(${args.join(", ")})`;
    }
  }

  private compileDateSub(args: string[]): string {
    switch (this.options.dialect) {
      case "postgresql": case "duckdb": return `${args[0]} - INTERVAL '${this.stripQuotes(args[2])} ${this.stripQuotes(args[1])}'`;
      case "mysql": return `DATE_SUB(${args[0]}, INTERVAL ${this.stripQuotes(args[2])} ${this.stripQuotes(args[1])})`;
      case "bigquery": return `DATE_SUB(${args[0]}, INTERVAL ${this.stripQuotes(args[2])} ${this.stripQuotes(args[1])})`;
      case "snowflake": return `DATEADD(${this.stripQuotes(args[1])}, -${this.stripQuotes(args[2])}, ${args[0]})`;
      default: return `DATE_SUB(${args.join(", ")})`;
    }
  }

  private stripQuotes(s: string): string {
    if ((s.startsWith("'") && s.endsWith("'")) || (s.startsWith('"') && s.endsWith('"'))) {
      return s.slice(1, -1);
    }
    return s;
  }

  private compileDateDiff(args: string[]): string {
    switch (this.options.dialect) {
      case "postgresql": case "duckdb": return `EXTRACT(EPOCH FROM ${args[0]} - ${args[1]}) / 86400`;
      case "mysql": return `DATEDIFF(${args[0]}, ${args[1]})`;
      case "bigquery": return `DATE_DIFF(${args[0]}, ${args[1]}, ${args[2] || "DAY"})`;
      case "snowflake": return `DATEDIFF(${args[2] || "day"}, ${args[1]}, ${args[0]})`;
      default: return `DATEDIFF(${args.join(", ")})`;
    }
  }

  private compileAggregate(node: AggregateExpression): string {
    const expr = this.compileExpression(node.expression);
    switch (node.function) {
      case "COUNTDISTINCT": return `COUNT(DISTINCT ${expr})`;
      case "MEDIAN": return this.compileMedian(expr);
      case "PERCENTILE": return this.compilePercentile(expr, node.percentileN || 0.5);
      case "STDEV": return this.compileStdev(expr);
      case "VARIANCE": return this.compileVariance(expr);
      default: return `${node.function}(${expr})`;
    }
  }

  private compileMedian(expr: string): string {
    switch (this.options.dialect) {
      case "postgresql": case "duckdb": return `PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY ${expr})`;
      case "mysql": return `MEDIAN(${expr})`;
      case "bigquery": return `APPROX_QUANTILES(${expr}, 100)[OFFSET(50)]`;
      case "snowflake": return `MEDIAN(${expr})`;
      default: return `PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY ${expr})`;
    }
  }

  private compilePercentile(expr: string, percentile: number): string {
    switch (this.options.dialect) {
      case "postgresql": case "duckdb": return `PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY ${expr})`;
      case "mysql": return `PERCENTILE_CONT(${expr}, ${percentile})`;
      case "bigquery": return `APPROX_QUANTILES(${expr}, 100)[OFFSET(${Math.round(percentile * 100)})]`;
      case "snowflake": return `PERCENTILE(${expr}, ${percentile})`;
      default: return `PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY ${expr})`;
    }
  }

  private compileStdev(expr: string): string {
    switch (this.options.dialect) {
      case "mysql": return `STDDEV(${expr})`;
      default: return `STDDEV(${expr})`;
    }
  }

  private compileVariance(expr: string): string {
    switch (this.options.dialect) {
      case "mysql": return `VARIANCE(${expr})`;
      default: return `VARIANCE(${expr})`;
    }
  }

  private compileTime(node: TimeExpression): string {
    const dateColumn = node.dateColumn || "created_at";
    const d = this.options.dialect;
    const isPgFamily = d === "postgresql" || d === "duckdb";
    const isBQ = d === "bigquery";

    const now = isBQ ? "CURRENT_DATE()" : "CURRENT_DATE";

    const dateTrunc = (part: string, val: string) => {
      if (isPgFamily) return `DATE_TRUNC('${part}', ${val})`;
      if (isBQ) return `DATE_TRUNC(${val}, ${part})`;
      if (d === "mysql") return `DATE_FORMAT(${val}, '${this.mysqlDatePart(part)}')`;
      return `DATE_TRUNC('${part}', ${val})`;
    };

    const interval = (val: string, part: string) => {
      if (isPgFamily) return `+ INTERVAL '${val} ${part}'`;
      if (isBQ) return `+ INTERVAL ${val} ${part}`;
      if (d === "mysql") return `+ INTERVAL ${val} ${part}`;
      return `+ INTERVAL '${val} ${part}'`;
    };

    switch (node.period) {
      case "TODAY":
        return `${dateColumn} >= ${now} AND ${dateColumn} < ${now}${interval("1", "day")}`;
      case "YESTERDAY":
        return `${dateColumn} >= ${now}${interval("-1", "day")} AND ${dateColumn} < ${now}`;
      case "THIS_WEEK":
        return `${dateColumn} >= ${dateTrunc("week", now)} AND ${dateColumn} < ${dateTrunc("week", now)}${interval("1", "week")}`;
      case "LAST_WEEK":
        return `${dateColumn} >= ${dateTrunc("week", now)}${interval("-1", "week")} AND ${dateColumn} < ${dateTrunc("week", now)}`;
      case "THIS_MONTH":
        return `${dateColumn} >= ${dateTrunc("month", now)} AND ${dateColumn} < ${dateTrunc("month", now)}${interval("1", "month")}`;
      case "LAST_MONTH":
        return `${dateColumn} >= ${dateTrunc("month", now)}${interval("-1", "month")} AND ${dateColumn} < ${dateTrunc("month", now)}`;
      case "THIS_QUARTER":
        return `${dateColumn} >= ${dateTrunc("quarter", now)} AND ${dateColumn} < ${dateTrunc("quarter", now)}${interval("1", "quarter")}`;
      case "LAST_QUARTER":
        return `${dateColumn} >= ${dateTrunc("quarter", now)}${interval("-1", "quarter")} AND ${dateColumn} < ${dateTrunc("quarter", now)}`;
      case "THIS_YEAR":
        return `${dateColumn} >= ${dateTrunc("year", now)} AND ${dateColumn} < ${dateTrunc("year", now)}${interval("1", "year")}`;
      case "LAST_YEAR":
        return `${dateColumn} >= ${dateTrunc("year", now)}${interval("-1", "year")} AND ${dateColumn} < ${dateTrunc("year", now)}`;
      default:
        return `${dateColumn} >= ${now}`;
    }
  }

  private mysqlDatePart(part: string): string {
    const map: Record<string, string> = { week: "%x-W%v", month: "%Y-%m", quarter: "%Y-Q%q", year: "%Y" };
    return map[part] || "%Y-%m-%d";
  }

  // ─── CALCULATE ────────────────────────────────────────────────────────

  private compileCalculate(node: CalculateExpression): string {
    const innerExpr = this.compileExpression(node.expression);

    if (node.filterModifiers.length === 0) {
      return innerExpr;
    }

    // Build subquery with WHERE clauses from filter modifiers
    const conditions: string[] = [];

    for (const modifier of node.filterModifiers) {
      if (modifier.condition) {
        conditions.push(this.compileExpression(modifier.condition));
      } else if (modifier.function) {
        // Context-clearing functions affect how the outer query's GROUP BY interacts
        // For SQL generation, we handle these as special cases
        // ALL/ALLSELECTED/REMOVEFILTERS/KEEPFILTERS: these are hints that affect
        // how we generate the GROUP BY — we emit a comment for now
        this.warnings.push(`Context function ${modifier.function} applied — SQL-level filter removed`);
      }
    }

    if (conditions.length > 0) {
      // CALCULATE with explicit filter conditions → inject as WHERE
      // We emit a subquery to isolate the filter context
      return `(SELECT ${innerExpr} FROM (SELECT * FROM /* outer context */) _calc WHERE ${conditions.join(" AND ")})`;
    }

    return innerExpr;
  }

  // ─── Window / Ranking Functions ───────────────────────────────────────

  private compileWindow(node: WindowExpression): string {
    let sql: string;

    switch (node.function) {
      case "RANK":
        sql = "RANK()";
        break;
      case "DENSERANK":
        sql = "DENSE_RANK()";
        break;
      case "RUNNINGSUM": {
        const expr = node.expression ? this.compileExpression(node.expression) : "1";
        sql = `SUM(${expr})`;
        break;
      }
      case "MOVINGAVERAGE": {
        const expr = node.expression ? this.compileExpression(node.expression) : "1";
        sql = `AVG(${expr})`;
        break;
      }
      case "PERCENTOFTOTAL": {
        const expr = node.expression ? this.compileExpression(node.expression) : "1";
        sql = `ROUND(${expr} * 100.0 / NULLIF(SUM(${expr}) OVER (), 0), 2)`;
        break;
      }
      default:
        throw new Error(`Unknown window function: ${node.function}`);
    }

    // OVER clause
    const overParts: string[] = [];

    if (node.partitionBy.length > 0) {
      overParts.push(`PARTITION BY ${node.partitionBy.map((p) => this.compileExpression(p)).join(", ")}`);
    }

    if (node.orderBy.length > 0) {
      overParts.push(`ORDER BY ${node.orderBy.map((o) => `${this.compileExpression(o.expression)} ${o.direction}`).join(", ")}`);
    }

    // Frame clause
    if (node.frame && (node.function === "RUNNINGSUM" || node.function === "MOVINGAVERAGE")) {
      const frameType = node.frame.type;
      const start = this.compileFrameBound(node.frame.start);
      const end = this.compileFrameBound(node.frame.end);
      overParts.push(`${frameType} BETWEEN ${start} AND ${end}`);
    } else if (node.orderBy.length > 0 && (node.function === "RUNNINGSUM" || node.function === "MOVINGAVERAGE")) {
      // Default frame: ROWS UNBOUNDED PRECEDING AND CURRENT ROW
      overParts.push("ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW");
    }

    return `${sql} OVER (${overParts.join(" ")})`;
  }

  private compileFrameBound(bound: { type: string; value?: number }): string {
    switch (bound.type) {
      case "UNBOUNDED": return "UNBOUNDED PRECEDING";
      case "CURRENT": return "CURRENT ROW";
      case "LITERAL": return `${bound.value} PRECEDING`;
      default: return "CURRENT ROW";
    }
  }

  // ─── Time Intelligence ────────────────────────────────────────────────

  private compileTimeIntel(node: TimeIntelExpression): string {
    const dateCol = this.compileExpression(node.dateColumn);

    switch (node.function) {
      case "SAMEPERIODLASTYEAR":
        return this.compileSamePeriodLastYear(dateCol);
      case "DATEADD":
        return this.compileDateAddFunc(dateCol, node.arguments);
      case "DATESBETWEEN":
        return this.compileDatesBetween(dateCol, node.arguments);
      case "YTD":
        return this.compileYTD(dateCol);
      case "QTD":
        return this.compileQTD(dateCol);
      case "MTD":
        return this.compileMTD(dateCol);
      case "PARALLELPERIOD":
        return this.compileParallelPeriod(dateCol, node.arguments);
      case "ROLLINGN":
        return this.compileRollingN(dateCol, node.arguments);
      default:
        throw new Error(`Unknown time intelligence function: ${node.function}`);
    }
  }

  private compileSamePeriodLastYear(dateCol: string): string {
    switch (this.options.dialect) {
      case "postgresql": case "duckdb":
        return `${dateCol} >= (DATE_TRUNC('year', ${dateCol}) - INTERVAL '1 year') AND ${dateCol} < DATE_TRUNC('year', ${dateCol})`;
      case "bigquery":
        return `${dateCol} >= DATE_SUB(DATE_TRUNC(${dateCol}, YEAR), INTERVAL 1 YEAR) AND ${dateCol} < DATE_TRUNC(${dateCol}, YEAR)`;
      default:
        return `${dateCol} >= DATEADD(year, -1, DATE_TRUNC('year', ${dateCol})) AND ${dateCol} < DATE_TRUNC('year', ${dateCol})`;
    }
  }

  private compileDateAddFunc(dateCol: string, args: ASTNode[]): string {
    if (args.length < 2) {
      this.warnings.push("DATEADD requires periods and granularity arguments");
      return dateCol;
    }
    const periods = this.compileExpression(args[0]);
    const granularity = this.compileExpression(args[1]);

    switch (this.options.dialect) {
      case "postgresql": case "duckdb":
        return `${dateCol} + (${periods} * INTERVAL '1 ' || ${granularity})`;
      case "bigquery":
        return `DATE_ADD(${dateCol}, INTERVAL ${periods} ${granularity})`;
      case "mysql":
        return `DATE_ADD(${dateCol}, INTERVAL ${periods} ${granularity})`;
      case "snowflake":
        return `DATEADD(${granularity}, ${periods}, ${dateCol})`;
      default:
        return `DATE_ADD(${dateCol}, INTERVAL ${periods} ${granularity})`;
    }
  }

  private compileDatesBetween(dateCol: string, args: ASTNode[]): string {
    if (args.length < 2) {
      this.warnings.push("DATESBETWEEN requires start and end dates");
      return dateCol;
    }
    const startDate = this.compileExpression(args[0]);
    const endDate = this.compileExpression(args[1]);
    return `${dateCol} >= ${startDate} AND ${dateCol} <= ${endDate}`;
  }

  private compileYTD(dateCol: string): string {
    switch (this.options.dialect) {
      case "postgresql": case "duckdb":
        return `${dateCol} >= DATE_TRUNC('year', CURRENT_DATE) AND ${dateCol} <= CURRENT_DATE`;
      case "bigquery":
        return `${dateCol} >= DATE_TRUNC(CURRENT_DATE(), YEAR) AND ${dateCol} <= CURRENT_DATE()`;
      default:
        return `${dateCol} >= DATE_TRUNC('year', CURRENT_DATE) AND ${dateCol} <= CURRENT_DATE`;
    }
  }

  private compileQTD(dateCol: string): string {
    switch (this.options.dialect) {
      case "postgresql": case "duckdb":
        return `${dateCol} >= DATE_TRUNC('quarter', CURRENT_DATE) AND ${dateCol} <= CURRENT_DATE`;
      case "bigquery":
        return `${dateCol} >= DATE_TRUNC(CURRENT_DATE(), QUARTER) AND ${dateCol} <= CURRENT_DATE()`;
      default:
        return `${dateCol} >= DATE_TRUNC('quarter', CURRENT_DATE) AND ${dateCol} <= CURRENT_DATE`;
    }
  }

  private compileMTD(dateCol: string): string {
    switch (this.options.dialect) {
      case "postgresql": case "duckdb":
        return `${dateCol} >= DATE_TRUNC('month', CURRENT_DATE) AND ${dateCol} <= CURRENT_DATE`;
      case "bigquery":
        return `${dateCol} >= DATE_TRUNC(CURRENT_DATE(), MONTH) AND ${dateCol} <= CURRENT_DATE()`;
      default:
        return `${dateCol} >= DATE_TRUNC('month', CURRENT_DATE) AND ${dateCol} <= CURRENT_DATE`;
    }
  }

  private compileParallelPeriod(dateCol: string, args: ASTNode[]): string {
    if (args.length < 1) {
      this.warnings.push("PARALLELPERIOD requires granularity argument");
      return dateCol;
    }
    const periods = args.length > 1 ? this.compileExpression(args[0]) : "1";
    const granularity = this.compileExpression(args[args.length > 1 ? 1 : 0]);

    switch (this.options.dialect) {
      case "postgresql": case "duckdb":
        return `DATE_TRUNC(${granularity}, ${dateCol} + (${periods} * INTERVAL '1 ' || ${granularity}))`;
      default:
        return `DATE_TRUNC(${granularity}, DATEADD(${granularity}, ${periods}, ${dateCol}))`;
    }
  }

  private compileRollingN(dateCol: string, args: ASTNode[]): string {
    const n = args.length > 0 ? this.compileExpression(args[0]) : "7";
    switch (this.options.dialect) {
      case "postgresql": case "duckdb":
        return `${dateCol} >= CURRENT_DATE - INTERVAL '${n} days' AND ${dateCol} <= CURRENT_DATE`;
      case "bigquery":
        return `${dateCol} >= DATE_SUB(CURRENT_DATE(), INTERVAL ${n} DAY) AND ${dateCol} <= CURRENT_DATE()`;
      default:
        return `${dateCol} >= DATE_SUB(CURRENT_DATE, INTERVAL ${n} DAY) AND ${dateCol} <= CURRENT_DATE`;
    }
  }

  // ─── Context Clearing ─────────────────────────────────────────────────

  private compileContextClear(node: ContextClearExpression): string {
    // In SQL, context-clearing functions affect GROUP BY behavior
    // ALL(table) removes filters → we emit a comment/placeholder
    // ALLSELECTED preserves outer filters → similar
    // These are primarily semantic hints; actual SQL generation depends on the
    // surrounding CALCULATE context
    if (node.tableName && node.columnNames && node.columnNames.length > 0) {
      return `/* ${node.function}(${node.tableName}, ${node.columnNames.join(", ")}) */`;
    }
    if (node.tableName) {
      return `/* ${node.function}(${node.tableName}) */`;
    }
    return `/* ${node.function}() */`;
  }

  // ─── Relationship Functions ───────────────────────────────────────────

  private compileRelationship(node: RelationshipExpression): string {
    if (node.function === "RELATED") {
      if (node.tableName) {
        return `"${node.tableName}"."${node.columnName}"`;
      }
      return `"${node.columnName}"`;
    }
    // RELATEDTABLE returns a subquery for the related table
    if (node.tableName) {
      return `(SELECT * FROM "${node.tableName}" WHERE "${node.tableName}".id = /* parent id */)`;
    }
    return `/* RELATEDTABLE */`;
  }

  // ─── IF / SWITCH ─────────────────────────────────────────────────────

  private compileIf(node: IfExpression): string {
    const condition = this.compileExpression(node.condition);
    const trueExpr = this.compileExpression(node.trueExpr);
    const falseExpr = node.falseExpr ? this.compileExpression(node.falseExpr) : "NULL";
    return `CASE WHEN ${condition} THEN ${trueExpr} ELSE ${falseExpr} END`;
  }

  private compileSwitch(node: SwitchExpression): string {
    const parts: string[] = [];

    if (node.expression) {
      const base = this.compileExpression(node.expression);
      for (const c of node.cases) {
        const value = this.compileExpression(c.value);
        const result = this.compileExpression(c.result);
        parts.push(`WHEN ${base} = ${value} THEN ${result}`);
      }
    } else {
      for (const c of node.cases) {
        const value = this.compileExpression(c.value);
        const result = this.compileExpression(c.result);
        parts.push(`WHEN ${value} THEN ${result}`);
      }
    }

    if (node.default) {
      parts.push(`ELSE ${this.compileExpression(node.default)}`);
    }

    return `CASE ${parts.join(" ")} END`;
  }
}
