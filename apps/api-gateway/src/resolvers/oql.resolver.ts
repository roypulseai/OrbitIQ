import { Resolver, Query, Mutation, Args } from "@nestjs/graphql";
import { ObjectType, Field, ID } from "@nestjs/graphql";
import { OQLService } from "../services/oql.service";
import { QueryEngineService } from "../services/query-engine.service";
import { AuditService } from "../services/audit.service";

@ObjectType()
export class OQLCompileResult {
  @Field()
  sql: string;

  @Field(() => [String])
  params: string[];

  @Field(() => [String])
  warnings: string[];
}

@ObjectType()
export class OQLValidateResult {
  @Field()
  valid: boolean;

  @Field(() => [String])
  errors: string[];

  @Field(() => [String])
  warnings: string[];
}

@ObjectType()
export class OQLExample {
  @Field()
  name: string;

  @Field()
  oql: string;

  @Field()
  description: string;
}

@ObjectType()
export class OQLQueryResultColumn {
  @Field()
  name: string;

  @Field({ nullable: true })
  dataType?: string;

  @Field({ nullable: true })
  nullable?: boolean;

  @Field({ nullable: true })
  isPrimaryKey?: boolean;

  @Field({ nullable: true })
  isForeignKey?: boolean;
}

@ObjectType()
export class OQLQueryResult {
  @Field(() => [OQLQueryResultColumn])
  columns: OQLQueryResultColumn[];

  @Field(() => [String])
  rows: Record<string, unknown>[];

  @Field()
  rowCount: number;

  @Field({ nullable: true })
  executionTimeMs?: number;

  @Field()
  sql: string;

  @Field(() => [String])
  params: string[];

  @Field(() => [String])
  warnings: string[];
}

@Resolver()
export class OQLResolver {
  constructor(
    private readonly oqlService: OQLService,
    private readonly queryEngineService: QueryEngineService,
    private readonly auditService: AuditService
  ) {}

  @Mutation(() => OQLCompileResult)
  async compileOQL(
    @Args("oql") oql: string,
    @Args("dialect", { nullable: true, defaultValue: "postgresql" }) dialect: string
  ): Promise<OQLCompileResult> {
    const result = this.oqlService.compile(oql, dialect);

    await this.auditService.log({
      action: "oql.compile",
      target: "oql",
      metadata: {
        oqlLength: oql.length,
        dialect,
        sqlLength: result.sql.length,
        paramCount: result.params.length,
      },
    });

    return {
      sql: result.sql,
      params: result.params.map(String),
      warnings: result.warnings,
    };
  }

  @Mutation(() => OQLValidateResult)
  async validateOQL(
    @Args("oql") oql: string
  ): Promise<OQLValidateResult> {
    return this.oqlService.validate(oql);
  }

  @Mutation(() => OQLQueryResult)
  async executeOQL(
    @Args("oql") oql: string,
    @Args("connectionId") connectionId: string,
    @Args("dialect", { nullable: true, defaultValue: "postgresql" }) dialect: string
  ): Promise<OQLQueryResult> {
    const compilation = this.oqlService.compile(oql, dialect);
    const result = await this.queryEngineService.execute(
      connectionId,
      compilation.sql,
      compilation.params
    );

    await this.auditService.log({
      action: "oql.execute",
      target: "oql",
      metadata: {
        oqlLength: oql.length,
        dialect,
        connectionId,
        rowCount: result.rowCount,
        executionTimeMs: result.executionTimeMs,
      },
    });

    return {
      ...result,
      sql: compilation.sql,
      params: compilation.params.map(String),
      warnings: compilation.warnings,
    };
  }

  @Query(() => [String])
  async explainOQL(
    @Args("oql") oql: string
  ): Promise<string[]> {
    return this.oqlService.explain(oql);
  }

  @Query(() => [OQLExample])
  async oqlExamples(): Promise<OQLExample[]> {
    return this.oqlService.getExamples();
  }

  @Query(() => [String])
  async oqlKeywords(): Promise<string[]> {
    return this.oqlService.getKeywords();
  }

  @Query(() => [String])
  async oqlFunctions(): Promise<string[]> {
    return this.oqlService.getFunctions();
  }
}
