import { Resolver, Query, Mutation, Args, ID } from "@nestjs/graphql";
import {
  AgentSession as AgentSessionGQL,
  AgentTool as AgentToolGQL,
} from "../schema";
import { AgentService } from "../services/agent.service";

@Resolver()
export class AgentResolver {
  constructor(private readonly agentService: AgentService) {}

  @Query(() => AgentSessionGQL, { name: "agentSession", nullable: true })
  async getSession(
    @Args("id", { type: () => ID }) id: string,
  ): Promise<AgentSessionGQL | undefined> {
    return this.agentService.getSession(id) as any;
  }

  @Query(() => [AgentSessionGQL], { name: "agentSessions" })
  async listSessions(
    @Args("userId", { nullable: true }) userId?: string,
  ): Promise<AgentSessionGQL[]> {
    return this.agentService.listSessions(userId) as any;
  }

  @Query(() => [AgentToolGQL], { name: "agentTools" })
  async getTools(): Promise<AgentToolGQL[]> {
    return this.agentService.getTools() as any;
  }

  @Mutation(() => AgentSessionGQL)
  async createAgentSession(
    @Args("userId") userId: string,
  ): Promise<AgentSessionGQL> {
    return this.agentService.createSession(userId) as any;
  }

  @Mutation(() => AgentSessionGQL)
  async sendAgentMessage(
    @Args("sessionId") sessionId: string,
    @Args("content") content: string,
  ): Promise<AgentSessionGQL> {
    return this.agentService.sendMessage(sessionId, content) as any;
  }
}
