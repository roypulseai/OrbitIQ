export { Lexer } from "./lexer";
export type { Token, TokenType } from "./lexer";

export { Parser } from "./parser";
export type {
  ASTNode, SelectStatement, FromClause, WhereClause, GroupByClause,
  OrderByClause, LimitClause, OffsetClause, JoinClause, HavingClause,
  ColumnExpression, MetricExpression, DimensionExpression, FilterExpression,
  AggregateExpression, TimeExpression, BinaryExpression, UnaryExpression,
  LiteralExpression, IdentifierExpression, FunctionExpression, AliasedExpression,
  CalculateExpression, FilterModifier, WindowExpression, WindowFrame,
  TimeIntelExpression, ContextClearExpression, RelationshipExpression,
  IfExpression, SwitchExpression,
} from "./parser";

export { Compiler } from "./compiler";
export type { CompileOptions, CompileResult } from "./compiler";

export { MeasureDAG } from "./dag";

import { Lexer } from "./lexer";
import { Parser } from "./parser";
import { Compiler, CompileOptions, CompileResult } from "./compiler";

export function compileOQL(oql: string, options?: CompileOptions): CompileResult {
  const lexer = new Lexer(oql);
  const tokens = lexer.tokenize();
  const parser = new Parser(tokens);
  const ast = parser.parse();
  const compiler = new Compiler(options);
  return compiler.compile(ast);
}
