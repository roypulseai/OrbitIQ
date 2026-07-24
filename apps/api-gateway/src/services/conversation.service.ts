import { Injectable } from "@nestjs/common";

export interface ConversationMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  tokens?: number;
  timestamp: Date;
}

export interface ConversationContext {
  previousIntents: string[];
  activeFilters: string[];
  activeModels: string[];
  summary: string;
  tokenCount: number;
  maxTokens: number;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  messages: ConversationMessage[];
  context: ConversationContext;
  createdAt: Date;
  updatedAt: Date;
}

export interface SuggestedFollowUp {
  id: string;
  question: string;
  category: "drill_down" | "comparison" | "filter" | "visualization" | "explanation";
  relevance: number;
  basedOnMessageId: string;
}

@Injectable()
export class ConversationService {
  private conversations: Map<string, Conversation> = new Map();
  private followUps: Map<string, SuggestedFollowUp[]> = new Map();

  private readonly MAX_TOKENS = 8192;
  private readonly TRIM_THRESHOLD = 0.85;

  constructor() {
    this.seedConversations();
  }

  private generateId(prefix: string = "id"): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  private seedConversations(): void {
    const conv1: Conversation = {
      id: "conv-001",
      userId: "user-001",
      title: "Q1 Revenue Analysis",
      messages: [
        {
          id: "msg-001",
          role: "user",
          content: "What was our total revenue in Q1?",
          tokens: 9,
          timestamp: new Date("2026-07-24T09:00:00Z"),
        },
        {
          id: "msg-002",
          role: "assistant",
          content: "Total revenue for Q1 2026 was $2.4M, up 12% from Q4 2025. This growth was primarily driven by strong performance in the North American market and new enterprise contracts signed in February.",
          tokens: 42,
          timestamp: new Date("2026-07-24T09:00:03Z"),
        },
        {
          id: "msg-003",
          role: "user",
          content: "Which region contributed the most?",
          tokens: 8,
          timestamp: new Date("2026-07-24T09:01:00Z"),
        },
        {
          id: "msg-004",
          role: "assistant",
          content: "North America contributed $1.1M (46%), followed by EMEA at $890K (37%). APAC contributed $312K (13%) and Latin America $98K (4%). North America showed the strongest YoY growth at 18%.",
          tokens: 53,
          timestamp: new Date("2026-07-24T09:01:03Z"),
        },
      ],
      context: {
        previousIntents: ["revenue_query", "regional_breakdown"],
        activeFilters: ["quarter: Q1 2026", "metric: total_revenue"],
        activeModels: ["finance_model", "sales_model"],
        summary: "User exploring Q1 2026 revenue performance with regional breakdown. North America leads at 46%.",
        tokenCount: 112,
        maxTokens: 8192,
      },
      createdAt: new Date("2026-07-24T09:00:00Z"),
      updatedAt: new Date("2026-07-24T09:01:03Z"),
    };

    const conv2: Conversation = {
      id: "conv-002",
      userId: "user-001",
      title: "Customer Churn Investigation",
      messages: [
        {
          id: "msg-010",
          role: "user",
          content: "What's our current churn rate?",
          tokens: 8,
          timestamp: new Date("2026-07-24T08:30:00Z"),
        },
        {
          id: "msg-011",
          role: "assistant",
          content: "The current monthly churn rate is 4.2%, affecting 128 customers. This represents a slight increase from 3.8% last month. The MRR impact is approximately $48K/month.",
          tokens: 40,
          timestamp: new Date("2026-07-24T08:30:03Z"),
        },
        {
          id: "msg-012",
          role: "user",
          content: "Which customer segment has the highest churn?",
          tokens: 9,
          timestamp: new Date("2026-07-24T08:31:00Z"),
        },
        {
          id: "msg-013",
          role: "assistant",
          content: "Enterprise tier has the highest churn at 6.1%, mostly from customers with <3 months tenure. Mid-market follows at 3.9%, and SMB is lowest at 2.8%. The onboarding period appears to be the critical retention window.",
          tokens: 46,
          timestamp: new Date("2026-07-24T08:31:03Z"),
        },
      ],
      context: {
        previousIntents: ["churn_query", "segment_analysis"],
        activeFilters: ["metric: churn_rate"],
        activeModels: ["customer_model"],
        summary: "Investigating customer churn patterns. Enterprise tier with <3 month tenure shows highest churn.",
        tokenCount: 103,
        maxTokens: 8192,
      },
      createdAt: new Date("2026-07-24T08:30:00Z"),
      updatedAt: new Date("2026-07-24T08:31:03Z"),
    };

    this.conversations.set(conv1.id, conv1);
    this.conversations.set(conv2.id, conv2);

    this.followUps.set("msg-004", [
      {
        id: "fu-001",
        question: "Show Q1 breakdown by product",
        category: "drill_down",
        relevance: 0.95,
        basedOnMessageId: "msg-004",
      },
      {
        id: "fu-002",
        question: "Compare to Q1 2025",
        category: "comparison",
        relevance: 0.92,
        basedOnMessageId: "msg-004",
      },
      {
        id: "fu-003",
        question: "Show weekly trend within Q1",
        category: "visualization",
        relevance: 0.88,
        basedOnMessageId: "msg-004",
      },
      {
        id: "fu-004",
        question: "Export this revenue report",
        category: "visualization",
        relevance: 0.82,
        basedOnMessageId: "msg-004",
      },
    ]);

    this.followUps.set("msg-013", [
      {
        id: "fu-010",
        question: "Show churn trend over last 6 months",
        category: "visualization",
        relevance: 0.94,
        basedOnMessageId: "msg-013",
      },
      {
        id: "fu-011",
        question: "Compare churn by region",
        category: "comparison",
        relevance: 0.91,
        basedOnMessageId: "msg-013",
      },
      {
        id: "fu-012",
        question: "Identify at-risk accounts",
        category: "drill_down",
        relevance: 0.96,
        basedOnMessageId: "msg-013",
      },
      {
        id: "fu-013",
        question: "What factors correlate with churn?",
        category: "explanation",
        relevance: 0.89,
        basedOnMessageId: "msg-013",
      },
    ]);
  }

  createConversation(userId: string, initialMessage?: string): Conversation {
    const id = this.generateId("conv");
    const messages: ConversationMessage[] = [];

    if (initialMessage) {
      messages.push({
        id: this.generateId("msg"),
        role: "user",
        content: initialMessage,
        tokens: this.estimateTokens(initialMessage),
        timestamp: new Date(),
      });
    }

    const conversation: Conversation = {
      id,
      userId,
      title: initialMessage
        ? initialMessage.slice(0, 50) + (initialMessage.length > 50 ? "..." : "")
        : "New Conversation",
      messages,
      context: {
        previousIntents: [],
        activeFilters: [],
        activeModels: [],
        summary: "",
        tokenCount: messages.reduce((acc, m) => acc + (m.tokens || 0), 0),
        maxTokens: this.MAX_TOKENS,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.conversations.set(id, conversation);

    if (initialMessage) {
      this.addAssistantResponse(conversation, initialMessage);
    }

    return conversation;
  }

  sendMessage(conversationId: string, content: string): { conversation: Conversation; followUps: SuggestedFollowUp[] } {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    const userMsg: ConversationMessage = {
      id: this.generateId("msg"),
      role: "user",
      content,
      tokens: this.estimateTokens(content),
      timestamp: new Date(),
    };
    conversation.messages.push(userMsg);

    this.addAssistantResponse(conversation, content);

    this.trimContext(conversationId);
    conversation.updatedAt = new Date();

    const lastAssistant = conversation.messages.filter((m) => m.role === "assistant").pop();
    const followUps = lastAssistant
      ? this.generateFollowUps(conversation, lastAssistant.id)
      : [];

    return { conversation, followUps };
  }

  private addAssistantResponse(conversation: Conversation, userContent: string): void {
    const lower = userContent.toLowerCase();
    let response: string;
    let intents: string[] = [];

    if (lower.match(/revenue|income|sales/)) {
      response = "Based on the current data, I can see the revenue metrics you're interested in. The numbers show consistent growth across most segments. Would you like me to drill down into specific areas?";
      intents = ["revenue_query"];
    } else if (lower.match(/churn|retention|cancel/)) {
      response = "Looking at the churn data, there are some patterns worth noting. The retention metrics vary significantly by segment and tenure. Shall I break this down further?";
      intents = ["churn_query"];
    } else if (lower.match(/chart|graph|visual|plot/)) {
      response = "I can generate a visualization for that. What type of chart would work best for your analysis? I recommend a bar chart for comparisons or a line chart for trends.";
      intents = ["visualization_request"];
    } else if (lower.match(/compare|vs|versus/)) {
      response = "Here's the comparison you requested. The data shows meaningful differences between the entities you're comparing. Key insights are highlighted in the analysis.";
      intents = ["comparison_query"];
    } else {
      response = "I've analyzed your query. Let me know if you'd like me to explore any specific aspect in more detail or generate a visualization.";
      intents = ["general_query"];
    }

    const tokens = this.estimateTokens(response);
    conversation.context.previousIntents.push(...intents);
    conversation.context.tokenCount += tokens;

    const assistantMsg: ConversationMessage = {
      id: this.generateId("msg"),
      role: "assistant",
      content: response,
      tokens,
      timestamp: new Date(),
    };
    conversation.messages.push(assistantMsg);
  }

  getConversation(id: string): Conversation | undefined {
    return this.conversations.get(id);
  }

  listConversations(userId: string): Conversation[] {
    return Array.from(this.conversations.values())
      .filter((c) => c.userId === userId)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  getFollowUps(conversationId: string, messageId?: string): SuggestedFollowUp[] {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    if (messageId) {
      return this.followUps.get(messageId) || [];
    }

    const lastAssistant = conversation.messages.filter((m) => m.role === "assistant").pop();
    if (!lastAssistant) return [];

    return this.followUps.get(lastAssistant.id) || this.generateFollowUps(conversation, lastAssistant.id);
  }

  private generateFollowUps(conversation: Conversation, messageId: string): SuggestedFollowUp[] {
    const lastUser = conversation.messages.filter((m) => m.role === "user").pop();
    if (!lastUser) return [];

    const lower = lastUser.content.toLowerCase();
    let suggestions: { question: string; category: SuggestedFollowUp["category"] }[] = [];

    if (lower.match(/revenue|income|sales/)) {
      suggestions = [
        { question: "Compare revenue across regions", category: "comparison" },
        { question: "Show monthly trend", category: "visualization" },
        { question: "Break down by product category", category: "drill_down" },
        { question: "Export revenue data", category: "visualization" },
      ];
    } else if (lower.match(/customer|churn|retention/)) {
      suggestions = [
        { question: "Show customer churn rate", category: "drill_down" },
        { question: "Compare segments", category: "comparison" },
        { question: "Top 10 by LTV", category: "drill_down" },
        { question: "Show churn trend", category: "visualization" },
      ];
    } else if (lower.match(/chart|graph|visual/)) {
      suggestions = [
        { question: "Add time filter", category: "filter" },
        { question: "Export this chart", category: "visualization" },
        { question: "Add to dashboard", category: "visualization" },
        { question: "Explain the pattern", category: "explanation" },
      ];
    } else {
      suggestions = [
        { question: "Drill down into details", category: "drill_down" },
        { question: "Compare with previous period", category: "comparison" },
        { question: "Filter by region", category: "filter" },
        { question: "Show as chart", category: "visualization" },
      ];
    }

    const followUps: SuggestedFollowUp[] = suggestions.map((s, i) => ({
      id: this.generateId("fu"),
      question: s.question,
      category: s.category,
      relevance: 0.9 - i * 0.05,
      basedOnMessageId: messageId,
    }));

    this.followUps.set(messageId, followUps);
    return followUps;
  }

  getContextSummary(conversationId: string): ConversationContext {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }
    return conversation.context;
  }

  trimContext(conversationId: string): void {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) return;

    const limit = conversation.context.maxTokens * this.TRIM_THRESHOLD;
    if (conversation.context.tokenCount <= limit) return;

    while (
      conversation.messages.length > 4 &&
      conversation.context.tokenCount > limit
    ) {
      const removed = conversation.messages.shift();
      if (removed) {
        conversation.context.tokenCount -= removed.tokens || 0;
      }
    }
  }

  searchConversations(userId: string, query: string): Conversation[] {
    const lower = query.toLowerCase();
    return this.listConversations(userId).filter(
      (c) =>
        c.title.toLowerCase().includes(lower) ||
        c.messages.some((m) => m.content.toLowerCase().includes(lower)) ||
        c.context.summary.toLowerCase().includes(lower),
    );
  }
}
