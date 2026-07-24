import { Resolver, Query, Mutation, Args, ID, Int, Float } from "@nestjs/graphql";
import {
  ParsedIntent as ParsedIntentGQL,
  IntentStats as IntentStatsGQL,
  AvailableEntity as AvailableEntityGQL,
} from "../schema";
import { IntentParserService } from "../services/intent-parser.service";
import { SemanticResolverService } from "../services/semantic-resolver.service";

@Resolver()
export class IntentParserResolver {
  constructor(
    private readonly intentParserService: IntentParserService,
    private readonly semanticResolverService: SemanticResolverService,
  ) {}

  @Query(() => [ParsedIntentGQL], { name: "recentIntents" })
  async getRecentIntents(
    @Args("limit", { type: () => Int, nullable: true, defaultValue: 10 }) limit: number,
  ): Promise<ParsedIntentGQL[]> {
    return this.intentParserService.getRecentIntents(limit) as any;
  }

  @Query(() => IntentStatsGQL, { name: "intentStats" })
  async getIntentStats(): Promise<IntentStatsGQL> {
    return this.intentParserService.getIntentStats() as any;
  }

  @Query(() => [AvailableEntityGQL], { name: "availableEntities" })
  async getAvailableEntities(
    @Args("modelId") modelId: string,
  ): Promise<AvailableEntityGQL[]> {
    return this.semanticResolverService.getAvailableEntities(modelId) as any;
  }

  @Mutation(() => ParsedIntentGQL)
  async parseIntent(
    @Args("query") query: string,
    @Args("modelId", { nullable: true }) modelId?: string,
  ): Promise<ParsedIntentGQL> {
    return this.intentParserService.parseIntent(query, modelId) as any;
  }

  @Mutation(() => String)
  async resolveToExecutable(
    @Args("intentId") intentId: string,
    @Args("modelId") modelId: string,
  ): Promise<string> {
    const intents = this.intentParserService.getRecentIntents(50);
    const intent = intents.find((i) => i.id === intentId);
    if (!intent) {
      throw new Error(`Intent ${intentId} not found`);
    }
    return this.semanticResolverService.resolveToQuery(intent, modelId);
  }
}
