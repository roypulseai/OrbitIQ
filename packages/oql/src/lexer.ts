export type TokenType =
  // Basic tokens
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
  // Logical
  | "AND"
  | "OR"
  | "NOT"
  // SQL keywords
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
  | "JOIN"
  | "LEFT"
  | "RIGHT"
  | "FULL"
  | "INNER"
  | "ON"
  | "HAVING"
  | "BETWEEN"
  | "IN"
  | "LIKE"
  | "IS"
  | "NULL"
  | "TRUE"
  | "FALSE"
  // Semantic model
  | "METRIC"
  | "DIMENSION"
  | "FILTER"
  // Time keywords
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
  // Aggregate functions
  | "SUM"
  | "AVG"
  | "COUNT"
  | "MIN"
  | "MAX"
  | "COUNTDISTINCT"
  // Statistical functions
  | "MEDIAN"
  | "PERCENTILE"
  | "STDEV"
  | "VARIANCE"
  // Date functions
  | "DATE_TRUNC"
  | "DATE_ADD"
  | "DATE_SUB"
  | "DATE_DIFF"
  // CALCULATE (DAX-equivalent)
  | "CALCULATE"
  // Filter context
  | "ALL"
  | "ALLEXCEPT"
  | "ALLSELECTED"
  | "REMOVEFILTERS"
  | "KEEPFILTERS"
  // Time intelligence
  | "SAMEPERIODLASTYEAR"
  | "DATEADD"
  | "DATESBETWEEN"
  | "YTD"
  | "QTD"
  | "MTD"
  | "PARALLELPERIOD"
  | "ROLLINGN"
  // Window/ranking functions
  | "RANK"
  | "DENSERANK"
  | "RUNNINGSUM"
  | "MOVINGAVERAGE"
  | "PERCENTOFTOTAL"
  | "OVER"
  | "PARTITION"
  | "ROWS"
  | "RANGE"
  | "UNBOUNDED"
  | "PRECEDING"
  | "FOLLOWING"
  | "CURRENT"
  // Relationship functions
  | "RELATED"
  | "RELATEDTABLE"
  // Logical functions
  | "IF"
  | "SWITCH"
  | "IFERROR"
  // Text functions
  | "CONCAT"
  | "FORMAT"
  | "LEFT"
  | "RIGHT"
  | "MID"
  | "TRIM"
  | "LEN"
  | "UPPER"
  | "LOWER"
  // Window frame
  | "FOLLOWING"
  | "PRECEDING"
  | "UNBOUNDED"
  | "CURRENT"
  | "ROW"
  // Brackets
  | "LBRACKET"
  | "RBRACKET"
  // EOF
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
  MEDIAN: "MEDIAN",
  PERCENTILE: "PERCENTILE",
  STDEV: "STDEV",
  VARIANCE: "VARIANCE",
  DATE_TRUNC: "DATE_TRUNC",
  DATE_ADD: "DATE_ADD",
  DATE_SUB: "DATE_SUB",
  DATE_DIFF: "DATE_DIFF",
  CALCULATE: "CALCULATE",
  ALL: "ALL",
  ALLEXCEPT: "ALLEXCEPT",
  ALLSELECTED: "ALLSELECTED",
  REMOVEFILTERS: "REMOVEFILTERS",
  KEEPFILTERS: "KEEPFILTERS",
  SAMEPERIODLASTYEAR: "SAMEPERIODLASTYEAR",
  DATEADD: "DATEADD",
  DATESBETWEEN: "DATESBETWEEN",
  YTD: "YTD",
  QTD: "QTD",
  MTD: "MTD",
  PARALLELPERIOD: "PARALLELPERIOD",
  ROLLINGN: "ROLLINGN",
  RANK: "RANK",
  DENSERANK: "DENSERANK",
  RUNNINGSUM: "RUNNINGSUM",
  MOVINGAVERAGE: "MOVINGAVERAGE",
  PERCENTOFTOTAL: "PERCENTOFTOTAL",
  OVER: "OVER",
  PARTITION: "PARTITION",
  ROWS: "ROWS",
  RANGE: "RANGE",
  UNBOUNDED: "UNBOUNDED",
  PRECEDING: "PRECEDING",
  FOLLOWING: "FOLLOWING",
  CURRENT: "CURRENT",
  RELATED: "RELATED",
  RELATEDTABLE: "RELATEDTABLE",
  IF: "IF",
  SWITCH: "SWITCH",
  IFERROR: "IFERROR",
  CONCAT: "CONCAT",
  FORMAT: "FORMAT",
  MID: "MID",
  TRIM: "TRIM",
  LEN: "LEN",
  UPPER: "UPPER",
  LOWER: "LOWER",
};

const AGGREGATE_FUNCTIONS = new Set([
  "SUM", "AVG", "COUNT", "MIN", "MAX", "COUNTDISTINCT",
  "MEDIAN", "PERCENTILE", "STDEV", "VARIANCE",
]);

const WINDOW_FUNCTIONS = new Set([
  "RANK", "DENSERANK", "RUNNINGSUM", "MOVINGAVERAGE", "PERCENTOFTOTAL",
]);

const TIME_INTELLIGENCE = new Set([
  "SAMEPERIODLASTYEAR", "DATEADD", "DATESBETWEEN",
  "YTD", "QTD", "MTD", "PARALLELPERIOD", "ROLLINGN",
]);

const CONTEXT_CLEARING = new Set([
  "ALL", "ALLEXCEPT", "ALLSELECTED", "REMOVEFILTERS", "KEEPFILTERS",
]);

const RELATIONSHIP_FUNCTIONS = new Set(["RELATED", "RELATEDTABLE"]);

const TEXT_FUNCTIONS = new Set(["CONCAT", "FORMAT", "LEFT", "RIGHT", "MID", "TRIM", "LEN", "UPPER", "LOWER"]);

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
          case "n": value += "\n"; break;
          case "t": value += "\t"; break;
          case "\\": value += "\\"; break;
          case "'": value += "'"; break;
          case '"': value += '"'; break;
          default: value += escaped;
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

    while (this.pos < this.input.length && /[0-9]/.test(this.peek())) {
      value += this.advance();
    }

    if (this.peek() === "." && /[0-9]/.test(this.input[this.pos + 1])) {
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
      return { type: "STRING", value: this.readString(), line: startLine, column: startColumn };
    }

    if (/[0-9]/.test(char)) {
      return { type: "NUMBER", value: this.readNumber(), line: startLine, column: startColumn };
    }

    if (/[a-zA-Z_]/.test(char)) {
      const value = this.readIdentifier();
      const upperValue = value.toUpperCase();
      const type = KEYWORDS[upperValue] || "IDENTIFIER";

      // Check aggregate functions (need token-level recognition)
      if (type === "IDENTIFIER" && AGGREGATE_FUNCTIONS.has(upperValue)) {
        return { type: upperValue as TokenType, value: upperValue, line: startLine, column: startColumn };
      }

      // Window functions
      if (type === "IDENTIFIER" && WINDOW_FUNCTIONS.has(upperValue)) {
        return { type: upperValue as TokenType, value: upperValue, line: startLine, column: startColumn };
      }

      // Time intelligence
      if (type === "IDENTIFIER" && TIME_INTELLIGENCE.has(upperValue)) {
        return { type: upperValue as TokenType, value: upperValue, line: startLine, column: startColumn };
      }

      // Context clearing
      if (type === "IDENTIFIER" && CONTEXT_CLEARING.has(upperValue)) {
        return { type: upperValue as TokenType, value: upperValue, line: startLine, column: startColumn };
      }

      // Relationship functions
      if (type === "IDENTIFIER" && RELATIONSHIP_FUNCTIONS.has(upperValue)) {
        return { type: upperValue as TokenType, value: upperValue, line: startLine, column: startColumn };
      }

      // Text functions
      if (type === "IDENTIFIER" && TEXT_FUNCTIONS.has(upperValue)) {
        return { type: upperValue as TokenType, value: upperValue, line: startLine, column: startColumn };
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
      case ".": return { type: "DOT", value: ".", line: startLine, column: startColumn };
      case ",": return { type: "COMMA", value: ",", line: startLine, column: startColumn };
      case "(": return { type: "LPAREN", value: "(", line: startLine, column: startColumn };
      case ")": return { type: "RPAREN", value: ")", line: startLine, column: startColumn };
      case "*": return { type: "STAR", value: "*", line: startLine, column: startColumn };
      case "+": return { type: "PLUS", value: "+", line: startLine, column: startColumn };
      case "-": return { type: "MINUS", value: "-", line: startLine, column: startColumn };
      case "/": return { type: "SLASH", value: "/", line: startLine, column: startColumn };
      case "%": return { type: "PERCENT", value: "%", line: startLine, column: startColumn };
      case "=": return { type: "EQ", value: "=", line: startLine, column: startColumn };
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
      case "[":
        return { type: "LBRACKET", value: "[", line: startLine, column: startColumn };
      case "]":
        return { type: "RBRACKET", value: "]", line: startLine, column: startColumn };
      default:
        throw new Error(`Unexpected character '${char}' at line ${startLine}, column ${startColumn}`);
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
