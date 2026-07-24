import { Resolver, Query, Mutation, Args, ID } from "@nestjs/graphql";
import {
  Conversation as ConversationGQL,
  SuggestedFollowUp as SuggestedFollowUpGQL,
  ConversationContext as ConversationContextGQL,
} from "../schema";
import { ConversationService } from "../services/conversation.service";

@Resolver()
export class ConversationResolver {
  constructor(private readonly conversationService: ConversationService) {}

  @Query(() => ConversationGQL, { name: "conversation", nullable: true })
  async getConversation(
    @Args("id", { type: () => ID }) id: string,
  ): Promise<ConversationGQL | undefined> {
    return this.conversationService.getConversation(id) as any;
  }

  @Query(() => [ConversationGQL], { name: "conversations" })
  async listConversations(
    @Args("userId") userId: string,
  ): Promise<ConversationGQL[]> {
    return this.conversationService.listConversations(userId) as any;
  }

  @Query(() => [SuggestedFollowUpGQL], { name: "conversationFollowUps" })
  async getFollowUps(
    @Args("conversationId") conversationId: string,
    @Args("messageId", { nullable: true }) messageId?: string,
  ): Promise<SuggestedFollowUpGQL[]> {
    return this.conversationService.getFollowUps(conversationId, messageId) as any;
  }

  @Query(() => ConversationContextGQL, { name: "conversationContext" })
  async getContext(
    @Args("conversationId") conversationId: string,
  ): Promise<ConversationContextGQL> {
    return this.conversationService.getContextSummary(conversationId) as any;
  }

  @Query(() => [ConversationGQL], { name: "searchConversations" })
  async searchConversations(
    @Args("userId") userId: string,
    @Args("query") query: string,
  ): Promise<ConversationGQL[]> {
    return this.conversationService.searchConversations(userId, query) as any;
  }

  @Mutation(() => ConversationGQL)
  async createConversation(
    @Args("userId") userId: string,
    @Args("initialMessage", { nullable: true }) initialMessage?: string,
  ): Promise<ConversationGQL> {
    return this.conversationService.createConversation(userId, initialMessage) as any;
  }

  @Mutation(() => ConversationGQL)
  async sendConversationMessage(
    @Args("conversationId") conversationId: string,
    @Args("content") content: string,
  ): Promise<ConversationGQL> {
    const result = this.conversationService.sendMessage(conversationId, content);
    return result.conversation as any;
  }
}
