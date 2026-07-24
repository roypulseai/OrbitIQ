import { Resolver, Query, Mutation, Args, ID, Float, Int } from "@nestjs/graphql";
import {
  HypothesisTest as HypothesisTestGQL,
  TestResultGQL as TestResultGQL,
  Experiment as ExperimentGQL,
  Variant as VariantGQL,
  ExperimentResult as ExperimentResultGQL,
} from "../schema";
import { HypothesisService } from "../services/hypothesis.service";

@Resolver()
export class HypothesisResolver {
  constructor(private readonly hypothesisService: HypothesisService) {}

  @Query(() => HypothesisTestGQL, { name: "hypothesisTest", nullable: true })
  async getTest(
    @Args("id", { type: () => ID }) id: string,
  ): Promise<HypothesisTestGQL | null> {
    return (this.hypothesisService.getTest(id) as any) || null;
  }

  @Query(() => [HypothesisTestGQL], { name: "hypothesisTests" })
  async listTests(): Promise<HypothesisTestGQL[]> {
    return this.hypothesisService.listTests() as any;
  }

  @Query(() => ExperimentGQL, { name: "experiment", nullable: true })
  async getExperiment(
    @Args("id", { type: () => ID }) id: string,
  ): Promise<ExperimentGQL | null> {
    return (this.hypothesisService.getExperiment(id) as any) || null;
  }

  @Query(() => [ExperimentGQL], { name: "experiments" })
  async listExperiments(): Promise<ExperimentGQL[]> {
    return this.hypothesisService.listExperiments() as any;
  }

  @Query(() => String, { name: "autoSelectTest" })
  async autoSelectTest(
    @Args("variable1") variable1: string,
    @Args("variable2", { nullable: true }) variable2?: string,
  ): Promise<string> {
    return this.hypothesisService.autoSelectTest(variable1, variable2);
  }

  @Mutation(() => HypothesisTestGQL)
  async createHypothesisTest(
    @Args("name") name: string,
    @Args("testType") testType: string,
    @Args("variable1") variable1: string,
    @Args("variable2", { nullable: true }) variable2?: string,
    @Args("significanceLevel", { type: () => Float, nullable: true }) significanceLevel?: number,
  ): Promise<HypothesisTestGQL> {
    return this.hypothesisService.createTest({
      name,
      testType: testType as any,
      variable1,
      variable2,
      significanceLevel,
    }) as any;
  }

  @Mutation(() => ExperimentGQL)
  async createExperiment(
    @Args("name") name: string,
    @Args("hypothesis") hypothesis: string,
    @Args("experimentType") experimentType: string,
    @Args("targetMetric") targetMetric: string,
    @Args("sampleSize", { type: () => Int }) sampleSize: number,
    @Args("duration", { type: () => Int }) duration: number,
  ): Promise<ExperimentGQL> {
    return this.hypothesisService.createExperiment({
      name,
      hypothesis,
      experimentType: experimentType as any,
      targetMetric,
      sampleSize,
      duration,
      variants: [
        { name: "Control", description: "Original version", trafficPercentage: 50 },
        { name: "Variant", description: "New version", trafficPercentage: 50 },
      ],
    }) as any;
  }

  @Mutation(() => ExperimentGQL, { nullable: true })
  async updateExperimentStatus(
    @Args("id", { type: () => ID }) id: string,
    @Args("status") status: string,
  ): Promise<ExperimentGQL | null> {
    return this.hypothesisService.updateExperimentStatus(id, status as any) as any;
  }

  @Mutation(() => Float)
  async calculatePower(
    @Args("sampleSize", { type: () => Int }) sampleSize: number,
    @Args("effectSize", { type: () => Float }) effectSize: number,
    @Args("significanceLevel", { type: () => Float }) significanceLevel: number,
  ): Promise<number> {
    return this.hypothesisService.calculatePower({ sampleSize, effectSize, significanceLevel });
  }
}
