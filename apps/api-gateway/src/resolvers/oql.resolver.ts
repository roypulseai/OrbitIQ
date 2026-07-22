import { Resolver, Query, Mutation, Args } from "@nestjs/graphql";
import { ObjectType, Field, ID } from "@nestjs/graphql";
import { OQLService } from "../services/oql.service";
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

@Resolver()
export class OQLResolver {
  constructor(
    private readonly oqlService: OQLService,
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
