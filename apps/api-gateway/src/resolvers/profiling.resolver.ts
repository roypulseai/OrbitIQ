import { Resolver, Query, Mutation, Args, ID } from "@nestjs/graphql";
import { ProfilingJob, TableProfile, ColumnProfile, StartProfilingInput } from "../schema";
import { ProfilingService } from "../services/profiling.service";

@Resolver()
export class ProfilingResolver {
  constructor(private readonly profilingService: ProfilingService) {}

  @Query(() => [ProfilingJob], { name: "profilingJobs" })
  async getProfilingJobs(
    @Args("connectionId", { nullable: true }) connectionId?: string
  ): Promise<ProfilingJob[]> {
    return this.profilingService.listJobs(connectionId) as any;
  }

  @Query(() => ProfilingJob, { name: "profilingJob" })
  async getProfilingJob(
    @Args("id", { type: () => ID }) id: string
  ): Promise<ProfilingJob> {
    return this.profilingService.getJob(id) as any;
  }

  @Query(() => TableProfile, { name: "tableProfile" })
  async getTableProfile(
    @Args("jobId") jobId: string,
    @Args("tableId") tableId: string
  ): Promise<TableProfile> {
    return this.profilingService.getTableProfile(jobId, tableId) as any;
  }

  @Query(() => ColumnProfile, { name: "columnProfile" })
  async getColumnProfile(
    @Args("jobId") jobId: string,
    @Args("tableId") tableId: string,
    @Args("columnName") columnName: string
  ): Promise<ColumnProfile> {
    return this.profilingService.getColumnProfile(jobId, tableId, columnName) as any;
  }

  @Query(() => String, { name: "profilingStats" })
  async getProfilingStats(
    @Args("connectionId", { nullable: true }) connectionId?: string
  ): Promise<string> {
    const stats = this.profilingService.getProfilingStats(connectionId);
    return JSON.stringify(stats);
  }

  @Mutation(() => ProfilingJob)
  async startProfiling(
    @Args("input") input: StartProfilingInput
  ): Promise<ProfilingJob> {
    return this.profilingService.startProfiling(input.connectionId, input.tableIds) as any;
  }
}
