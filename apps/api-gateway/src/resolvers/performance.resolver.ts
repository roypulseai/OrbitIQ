import { Resolver, Query, Mutation, Args, ID } from "@nestjs/graphql";
import { PerformanceService } from "../services/performance.service";
import {
  AggregateTableGQL,
  CDCPipelineGQL,
  StreamingSourceGQL,
  LoadTestGQL,
  PerformanceDashboard,
} from "../schema";

@Resolver()
export class PerformanceResolver {
  constructor(private performanceService: PerformanceService) {}

  @Query(() => [AggregateTableGQL])
  aggregateTables() {
    return this.performanceService.getAggregateTables();
  }

  @Query(() => AggregateTableGQL, { nullable: true })
  aggregateTable(@Args("id", { type: () => ID }) id: string) {
    return this.performanceService.getAggregateTable(id);
  }

  @Query(() => [CDCPipelineGQL])
  cdcPipelines() {
    return this.performanceService.getCDCPipelines();
  }

  @Query(() => CDCPipelineGQL, { nullable: true })
  cdcPipeline(@Args("id", { type: () => ID }) id: string) {
    return this.performanceService.getCDCPipeline(id);
  }

  @Query(() => [StreamingSourceGQL])
  streamingSources() {
    return this.performanceService.getStreamingSources();
  }

  @Query(() => [LoadTestGQL])
  loadTests() {
    return this.performanceService.getLoadTests();
  }

  @Query(() => LoadTestGQL, { nullable: true })
  loadTest(@Args("id", { type: () => ID }) id: string) {
    return this.performanceService.getLoadTest(id);
  }

  @Query(() => PerformanceDashboard)
  performanceDashboard() {
    return this.performanceService.getPerformanceDashboard();
  }

  @Mutation(() => AggregateTableGQL, { nullable: true })
  refreshAggregate(@Args("id", { type: () => ID }) id: string) {
    return this.performanceService.refreshAggregate(id);
  }

  @Mutation(() => CDCPipelineGQL, { nullable: true })
  pauseCDC(@Args("id", { type: () => ID }) id: string) {
    return this.performanceService.pauseCDC(id);
  }
}
