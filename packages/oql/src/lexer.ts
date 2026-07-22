export type TokenType =
  | "IDENTIFIER"
  | "STRING"
  | "NUMBER"
  | "DOT"
  | "COMMA"
  | "LPAREN"
  | "RPAREN"
  | "STAR"
  | "PLUS"
  | "MINUS"
  | "SLASH"
  | "PERCENT"
  | "EQ"
  | "NEQ"
  | "LT"
  | "GT"
  | "LTE"
  | "GTE"
  | "AND"
  | "OR"
  | "NOT"
  | "AS"
  | "FROM"
  | "WHERE"
  | "GROUP"
  | "BY"
  | "ORDER"
  | "ASC"
  | "DESC"
  | "LIMIT"
  | "OFFSET"
  | "SELECT"
  | "METRIC"
  | "DIMENSION"
  | "FILTER"
  | "TIME"
  | "LAST"
  | "NEXT"
  | "TODAY"
  | "YESTERDAY"
  | "THIS"
  | "WEEK"
  | "MONTH"
  | "QUARTER"
  | "YEAR"
  | "SUM"
  | "AVG"
  | "COUNT"
  | "MIN"
  | "MAX"
  | "COUNTDISTINCT"
  | "DATE_TRUNC"
  | "DATE_ADD"
  | "DATE_SUB"
  | "DATE_DIFF"
  | "BETWEEN"
  | "IN"
  | "LIKE"
  | "IS"
  | "NULL"
  | "TRUE"
  | "FALSE"
  | "JOIN"
  | "LEFT"
  | "RIGHT"
  | "FULL"
  | "INNER"
  | "ON"
  | "HAVING"
  | "EOF";

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}

const KEYWORDS: Record<string, TokenType> = {
  SELECT: "SELECT",
  METRIC: "METRIC",
  DIMENSION: "DIMENSION",
  FROM: "FROM",
  WHERE: "WHERE",
  FILTER: "FILTER",
  GROUP: "GROUP",
  BY: "BY",
  ORDER: "ORDER",
  ASC: "ASC",
  DESC: "DESC",
  LIMIT: "LIMIT",
  OFFSET: "OFFSET",
  AS: "AS",
  AND: "AND",
  OR: "OR",
  NOT: "NOT",
  BETWEEN: "BETWEEN",
  IN: "IN",
  LIKE: "LIKE",
  IS: "IS",
  NULL: "NULL",
  TRUE: "TRUE",
  FALSE: "FALSE",
  JOIN: "JOIN",
  LEFT: "LEFT",
  RIGHT: "RIGHT",
  FULL: "FULL",
  INNER: "INNER",
  ON: "ON",
  HAVING: "HAVING",
  TIME: "TIME",
  LAST: "LAST",
  NEXT: "NEXT",
  TODAY: "TODAY",
  YESTERDAY: "YESTERDAY",
  THIS: "THIS",
  WEEK: "WEEK",
  MONTH: "MONTH",
  QUARTER: "QUARTER",
  YEAR: "YEAR",
  SUM: "SUM",
  AVG: "AVG",
  COUNT: "COUNT",
  MIN: "MIN",
  MAX: "MAX",
  COUNTDISTINCT: "COUNTDISTINCT",
  DATE_TRUNC: "DATE_TRUNC",
  DATE_ADD: "DATE_ADD",
  DATE_SUB: "DATE_SUB",
  DATE_DIFF: "DATE_DIFF",
};

const AGGREGATE_FUNCTIONS = new Set([
  "SUM",
  "AVG",
  "COUNT",
  "MIN",
  "MAX",
  "COUNTDISTINCT",
]);

export class Lexer {
  private input: string;
  private pos: number = 0;
  private line: number = 1;
  private column: number = 1;

  constructor(input: string) {
    this.input = input;
  }

  private peek(): string {
    return this.input[this.pos] || "";
  }

  private advance(): string {
    const char = this.input[this.pos];
    this.pos++;
    if (char === "\n") {
      this.line++;
      this.column = 1;
    } else {
      this.column++;
    }
    return char;
  }

  private skipWhitespace(): void {
    while (this.pos < this.input.length && /\s/.test(this.peek())) {
      this.advance();
    }
  }

  private skipComment(): void {
    if (this.peek() === "-" && this.input[this.pos + 1] === "-") {
      while (this.pos < this.input.length && this.peek() !== "\n") {
        this.advance();
      }
      this.skipWhitespace();
      return;
    }

    if (this.peek() === "/" && this.input[this.pos + 1] === "*") {
      this.advance();
      this.advance();
      while (
        this.pos < this.input.length &&
        !(this.peek() === "*" && this.input[this.pos + 1] === "/")
      ) {
        this.advance();
      }
      this.advance();
      this.advance();
      this.skipWhitespace();
    }
  }

  private readString(): string {
    const quote = this.advance();
    let value = "";

    while (this.pos < this.input.length && this.peek() !== quote) {
      if (this.peek() === "\\") {
        this.advance();
        const escaped = this.advance();
        switch (escaped) {
          case "n":
            value += "\n";
            break;
          case "t":
            value += "\t";
            break;
          case "\\":
            value += "\\";
            break;
          case "'":
            value += "'";
            break;
          case '"':
            value += '"';
            break;
          default:
            value += escaped;
        }
      } else {
        value += this.advance();
      }
    }

    this.advance();
    return value;
  }

  private readNumber(): string {
    let value = "";
    let hasDecimal = false;

    while (this.pos < this.input.length && /[0-9]/.test(this.peek())) {
      value += this.advance();
    }

    if (this.peek() === "." && /[0-9]/.test(this.input[this.pos + 1])) {
      hasDecimal = true;
      value += this.advance();
      while (this.pos < this.input.length && /[0-9]/.test(this.peek())) {
        value += this.advance();
      }
    }

    return value;
  }

  private readIdentifier(): string {
    let value = "";

    while (
      this.pos < this.input.length &&
      /[a-zA-Z0-9_]/.test(this.peek())
    ) {
      value += this.advance();
    }

    return value;
  }

  nextToken(): Token {
    this.skipWhitespace();
    this.skipComment();
    this.skipWhitespace();

    if (this.pos >= this.input.length) {
      return { type: "EOF", value: "", line: this.line, column: this.column };
    }

    const startLine = this.line;
    const startColumn = this.column;
    const char = this.peek();

    if (char === "'" || char === '"') {
      return {
        type: "STRING",
        value: this.readString(),
        line: startLine,
        column: startColumn,
      };
    }

    if (/[0-9]/.test(char)) {
      return {
        type: "NUMBER",
        value: this.readNumber(),
        line: startLine,
        column: startColumn,
      };
    }

    if (/[a-zA-Z_]/.test(char)) {
      const value = this.readIdentifier();
      const upperValue = value.toUpperCase();
      const type = KEYWORDS[upperValue] || "IDENTIFIER";

      if (type === "IDENTIFIER" && AGGREGATE_FUNCTIONS.has(upperValue)) {
        return {
          type: upperValue as TokenType,
          value: upperValue,
          line: startLine,
          column: startColumn,
        };
      }

      return {
        type,
        value: upperValue === value.toUpperCase() ? upperValue : value,
        line: startLine,
        column: startColumn,
      };
    }

    this.advance();

    switch (char) {
      case ".":
        return { type: "DOT", value: ".", line: startLine, column: startColumn };
      case ",":
        return { type: "COMMA", value: ",", line: startLine, column: startColumn };
      case "(":
        return { type: "LPAREN", value: "(", line: startLine, column: startColumn };
      case ")":
        return { type: "RPAREN", value: ")", line: startLine, column: startColumn };
      case "*":
        return { type: "STAR", value: "*", line: startLine, column: startColumn };
      case "+":
        return { type: "PLUS", value: "+", line: startLine, column: startColumn };
      case "-":
        return { type: "MINUS", value: "-", line: startLine, column: startColumn };
      case "/":
        return { type: "SLASH", value: "/", line: startLine, column: startColumn };
      case "%":
        return { type: "PERCENT", value: "%", line: startLine, column: startColumn };
      case "=":
        return { type: "EQ", value: "=", line: startLine, column: startColumn };
      case "!":
        if (this.peek() === "=") {
          this.advance();
          return { type: "NEQ", value: "!=", line: startLine, column: startColumn };
        }
        return { type: "NOT", value: "!", line: startLine, column: startColumn };
      case "<":
        if (this.peek() === "=") {
          this.advance();
          return { type: "LTE", value: "<=", line: startLine, column: startColumn };
        }
        return { type: "LT", value: "<", line: startLine, column: startColumn };
      case ">":
        if (this.peek() === "=") {
          this.advance();
          return { type: "GTE", value: ">=", line: startLine, column: startColumn };
        }
        return { type: "GT", value: ">", line: startLine, column: startColumn };
      default:
        throw new Error(
          `Unexpected character '${char}' at line ${startLine}, column ${startColumn}`
        );
    }
  }

  tokenize(): Token[] {
    const tokens: Token[] = [];
    let token = this.nextToken();

    while (token.type !== "EOF") {
      tokens.push(token);
      token = this.nextToken();
    }

    tokens.push(token);
    return tokens;
  }
}
