import { Resolver, Query, Mutation, Args, ID, Int, Float } from "@nestjs/graphql";
import {
  ForecastJob as ForecastJobGQL,
  ForecastMetrics as ForecastMetricsGQL,
  ForecastResult as ForecastResultGQL,
  ModelComparison as ModelComparisonGQL,
  ForecastConfigInput,
} from "../schema";
import { AnalyticsService } from "../services/analytics.service";

@Resolver()
export class AnalyticsResolver {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Query(() => ForecastJobGQL, { name: "forecastJob", nullable: true })
  async getForecastJob(
    @Args("id", { type: () => ID }) id: string,
  ): Promise<ForecastJobGQL | null> {
    return (this.analyticsService.getJob(id) as any) || null;
  }

  @Query(() => [ForecastJobGQL], { name: "forecastJobs" })
  async getForecastJobs(): Promise<ForecastJobGQL[]> {
    return this.analyticsService.listJobs() as any;
  }

  @Query(() => [ModelComparisonGQL], { name: "modelComparison" })
  async getModelComparison(
    @Args("dataSource") dataSource: string,
    @Args("targetColumn") targetColumn: string,
  ): Promise<ModelComparisonGQL[]> {
    return this.analyticsService.getModelComparison(dataSource, targetColumn) as any;
  }

  @Mutation(() => ForecastJobGQL)
  async createForecast(
    @Args("config") config: ForecastConfigInput,
  ): Promise<ForecastJobGQL> {
    return this.analyticsService.createForecast(config) as any;
  }

  @Mutation(() => ForecastJobGQL, { nullable: true })
  async cancelForecastJob(
    @Args("id", { type: () => ID }) id: string,
  ): Promise<ForecastJobGQL | null> {
    return this.analyticsService.cancelJob(id) as any;
  }
}
