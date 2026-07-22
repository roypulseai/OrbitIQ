import { Lexer, Token, TokenType } from "./lexer";

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
  | AliasedExpression;

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

export interface FromClause {
  type: "FROM";
  table: string;
  alias?: string;
}

export interface WhereClause {
  type: "WHERE";
  condition: ASTNode;
}

export interface GroupByClause {
  type: "GROUP_BY";
  columns: (ColumnExpression | IdentifierExpression)[];
}

export interface OrderByClause {
  type: "ORDER_BY";
  columns: { expression: ASTNode; direction: "ASC" | "DESC" }[];
}

export interface LimitClause {
  type: "LIMIT";
  value: number;
}

export interface OffsetClause {
  type: "OFFSET";
  value: number;
}

export interface JoinClause {
  type: "JOIN";
  joinType: "INNER" | "LEFT" | "RIGHT" | "FULL";
  table: string;
  alias?: string;
  on: ASTNode;
}

export interface HavingClause {
  type: "HAVING";
  condition: ASTNode;
}

export interface ColumnExpression {
  type: "COLUMN";
  expression: ASTNode;
  alias?: string;
}

export interface MetricExpression {
  type: "METRIC";
  name: string;
  alias?: string;
}

export interface DimensionExpression {
  type: "DIMENSION";
  name: string;
  alias?: string;
}

export interface FilterExpression {
  type: "FILTER";
  condition: ASTNode;
}

export interface AggregateExpression {
  type: "AGGREGATE";
  function: "SUM" | "AVG" | "COUNT" | "MIN" | "MAX" | "COUNTDISTINCT";
  expression: ASTNode;
  alias?: string;
}

export interface TimeExpression {
  type: "TIME";
  period: "TODAY" | "YESTERDAY" | "THIS_WEEK" | "LAST_WEEK" | "THIS_MONTH" | "LAST_MONTH" | "THIS_QUARTER" | "LAST_QUARTER" | "THIS_YEAR" | "LAST_YEAR";
  dateColumn?: string;
}

export interface BinaryExpression {
  type: "BINARY";
  operator: string;
  left: ASTNode;
  right: ASTNode;
}

export interface UnaryExpression {
  type: "UNARY";
  operator: string;
  operand: ASTNode;
}

export interface LiteralExpression {
  type: "LITERAL";
  value: string | number | boolean;
  dataType: "string" | "number" | "boolean";
}

export interface IdentifierExpression {
  type: "IDENTIFIER";
  name: string;
  table?: string;
}

export interface FunctionExpression {
  type: "FUNCTION";
  name: string;
  arguments: ASTNode[];
}

export interface AliasedExpression {
  type: "ALIASED";
  expression: ASTNode;
  alias: string;
}

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
      throw new Error(
        `Expected ${type} but got ${token.type} at line ${token.line}, column ${token.column}`
      );
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

  parse(): SelectStatement {
    const statement: SelectStatement = {
      type: "SELECT",
      columns: [],
      from: { type: "FROM", table: "" },
      joins: [],
    };

    // Parse SELECT clause
    this.expect("SELECT");
    statement.columns = this.parseSelectColumns();

    // Parse FROM clause
    this.expect("FROM");
    statement.from = this.parseFromClause();

    // Parse optional JOIN clauses
    while (this.peek().type === "JOIN" || this.peek().type === "LEFT" || this.peek().type === "RIGHT" || this.peek().type === "FULL" || this.peek().type === "INNER") {
      statement.joins.push(this.parseJoinClause());
    }

    // Parse optional WHERE clause
    if (this.peek().type === "WHERE" || this.peek().type === "FILTER") {
      statement.where = this.parseWhereClause();
    }

    // Parse optional GROUP BY clause
    if (this.peek().type === "GROUP") {
      statement.groupBy = this.parseGroupByClause();
    }

    // Parse optional HAVING clause
    if (this.peek().type === "HAVING") {
      statement.having = this.parseHavingClause();
    }

    // Parse optional ORDER BY clause
    if (this.peek().type === "ORDER") {
      statement.orderBy = this.parseOrderByClause();
    }

    // Parse optional LIMIT clause
    if (this.peek().type === "LIMIT") {
      statement.limit = this.parseLimitClause();
    }

    // Parse optional OFFSET clause
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

      columns.push({
        type: "COLUMN",
        expression,
        alias,
      });
    } while (this.match("COMMA"));

    return columns;
  }

  private parseFromClause(): FromClause {
    const table = this.expect("IDENTIFIER").value;
    const alias = this.parseAlias();

    return {
      type: "FROM",
      table,
      alias,
    };
  }

  private parseJoinClause(): JoinClause {
    let joinType: "INNER" | "LEFT" | "RIGHT" | "FULL" = "INNER";

    if (this.peek().type === "LEFT") {
      this.advance();
      joinType = "LEFT";
    } else if (this.peek().type === "RIGHT") {
      this.advance();
      joinType = "RIGHT";
    } else if (this.peek().type === "FULL") {
      this.advance();
      joinType = "FULL";
    } else if (this.peek().type === "INNER") {
      this.advance();
      joinType = "INNER";
    }

    this.expect("JOIN");
    const table = this.expect("IDENTIFIER").value;
    const alias = this.parseAlias();

    this.expect("ON");
    const on = this.parseExpression();

    return {
      type: "JOIN",
      joinType,
      table,
      alias,
      on,
    };
  }

  private parseWhereClause(): WhereClause {
    if (this.peek().type === "FILTER") {
      this.advance();
    } else {
      this.expect("WHERE");
    }

    const condition = this.parseExpression();

    return {
      type: "WHERE",
      condition,
    };
  }

  private parseGroupByClause(): GroupByClause {
    this.expect("GROUP");
    this.expect("BY");

    const columns: (ColumnExpression | IdentifierExpression)[] = [];

    do {
      const expr = this.parseExpression();
      if (expr.type === "IDENTIFIER") {
        columns.push(expr);
      } else if (expr.type === "COLUMN") {
        columns.push(expr);
      } else {
        columns.push({
          type: "COLUMN",
          expression: expr,
        });
      }
    } while (this.match("COMMA"));

    return {
      type: "GROUP_BY",
      columns,
    };
  }

  private parseOrderByClause(): OrderByClause {
    this.expect("ORDER");
    this.expect("BY");

    const columns: { expression: ASTNode; direction: "ASC" | "DESC" }[] = [];

    do {
      const expression = this.parseExpression();
      let direction: "ASC" | "DESC" = "ASC";

      if (this.peek().type === "ASC") {
        this.advance();
        direction = "ASC";
      } else if (this.peek().type === "DESC") {
        this.advance();
        direction = "DESC";
      }

      columns.push({ expression, direction });
    } while (this.match("COMMA"));

    return {
      type: "ORDER_BY",
      columns,
    };
  }

  private parseLimitClause(): LimitClause {
    this.expect("LIMIT");
    const value = parseInt(this.expect("NUMBER").value, 10);

    return {
      type: "LIMIT",
      value,
    };
  }

  private parseOffsetClause(): OffsetClause {
    this.expect("OFFSET");
    const value = parseInt(this.expect("NUMBER").value, 10);

    return {
      type: "OFFSET",
      value,
    };
  }

  private parseHavingClause(): HavingClause {
    this.expect("HAVING");
    const condition = this.parseExpression();

    return {
      type: "HAVING",
      condition,
    };
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

  private parseExpression(): ASTNode {
    return this.parseOrExpression();
  }

  private parseOrExpression(): ASTNode {
    let left = this.parseAndExpression();

    while (this.peek().type === "OR") {
      this.advance();
      const right = this.parseAndExpression();
      left = {
        type: "BINARY",
        operator: "OR",
        left,
        right,
      };
    }

    return left;
  }

  private parseAndExpression(): ASTNode {
    let left = this.parseComparisonExpression();

    while (this.peek().type === "AND") {
      this.advance();
      const right = this.parseComparisonExpression();
      left = {
        type: "BINARY",
        operator: "AND",
        left,
        right,
      };
    }

    return left;
  }

  private parseComparisonExpression(): ASTNode {
    let left = this.parseAdditiveExpression();

    while (
      this.peek().type === "EQ" ||
      this.peek().type === "NEQ" ||
      this.peek().type === "LT" ||
      this.peek().type === "GT" ||
      this.peek().type === "LTE" ||
      this.peek().type === "GTE" ||
      this.peek().type === "LIKE" ||
      this.peek().type === "BETWEEN" ||
      this.peek().type === "IN" ||
      this.peek().type === "IS"
    ) {
      const operator = this.advance().value;

      if (operator === "BETWEEN") {
        const low = this.parseAdditiveExpression();
        this.expect("AND");
        const high = this.parseAdditiveExpression();
        left = {
          type: "BINARY",
          operator: "BETWEEN",
          left,
          right: { type: "BINARY", operator: "AND", left: low, right: high },
        };
      } else if (operator === "IN") {
        this.expect("LPAREN");
        const values: ASTNode[] = [];
        do {
          values.push(this.parseExpression());
        } while (this.match("COMMA"));
        this.expect("RPAREN");
        left = {
          type: "BINARY",
          operator: "IN",
          left,
          right: { type: "FUNCTION", name: "VALUES", arguments: values },
        };
      } else if (operator === "IS") {
        if (this.peek().type === "NOT") {
          this.advance();
          this.expect("NULL");
          left = {
            type: "UNARY",
            operator: "IS_NOT_NULL",
            operand: left,
          };
        } else {
          this.expect("NULL");
          left = {
            type: "UNARY",
            operator: "IS_NULL",
            operand: left,
          };
        }
      } else {
        const right = this.parseAdditiveExpression();
        left = {
          type: "BINARY",
          operator,
          left,
          right,
        };
      }
    }

    return left;
  }

  private parseAdditiveExpression(): ASTNode {
    let left = this.parseMultiplicativeExpression();

    while (this.peek().type === "PLUS" || this.peek().type === "MINUS") {
      const operator = this.advance().value;
      const right = this.parseMultiplicativeExpression();
      left = {
        type: "BINARY",
        operator,
        left,
        right,
      };
    }

    return left;
  }

  private parseMultiplicativeExpression(): ASTNode {
    let left = this.parseUnaryExpression();

    while (
      this.peek().type === "STAR" ||
      this.peek().type === "SLASH" ||
      this.peek().type === "PERCENT"
    ) {
      const operator = this.advance().value;
      const right = this.parseUnaryExpression();
      left = {
        type: "BINARY",
        operator,
        left,
        right,
      };
    }

    return left;
  }

  private parseUnaryExpression(): ASTNode {
    if (this.peek().type === "NOT") {
      this.advance();
      const operand = this.parseUnaryExpression();
      return {
        type: "UNARY",
        operator: "NOT",
        operand,
      };
    }

    if (this.peek().type === "MINUS") {
      this.advance();
      const operand = this.parseUnaryExpression();
      return {
        type: "UNARY",
        operator: "-",
        operand,
      };
    }

    return this.parsePrimaryExpression();
  }

  private parsePrimaryExpression(): ASTNode {
    const token = this.peek();

    if (token.type === "LPAREN") {
      this.advance();
      const expr = this.parseExpression();
      this.expect("RPAREN");
      return expr;
    }

    if (token.type === "METRIC") {
      this.advance();
      const name = this.expect("IDENTIFIER").value;
      return {
        type: "METRIC",
        name,
      };
    }

    if (token.type === "DIMENSION") {
      this.advance();
      const name = this.expect("IDENTIFIER").value;
      return {
        type: "DIMENSION",
        name,
      };
    }

    if (token.type === "TIME") {
      this.advance();
      return this.parseTimeExpression();
    }

    if (
      token.type === "SUM" ||
      token.type === "AVG" ||
      token.type === "COUNT" ||
      token.type === "MIN" ||
      token.type === "MAX" ||
      token.type === "COUNTDISTINCT" ||
      token.type === "DATE_TRUNC" ||
      token.type === "DATE_ADD" ||
      token.type === "DATE_SUB" ||
      token.type === "DATE_DIFF"
    ) {
      return this.parseFunctionExpression();
    }

    if (token.type === "STRING") {
      this.advance();
      return {
        type: "LITERAL",
        value: token.value,
        dataType: "string",
      };
    }

    if (token.type === "NUMBER") {
      this.advance();
      const num = parseFloat(token.value);
      return {
        type: "LITERAL",
        value: num,
        dataType: "number",
      };
    }

    if (token.type === "TRUE") {
      this.advance();
      return {
        type: "LITERAL",
        value: true,
        dataType: "boolean",
      };
    }

    if (token.type === "FALSE") {
      this.advance();
      return {
        type: "LITERAL",
        value: false,
        dataType: "boolean",
      };
    }

    if (token.type === "IDENTIFIER") {
      this.advance();

      if (this.peek().type === "DOT") {
        this.advance();
        const column = this.expect("IDENTIFIER").value;
        return {
          type: "IDENTIFIER",
          name: column,
          table: token.value,
        };
      }

      return {
        type: "IDENTIFIER",
        name: token.value,
      };
    }

    throw new Error(
      `Unexpected token ${token.type} at line ${token.line}, column ${token.column}`
    );
  }

  private parseTimeExpression(): TimeExpression {
    const periodToken = this.advance();

    let period: TimeExpression["period"];

    switch (periodToken.type) {
      case "TODAY":
        period = "TODAY";
        break;
      case "YESTERDAY":
        period = "YESTERDAY";
        break;
      case "THIS":
        if (this.peek().type === "WEEK") {
          this.advance();
          period = "THIS_WEEK";
        } else if (this.peek().type === "MONTH") {
          this.advance();
          period = "THIS_MONTH";
        } else if (this.peek().type === "QUARTER") {
          this.advance();
          period = "THIS_QUARTER";
        } else if (this.peek().type === "YEAR") {
          this.advance();
          period = "THIS_YEAR";
        } else {
          throw new Error(`Expected WEEK, MONTH, QUARTER, or YEAR after THIS at line ${periodToken.line}`);
        }
        break;
      case "LAST":
        if (this.peek().type === "WEEK") {
          this.advance();
          period = "LAST_WEEK";
        } else if (this.peek().type === "MONTH") {
          this.advance();
          period = "LAST_MONTH";
        } else if (this.peek().type === "QUARTER") {
          this.advance();
          period = "LAST_QUARTER";
        } else if (this.peek().type === "YEAR") {
          this.advance();
          period = "LAST_YEAR";
        } else {
          throw new Error(`Expected WEEK, MONTH, QUARTER, or YEAR after LAST at line ${periodToken.line}`);
        }
        break;
      default:
        throw new Error(`Invalid time period: ${periodToken.value} at line ${periodToken.line}`);
    }

    let dateColumn: string | undefined;
    if (this.peek().type === "ON") {
      this.advance();
      dateColumn = this.expect("IDENTIFIER").value;
    }

    return {
      type: "TIME",
      period,
      dateColumn,
    };
  }

  private parseFunctionExpression(): FunctionExpression | AggregateExpression {
    const funcToken = this.advance();
    const funcName = funcToken.value;

    this.expect("LPAREN");
    const args: ASTNode[] = [];

    if (this.peek().type !== "RPAREN") {
      do {
        args.push(this.parseExpression());
      } while (this.match("COMMA"));
    }

    this.expect("RPAREN");

    const aggregateFunctions = ["SUM", "AVG", "COUNT", "MIN", "MAX", "COUNTDISTINCT"];

    if (aggregateFunctions.includes(funcName)) {
      return {
        type: "AGGREGATE",
        function: funcName as AggregateExpression["function"],
        expression: args[0] || { type: "LITERAL", value: "*", dataType: "string" },
      };
    }

    return {
      type: "FUNCTION",
      name: funcName,
      arguments: args,
    };
  }
}
