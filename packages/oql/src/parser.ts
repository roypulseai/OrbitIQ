import { Token, TokenType } from "./lexer";

export type ASTNode =
  | SelectStatement
  | FromClause
  | WhereClause
  | GroupByClause
  | OrderByClause
  | LimitClause
  | OffsetClause
  | JoinClause
  | HavingClause
  | ColumnExpression
  | MetricExpression
  | DimensionExpression
  | FilterExpression
  | AggregateExpression
  | TimeExpression
  | BinaryExpression
  | UnaryExpression
  | LiteralExpression
  | IdentifierExpression
  | FunctionExpression
  | AliasedExpression
  | CalculateExpression
  | WindowExpression
  | TimeIntelExpression
  | ContextClearExpression
  | RelationshipExpression
  | IfExpression
  | SwitchExpression;

// ─── Statement Types ────────────────────────────────────────────────────────

export interface SelectStatement {
  type: "SELECT";
  columns: ColumnExpression[];
  from: FromClause;
  where?: WhereClause;
  groupBy?: GroupByClause;
  having?: HavingClause;
  orderBy?: OrderByClause;
  limit?: LimitClause;
  offset?: OffsetClause;
  joins: JoinClause[];
}

export interface FromClause { type: "FROM"; table: string; alias?: string; }
export interface WhereClause { type: "WHERE"; condition: ASTNode; }
export interface GroupByClause { type: "GROUP_BY"; columns: (ColumnExpression | IdentifierExpression)[]; }
export interface OrderByClause { type: "ORDER_BY"; columns: { expression: ASTNode; direction: "ASC" | "DESC" }[]; }
export interface LimitClause { type: "LIMIT"; value: number; }
export interface OffsetClause { type: "OFFSET"; value: number; }
export interface JoinClause { type: "JOIN"; joinType: "INNER" | "LEFT" | "RIGHT" | "FULL"; table: string; alias?: string; on: ASTNode; }
export interface HavingClause { type: "HAVING"; condition: ASTNode; }
export interface ColumnExpression { type: "COLUMN"; expression: ASTNode; alias?: string; }
export interface MetricExpression { type: "METRIC"; name: string; alias?: string; }
export interface DimensionExpression { type: "DIMENSION"; name: string; alias?: string; }
export interface FilterExpression { type: "FILTER"; condition: ASTNode; }
export interface AliasedExpression { type: "ALIASED"; expression: ASTNode; alias: string; }

// ─── Aggregate ──────────────────────────────────────────────────────────────

export interface AggregateExpression {
  type: "AGGREGATE";
  function: "SUM" | "AVG" | "COUNT" | "MIN" | "MAX" | "COUNTDISTINCT"
    | "MEDIAN" | "PERCENTILE" | "STDEV" | "VARIANCE";
  expression: ASTNode;
  alias?: string;
  percentileN?: number;  // for PERCENTILE function
}

// ─── Time ───────────────────────────────────────────────────────────────────

export interface TimeExpression {
  type: "TIME";
  period: "TODAY" | "YESTERDAY" | "THIS_WEEK" | "LAST_WEEK" | "THIS_MONTH" | "LAST_MONTH"
    | "THIS_QUARTER" | "LAST_QUARTER" | "THIS_YEAR" | "LAST_YEAR";
  dateColumn?: string;
}

// ─── Binary / Unary / Literal / Identifier ──────────────────────────────────

export interface BinaryExpression { type: "BINARY"; operator: string; left: ASTNode; right: ASTNode; }
export interface UnaryExpression { type: "UNARY"; operator: string; operand: ASTNode; }
export interface LiteralExpression { type: "LITERAL"; value: string | number | boolean; dataType: "string" | "number" | "boolean"; }
export interface IdentifierExpression { type: "IDENTIFIER"; name: string; table?: string; }
export interface FunctionExpression { type: "FUNCTION"; name: string; arguments: ASTNode[]; }

// ─── CALCULATE (DAX-equivalent) ─────────────────────────────────────────────

export interface FilterModifier {
  type: "FILTER_MODIFIER";
  function?: "ALL" | "ALLEXCEPT" | "ALLSELECTED" | "REMOVEFILTERS" | "KEEPFILTERS";
  tableName?: string;
  columnNames?: string[];
  condition?: ASTNode;  // For explicit filter: CALCULATE(expr, table[col] = value)
}

export interface CalculateExpression {
  type: "CALCULATE";
  expression: ASTNode;
  filterModifiers: FilterModifier[];
}

// ─── Window / Ranking Functions ─────────────────────────────────────────────

export type WindowFrameType = "ROWS" | "RANGE";
export type WindowFrameBound = { type: "UNBOUNDED" | "CURRENT" | "LITERAL"; value?: number };

export interface WindowFrame {
  type: WindowFrameType;
  start: WindowFrameBound;
  end: WindowFrameBound;
}

export interface WindowExpression {
  type: "WINDOW";
  function: "RANK" | "DENSERANK" | "RUNNINGSUM" | "MOVINGAVERAGE" | "PERCENTOFTOTAL";
  expression?: ASTNode;
  partitionBy: ASTNode[];
  orderBy: { expression: ASTNode; direction: "ASC" | "DESC" }[];
  frame?: WindowFrame;
}

// ─── Time Intelligence ──────────────────────────────────────────────────────

export interface TimeIntelExpression {
  type: "TIME_INTEL";
  function: "SAMEPERIODLASTYEAR" | "DATEADD" | "DATESBETWEEN" | "YTD" | "QTD" | "MTD"
    | "PARALLELPERIOD" | "ROLLINGN";
  dateColumn: ASTNode;
  arguments: ASTNode[];  // Additional args (periods for DATEADD, etc.)
}

// ─── Context Clearing ───────────────────────────────────────────────────────

export interface ContextClearExpression {
  type: "CONTEXT_CLEAR";
  function: "ALL" | "ALLEXCEPT" | "ALLSELECTED" | "REMOVEFILTERS" | "KEEPFILTERS";
  tableName?: string;
  columnNames?: string[];
}

// ─── Relationship Functions ─────────────────────────────────────────────────

export interface RelationshipExpression {
  type: "RELATIONSHIP";
  function: "RELATED" | "RELATEDTABLE";
  columnName: string;
  tableName?: string;
}

// ─── IF / SWITCH ────────────────────────────────────────────────────────────

export interface IfExpression {
  type: "IF";
  condition: ASTNode;
  trueExpr: ASTNode;
  falseExpr?: ASTNode;
}

export interface SwitchExpression {
  type: "SWITCH";
  expression?: ASTNode;  // Optional base expression for SWITCH(expr, val1, result1, ...)
  cases: { value: ASTNode; result: ASTNode }[];
  default?: ASTNode;
}

// ─── Parser ─────────────────────────────────────────────────────────────────

export class Parser {
  private tokens: Token[];
  private pos: number = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  private peek(): Token {
    return this.tokens[this.pos] || { type: "EOF", value: "", line: 0, column: 0 };
  }

  private advance(): Token {
    const token = this.tokens[this.pos];
    this.pos++;
    return token;
  }

  private expect(type: TokenType): Token {
    const token = this.peek();
    if (token.type !== type) {
      throw new Error(`Expected ${type} but got ${token.type} at line ${token.line}, column ${token.column}`);
    }
    return this.advance();
  }

  private match(type: TokenType): boolean {
    if (this.peek().type === type) {
      this.advance();
      return true;
    }
    return false;
  }

  private matchAny(...types: TokenType[]): boolean {
    if (types.includes(this.peek().type)) {
      this.advance();
      return true;
    }
    return false;
  }

  parse(): SelectStatement {
    const statement: SelectStatement = {
      type: "SELECT",
      columns: [],
      from: { type: "FROM", table: "" },
      joins: [],
    };

    this.expect("SELECT");
    statement.columns = this.parseSelectColumns();
    this.expect("FROM");
    statement.from = this.parseFromClause();

    while (this.peek().type === "JOIN" || this.peek().type === "LEFT" || this.peek().type === "RIGHT" || this.peek().type === "FULL" || this.peek().type === "INNER") {
      statement.joins.push(this.parseJoinClause());
    }

    if (this.peek().type === "WHERE" || this.peek().type === "FILTER") {
      statement.where = this.parseWhereClause();
    }

    if (this.peek().type === "GROUP") {
      statement.groupBy = this.parseGroupByClause();
    }

    if (this.peek().type === "HAVING") {
      statement.having = this.parseHavingClause();
    }

    if (this.peek().type === "ORDER") {
      statement.orderBy = this.parseOrderByClause();
    }

    if (this.peek().type === "LIMIT") {
      statement.limit = this.parseLimitClause();
    }

    if (this.peek().type === "OFFSET") {
      statement.offset = this.parseOffsetClause();
    }

    return statement;
  }

  private parseSelectColumns(): ColumnExpression[] {
    const columns: ColumnExpression[] = [];
    do {
      const expression = this.parseExpression();
      const alias = this.parseAlias();
      columns.push({ type: "COLUMN", expression, alias });
    } while (this.match("COMMA"));
    return columns;
  }

  private parseFromClause(): FromClause {
    const table = this.expect("IDENTIFIER").value;
    const alias = this.parseAlias();
    return { type: "FROM", table, alias };
  }

  private parseJoinClause(): JoinClause {
    let joinType: "INNER" | "LEFT" | "RIGHT" | "FULL" = "INNER";
    if (this.peek().type === "LEFT") { this.advance(); joinType = "LEFT"; }
    else if (this.peek().type === "RIGHT") { this.advance(); joinType = "RIGHT"; }
    else if (this.peek().type === "FULL") { this.advance(); joinType = "FULL"; }
    else if (this.peek().type === "INNER") { this.advance(); joinType = "INNER"; }

    this.expect("JOIN");
    const table = this.expect("IDENTIFIER").value;
    const alias = this.parseAlias();
    this.expect("ON");
    const on = this.parseExpression();
    return { type: "JOIN", joinType, table, alias, on };
  }

  private parseWhereClause(): WhereClause {
    if (this.peek().type === "FILTER") { this.advance(); }
    else { this.expect("WHERE"); }
    const condition = this.parseExpression();
    return { type: "WHERE", condition };
  }

  private parseGroupByClause(): GroupByClause {
    this.expect("GROUP");
    this.expect("BY");
    const columns: (ColumnExpression | IdentifierExpression)[] = [];
    do {
      const expr = this.parseExpression();
      if (expr.type === "IDENTIFIER") { columns.push(expr); }
      else if (expr.type === "COLUMN") { columns.push(expr); }
      else { columns.push({ type: "COLUMN", expression: expr }); }
    } while (this.match("COMMA"));
    return { type: "GROUP_BY", columns };
  }

  private parseOrderByClause(): OrderByClause {
    this.expect("ORDER");
    this.expect("BY");
    const columns: { expression: ASTNode; direction: "ASC" | "DESC" }[] = [];
    do {
      const expression = this.parseExpression();
      let direction: "ASC" | "DESC" = "ASC";
      if (this.peek().type === "ASC") { this.advance(); direction = "ASC"; }
      else if (this.peek().type === "DESC") { this.advance(); direction = "DESC"; }
      columns.push({ expression, direction });
    } while (this.match("COMMA"));
    return { type: "ORDER_BY", columns };
  }

  private parseLimitClause(): LimitClause {
    this.expect("LIMIT");
    return { type: "LIMIT", value: parseInt(this.expect("NUMBER").value, 10) };
  }

  private parseOffsetClause(): OffsetClause {
    this.expect("OFFSET");
    return { type: "OFFSET", value: parseInt(this.expect("NUMBER").value, 10) };
  }

  private parseHavingClause(): HavingClause {
    this.expect("HAVING");
    return { type: "HAVING", condition: this.parseExpression() };
  }

  private parseAlias(): string | undefined {
    if (this.peek().type === "AS") {
      this.advance();
      return this.expect("IDENTIFIER").value;
    }
    if (
      this.peek().type === "IDENTIFIER" &&
      this.tokens[this.pos + 1]?.type !== "DOT" &&
      this.tokens[this.pos + 1]?.type !== "LPAREN" &&
      this.tokens[this.pos + 1]?.type !== "EQ"
    ) {
      return this.advance().value;
    }
    return undefined;
  }

  // ─── Expression Parsing (precedence climbing) ───────────────────────────

  parseExpression(): ASTNode {
    return this.parseOrExpression();
  }

  private parseOrExpression(): ASTNode {
    let left = this.parseAndExpression();
    while (this.peek().type === "OR") {
      this.advance();
      left = { type: "BINARY", operator: "OR", left, right: this.parseAndExpression() };
    }
    return left;
  }

  private parseAndExpression(): ASTNode {
    let left = this.parseComparisonExpression();
    while (this.peek().type === "AND") {
      this.advance();
      left = { type: "BINARY", operator: "AND", left, right: this.parseComparisonExpression() };
    }
    return left;
  }

  private parseComparisonExpression(): ASTNode {
    let left = this.parseAdditiveExpression();

    while (
      this.peek().type === "EQ" || this.peek().type === "NEQ" ||
      this.peek().type === "LT" || this.peek().type === "GT" ||
      this.peek().type === "LTE" || this.peek().type === "GTE" ||
      this.peek().type === "LIKE" || this.peek().type === "BETWEEN" ||
      this.peek().type === "IN" || this.peek().type === "IS"
    ) {
      const operator = this.advance().value;

      if (operator === "BETWEEN") {
        const low = this.parseAdditiveExpression();
        this.expect("AND");
        const high = this.parseAdditiveExpression();
        left = { type: "BINARY", operator: "BETWEEN", left, right: { type: "BINARY", operator: "AND", left: low, right: high } };
      } else if (operator === "IN") {
        this.expect("LPAREN");
        const values: ASTNode[] = [];
        do { values.push(this.parseExpression()); } while (this.match("COMMA"));
        this.expect("RPAREN");
        left = { type: "BINARY", operator: "IN", left, right: { type: "FUNCTION", name: "VALUES", arguments: values } };
      } else if (operator === "IS") {
        if (this.peek().type === "NOT") {
          this.advance();
          this.expect("NULL");
          left = { type: "UNARY", operator: "IS_NOT_NULL", operand: left };
        } else {
          this.expect("NULL");
          left = { type: "UNARY", operator: "IS_NULL", operand: left };
        }
      } else {
        left = { type: "BINARY", operator, left, right: this.parseAdditiveExpression() };
      }
    }

    return left;
  }

  private parseAdditiveExpression(): ASTNode {
    let left = this.parseMultiplicativeExpression();
    while (this.peek().type === "PLUS" || this.peek().type === "MINUS") {
      const operator = this.advance().value;
      left = { type: "BINARY", operator, left, right: this.parseMultiplicativeExpression() };
    }
    return left;
  }

  private parseMultiplicativeExpression(): ASTNode {
    let left = this.parseUnaryExpression();
    while (this.peek().type === "STAR" || this.peek().type === "SLASH" || this.peek().type === "PERCENT") {
      const operator = this.advance().value;
      left = { type: "BINARY", operator, left, right: this.parseUnaryExpression() };
    }
    return left;
  }

  private parseUnaryExpression(): ASTNode {
    if (this.peek().type === "NOT") {
      this.advance();
      return { type: "UNARY", operator: "NOT", operand: this.parseUnaryExpression() };
    }
    if (this.peek().type === "MINUS") {
      this.advance();
      return { type: "UNARY", operator: "-", operand: this.parseUnaryExpression() };
    }
    return this.parsePrimaryExpression();
  }

  private parsePrimaryExpression(): ASTNode {
    const token = this.peek();

    // STAR as wildcard (e.g., COUNT(*))
    if (token.type === "STAR") {
      this.advance();
      return { type: "LITERAL", value: "*", dataType: "string" };
    }

    // Parenthesized expression
    if (token.type === "LPAREN") {
      this.advance();
      const expr = this.parseExpression();
      this.expect("RPAREN");
      return expr;
    }

    // CALCULATE(expression, filter1, filter2, ...)
    if (token.type === "CALCULATE") {
      return this.parseCalculateExpression();
    }

    // METRIC / DIMENSION
    if (token.type === "METRIC") {
      this.advance();
      return { type: "METRIC", name: this.expect("IDENTIFIER").value };
    }
    if (token.type === "DIMENSION") {
      this.advance();
      return { type: "DIMENSION", name: this.expect("IDENTIFIER").value };
    }

    // TIME expression
    if (token.type === "TIME") {
      this.advance();
      return this.parseTimeExpression();
    }

    // IF / SWITCH
    if (token.type === "IF") {
      return this.parseIfExpression();
    }
    if (token.type === "SWITCH") {
      return this.parseSwitchExpression();
    }

    // Window functions (must check before aggregate since RANK/DENSERANK are special)
    if (token.type === "RANK" || token.type === "DENSERANK" ||
        token.type === "RUNNINGSUM" || token.type === "MOVINGAVERAGE" || token.type === "PERCENTOFTOTAL") {
      return this.parseWindowExpression();
    }

    // Time intelligence functions
    if (token.type === "SAMEPERIODLASTYEAR" || token.type === "DATEADD" ||
        token.type === "DATESBETWEEN" || token.type === "YTD" ||
        token.type === "QTD" || token.type === "MTD" ||
        token.type === "PARALLELPERIOD" || token.type === "ROLLINGN") {
      return this.parseTimeIntelExpression();
    }

    // Context clearing functions
    if (token.type === "ALL" || token.type === "ALLEXCEPT" ||
        token.type === "ALLSELECTED" || token.type === "REMOVEFILTERS" ||
        token.type === "KEEPFILTERS") {
      return this.parseContextClearExpression();
    }

    // Relationship functions
    if (token.type === "RELATED" || token.type === "RELATEDTABLE") {
      return this.parseRelationshipExpression();
    }

    // Aggregate and scalar functions
    if (token.type === "SUM" || token.type === "AVG" || token.type === "COUNT" ||
        token.type === "MIN" || token.type === "MAX" || token.type === "COUNTDISTINCT" ||
        token.type === "MEDIAN" || token.type === "PERCENTILE" ||
        token.type === "STDEV" || token.type === "VARIANCE" ||
        token.type === "DATE_TRUNC" || token.type === "DATE_ADD" ||
        token.type === "DATE_SUB" || token.type === "DATE_DIFF" ||
        token.type === "IFERROR" || token.type === "CONCAT" ||
        token.type === "FORMAT" || token.type === "LEN" ||
        token.type === "UPPER" || token.type === "LOWER" || token.type === "TRIM" ||
        token.type === "LEFT" || token.type === "RIGHT" || token.type === "MID") {
      return this.parseFunctionExpression();
    }

    // Literals
    if (token.type === "STRING") { this.advance(); return { type: "LITERAL", value: token.value, dataType: "string" }; }
    if (token.type === "NUMBER") { this.advance(); return { type: "LITERAL", value: parseFloat(token.value), dataType: "number" }; }
    if (token.type === "TRUE") { this.advance(); return { type: "LITERAL", value: true, dataType: "boolean" }; }
    if (token.type === "FALSE") { this.advance(); return { type: "LITERAL", value: false, dataType: "boolean" }; }

    // Bracket-enclosed measure references: [MeasureRef]
    if (token.type === "LBRACKET") {
      this.advance();
      const nameToken = this.advance();
      this.expect("RBRACKET");
      return { type: "IDENTIFIER", name: `[${nameToken.value}]` };
    }

    // Identifiers (column refs, table.col)
    if (token.type === "IDENTIFIER") {
      this.advance();
      if (this.peek().type === "DOT") {
        this.advance();
        const column = this.expect("IDENTIFIER").value;
        return { type: "IDENTIFIER", name: column, table: token.value };
      }
      return { type: "IDENTIFIER", name: token.value };
    }

    throw new Error(`Unexpected token ${token.type} at line ${token.line}, column ${token.column}`);
  }

  // ─── Specialized Parsers ────────────────────────────────────────────────

  private parseTimeExpression(): TimeExpression {
    const periodToken = this.advance();
    let period: TimeExpression["period"];

    // Handle compound period names (e.g., THIS_MONTH, LAST_YEAR as single tokens)
    const compoundMap: Record<string, TimeExpression["period"]> = {
      "THIS_WEEK": "THIS_WEEK",
      "THIS_MONTH": "THIS_MONTH",
      "THIS_QUARTER": "THIS_QUARTER",
      "THIS_YEAR": "THIS_YEAR",
      "LAST_WEEK": "LAST_WEEK",
      "LAST_MONTH": "LAST_MONTH",
      "LAST_QUARTER": "LAST_QUARTER",
      "LAST_YEAR": "LAST_YEAR",
    };

    const upperValue = periodToken.value.toUpperCase();
    if (compoundMap[upperValue]) {
      period = compoundMap[upperValue];
    } else {
      switch (periodToken.type) {
        case "TODAY": period = "TODAY"; break;
        case "YESTERDAY": period = "YESTERDAY"; break;
        case "THIS":
          if (this.peek().type === "WEEK") { this.advance(); period = "THIS_WEEK"; }
          else if (this.peek().type === "MONTH") { this.advance(); period = "THIS_MONTH"; }
          else if (this.peek().type === "QUARTER") { this.advance(); period = "THIS_QUARTER"; }
          else if (this.peek().type === "YEAR") { this.advance(); period = "THIS_YEAR"; }
          else { throw new Error(`Expected WEEK, MONTH, QUARTER, or YEAR after THIS at line ${periodToken.line}`); }
          break;
        case "LAST":
          if (this.peek().type === "WEEK") { this.advance(); period = "LAST_WEEK"; }
          else if (this.peek().type === "MONTH") { this.advance(); period = "LAST_MONTH"; }
          else if (this.peek().type === "QUARTER") { this.advance(); period = "LAST_QUARTER"; }
          else if (this.peek().type === "YEAR") { this.advance(); period = "LAST_YEAR"; }
          else { throw new Error(`Expected WEEK, MONTH, QUARTER, or YEAR after LAST at line ${periodToken.line}`); }
          break;
        default:
          throw new Error(`Invalid time period: ${periodToken.value} at line ${periodToken.line}`);
      }
    }

    let dateColumn: string | undefined;
    if (this.peek().type === "ON") {
      this.advance();
      dateColumn = this.expect("IDENTIFIER").value;
    }

    return { type: "TIME", period, dateColumn };
  }

  private parseCalculateExpression(): CalculateExpression {
    this.expect("CALCULATE");
    this.expect("LPAREN");
    const expression = this.parseExpression();
    const filterModifiers: FilterModifier[] = [];

    while (this.match("COMMA")) {
      const modifier = this.parseFilterModifier();
      filterModifiers.push(modifier);
    }

    this.expect("RPAREN");
    return { type: "CALCULATE", expression, filterModifiers };
  }

  private parseFilterModifier(): FilterModifier {
    const token = this.peek();

    // Context clearing: ALL(table), ALLSELECTED(table), etc.
    if (token.type === "ALL" || token.type === "ALLEXCEPT" ||
        token.type === "ALLSELECTED" || token.type === "REMOVEFILTERS" ||
        token.type === "KEEPFILTERS") {
      const func = this.advance().value as FilterModifier["function"];
      this.expect("LPAREN");

      const tableOrColumn = this.peek().type === "IDENTIFIER" ? this.expect("IDENTIFIER").value : undefined;
      const columnNames: string[] = [];

      // ALLEXCEPT(table, col1, col2, ...)
      if (func === "ALLEXCEPT" && tableOrColumn && this.peek().type === "COMMA") {
        while (this.match("COMMA")) {
          columnNames.push(this.expect("IDENTIFIER").value);
        }
      }

      this.expect("RPAREN");
      return { type: "FILTER_MODIFIER", function: func, tableName: tableOrColumn, columnNames };
    }

    // Explicit condition filter: table[col] = value or column = value
    const condition = this.parseExpression();
    return { type: "FILTER_MODIFIER", condition };
  }

  private parseWindowExpression(): WindowExpression {
    const funcToken = this.advance();
    const func = funcToken.value as WindowExpression["function"];

    this.expect("LPAREN");
    const expression = (func === "RANK" || func === "DENSERANK") ? undefined : this.parseExpression();
    this.expect("RPAREN");

    this.expect("OVER");
    this.expect("LPAREN");

    const partitionBy: ASTNode[] = [];
    const orderBy: { expression: ASTNode; direction: "ASC" | "DESC" }[] = [];
    let frame: WindowFrame | undefined;

    // Optional PARTITION BY
    if (this.peek().type === "PARTITION") {
      this.advance();
      this.expect("BY");
      do { partitionBy.push(this.parseExpression()); } while (this.match("COMMA"));
    }

    // Optional ORDER BY
    if (this.peek().type === "ORDER") {
      this.advance();
      this.expect("BY");
      do {
        const expr = this.parseExpression();
        let direction: "ASC" | "DESC" = "ASC";
        if (this.peek().type === "ASC") { this.advance(); direction = "ASC"; }
        else if (this.peek().type === "DESC") { this.advance(); direction = "DESC"; }
        orderBy.push({ expression: expr, direction });
      } while (this.match("COMMA"));
    }

    // Optional frame: ROWS/RANGE BETWEEN ... AND ...
    if (this.peek().type === "ROWS" || this.peek().type === "RANGE") {
      const frameType = this.advance().value as WindowFrameType;
      this.expect("BETWEEN");
      const start = this.parseWindowFrameBound();
      this.expect("AND");
      const end = this.parseWindowFrameBound();
      frame = { type: frameType, start, end };
    }

    this.expect("RPAREN");
    return { type: "WINDOW", function: func, expression, partitionBy, orderBy, frame };
  }

  private parseWindowFrameBound(): WindowFrameBound {
    if (this.peek().type === "UNBOUNDED") {
      this.advance();
      if (this.peek().type === "PRECEDING") { this.advance(); return { type: "UNBOUNDED" }; }
      if (this.peek().type === "FOLLOWING") { this.advance(); return { type: "UNBOUNDED" }; }
      return { type: "UNBOUNDED" };
    }
    if (this.peek().type === "CURRENT") {
      this.advance();
      this.expect("ROW");  // Not a keyword yet but we expect it
      return { type: "CURRENT" };
    }
    const value = parseInt(this.expect("NUMBER").value, 10);
    if (this.peek().type === "PRECEDING") { this.advance(); }
    else if (this.peek().type === "FOLLOWING") { this.advance(); }
    return { type: "LITERAL", value };
  }

  private parseTimeIntelExpression(): TimeIntelExpression {
    const funcToken = this.advance();
    const func = funcToken.value as TimeIntelExpression["function"];
    this.expect("LPAREN");

    const dateColumn = this.parseExpression();
    const args: ASTNode[] = [];

    while (this.match("COMMA")) {
      args.push(this.parseExpression());
    }

    this.expect("RPAREN");
    return { type: "TIME_INTEL", function: func, dateColumn, arguments: args };
  }

  private parseContextClearExpression(): ContextClearExpression {
    const funcToken = this.advance();
    const func = funcToken.value as ContextClearExpression["function"];

    this.expect("LPAREN");
    let tableName: string | undefined;
    const columnNames: string[] = [];

    if (this.peek().type === "IDENTIFIER") {
      tableName = this.expect("IDENTIFIER").value;
      while (this.match("COMMA")) {
        columnNames.push(this.expect("IDENTIFIER").value);
      }
    }

    this.expect("RPAREN");
    return { type: "CONTEXT_CLEAR", function: func, tableName, columnNames };
  }

  private parseRelationshipExpression(): RelationshipExpression {
    const funcToken = this.advance();
    const func = funcToken.value as RelationshipExpression["function"];
    this.expect("LPAREN");

    if (func === "RELATED") {
      // RELATED(table[column]) or RELATED(column)
      const first = this.expect("IDENTIFIER").value;
      if (this.peek().type === "DOT") {
        this.advance();
        const col = this.expect("IDENTIFIER").value;
        this.expect("RPAREN");
        return { type: "RELATIONSHIP", function: func, columnName: col, tableName: first };
      }
      this.expect("RPAREN");
      return { type: "RELATIONSHIP", function: func, columnName: first };
    }

    // RELATEDTABLE(table)
    const tableName = this.expect("IDENTIFIER").value;
    this.expect("RPAREN");
    return { type: "RELATIONSHIP", function: func, columnName: "", tableName };
  }

  private parseIfExpression(): IfExpression {
    this.expect("IF");
    this.expect("LPAREN");
    const condition = this.parseExpression();
    this.expect("COMMA");
    const trueExpr = this.parseExpression();
    let falseExpr: ASTNode | undefined;
    if (this.match("COMMA")) {
      falseExpr = this.parseExpression();
    }
    this.expect("RPAREN");
    return { type: "IF", condition, trueExpr, falseExpr };
  }

  private parseSwitchExpression(): SwitchExpression {
    this.expect("SWITCH");
    this.expect("LPAREN");

    let expression: ASTNode | undefined;
    const cases: { value: ASTNode; result: ASTNode }[] = [];
    let defaultExpr: ASTNode | undefined;

    // Check if first token is a comma (no base expression) or an expression
    const firstExpr = this.parseExpression();

    if (this.peek().type === "COMMA") {
      // SWITCH(expression, val1, result1, val2, result2, ..., default)
      expression = firstExpr;
      while (this.match("COMMA")) {
        if (this.peek().type === "RPAREN") {
          // This is the default value
          defaultExpr = this.parseExpression();
          break;
        }
        const value = this.parseExpression();
        if (!this.match("COMMA")) {
          // No comma means this is the default
          defaultExpr = value;
          break;
        }
        const result = this.parseExpression();
        cases.push({ value, result });
      }
    } else {
      // SWITCH(val1, result1, val2, result2, ..., default)
      // First expression is both the value and we need the result
      if (this.match("COMMA")) {
        const result = this.parseExpression();
        cases.push({ value: firstExpr, result });
        while (this.match("COMMA")) {
          if (this.peek().type === "RPAREN") {
            defaultExpr = this.parseExpression();
            break;
          }
          const value = this.parseExpression();
          if (!this.match("COMMA")) {
            defaultExpr = value;
            break;
          }
          const result = this.parseExpression();
          cases.push({ value, result });
        }
      }
    }

    this.expect("RPAREN");
    return { type: "SWITCH", expression, cases, default: defaultExpr };
  }

  private parseFunctionExpression(): FunctionExpression | AggregateExpression {
    const funcToken = this.advance();
    const funcName = funcToken.value;

    this.expect("LPAREN");
    const args: ASTNode[] = [];
    if (this.peek().type !== "RPAREN") {
      do { args.push(this.parseExpression()); } while (this.match("COMMA"));
    }
    this.expect("RPAREN");

    const aggregateFunctions = ["SUM", "AVG", "COUNT", "MIN", "MAX", "COUNTDISTINCT", "MEDIAN", "PERCENTILE", "STDEV", "VARIANCE"];

    if (aggregateFunctions.includes(funcName)) {
      const agg: AggregateExpression = {
        type: "AGGREGATE",
        function: funcName as AggregateExpression["function"],
        expression: args[0] || { type: "LITERAL", value: "*", dataType: "string" },
      };
      // PERCENTILE has an extra argument
      if (funcName === "PERCENTILE" && args.length > 1) {
        const pctVal = args[1];
        if (pctVal.type === "LITERAL" && typeof pctVal.value === "number") {
          agg.percentileN = pctVal.value;
        }
      }
      return agg;
    }

    return { type: "FUNCTION", name: funcName, arguments: args };
  }
}
