import { Injectable } from "@nestjs/common";

export interface AIModel {
  id: string;
  providerId: string;
  name: string;
  displayName: string;
  maxTokens: number;
  costPer1kInput: number;
  costPer1kOutput: number;
  supportsStreaming: boolean;
  supportsVision: boolean;
  contextWindow: number;
}

export interface AIProvider {
  id: string;
  name: string;
  displayName: string;
  apiKey?: string;
  baseUrl?: string;
  defaultModel?: string;
  isActive: boolean;
  models: AIModel[];
  createdAt: Date;
  updatedAt?: Date;
}

export interface AIRequest {
  id: string;
  providerId: string;
  model: string;
  prompt: string;
  systemPrompt?: string;
  response?: string;
  tokensUsed?: number;
  latencyMs?: number;
  cost?: number;
  status: "pending" | "completed" | "failed";
  createdAt: Date;
}

export interface ModelConfig {
  defaultProviderId?: string;
  defaultModelId?: string;
  temperature: number;
  maxTokens: number;
  systemPrompt?: string;
}

@Injectable()
export class ModelGatewayService {
  private providers: Map<string, AIProvider> = new Map();
  private requests: Map<string, AIRequest> = new Map();
  private config: ModelConfig = {
    defaultProviderId: "provider-openai",
    defaultModelId: "gpt-4o",
    temperature: 0.7,
    maxTokens: 4096,
    systemPrompt: "You are a helpful data analytics assistant.",
  };

  constructor() {
    this.seedData();
  }

  private seedData(): void {
    const openaiModels: AIModel[] = [
      {
        id: "gpt-4o",
        providerId: "provider-openai",
        name: "gpt-4o",
        displayName: "GPT-4o",
        maxTokens: 128000,
        costPer1kInput: 0.005,
        costPer1kOutput: 0.015,
        supportsStreaming: true,
        supportsVision: true,
        contextWindow: 128000,
      },
      {
        id: "gpt-4o-mini",
        providerId: "provider-openai",
        name: "gpt-4o-mini",
        displayName: "GPT-4o Mini",
        maxTokens: 128000,
        costPer1kInput: 0.00015,
        costPer1kOutput: 0.0006,
        supportsStreaming: true,
        supportsVision: true,
        contextWindow: 128000,
      },
      {
        id: "gpt-3.5-turbo",
        providerId: "provider-openai",
        name: "gpt-3.5-turbo",
        displayName: "GPT-3.5 Turbo",
        maxTokens: 16385,
        costPer1kInput: 0.0005,
        costPer1kOutput: 0.0015,
        supportsStreaming: true,
        supportsVision: false,
        contextWindow: 16385,
      },
    ];

    const anthropicModels: AIModel[] = [
      {
        id: "claude-sonnet-4-20250514",
        providerId: "provider-anthropic",
        name: "claude-sonnet-4-20250514",
        displayName: "Claude Sonnet 4",
        maxTokens: 8192,
        costPer1kInput: 0.003,
        costPer1kOutput: 0.015,
        supportsStreaming: true,
        supportsVision: true,
        contextWindow: 200000,
      },
      {
        id: "claude-3-haiku-20240307",
        providerId: "provider-anthropic",
        name: "claude-3-haiku-20240307",
        displayName: "Claude 3 Haiku",
        maxTokens: 4096,
        costPer1kInput: 0.00025,
        costPer1kOutput: 0.00125,
        supportsStreaming: true,
        supportsVision: false,
        contextWindow: 200000,
      },
    ];

    const ollamaModels: AIModel[] = [
      {
        id: "llama3",
        providerId: "provider-ollama",
        name: "llama3",
        displayName: "Llama 3",
        maxTokens: 8192,
        costPer1kInput: 0,
        costPer1kOutput: 0,
        supportsStreaming: true,
        supportsVision: false,
        contextWindow: 8192,
      },
    ];

    this.providers.set("provider-openai", {
      id: "provider-openai",
      name: "openai",
      displayName: "OpenAI",
      apiKey: "sk-***abc123",
      baseUrl: "https://api.openai.com/v1",
      defaultModel: "gpt-4o",
      isActive: true,
      models: openaiModels,
      createdAt: new Date("2025-01-15"),
      updatedAt: new Date("2025-06-10"),
    });

    this.providers.set("provider-anthropic", {
      id: "provider-anthropic",
      name: "anthropic",
      displayName: "Anthropic",
      apiKey: "sk-ant-***xyz789",
      baseUrl: "https://api.anthropic.com/v1",
      defaultModel: "claude-sonnet-4-20250514",
      isActive: true,
      models: anthropicModels,
      createdAt: new Date("2025-02-20"),
      updatedAt: new Date("2025-05-28"),
    });

    this.providers.set("provider-ollama", {
      id: "provider-ollama",
      name: "ollama",
      displayName: "Ollama (Local)",
      baseUrl: "http://localhost:11434",
      defaultModel: "llama3",
      isActive: true,
      models: ollamaModels,
      createdAt: new Date("2025-03-10"),
    });

    const now = new Date();
    const mockRequests: Omit<AIRequest, "id">[] = [
      {
        providerId: "provider-openai",
        model: "gpt-4o",
        prompt: "Explain the difference between star and snowflake schemas in data warehousing.",
        systemPrompt: "You are a data architecture expert.",
        response:
          "A star schema uses a single central fact table surrounded by dimension tables, creating a star-like structure. It's denormalized for query performance. A snowflake schema normalizes dimension tables into sub-dimensions, reducing storage but increasing join complexity.",
        tokensUsed: 245,
        latencyMs: 1230,
        cost: 0.00245,
        status: "completed",
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      },
      {
        providerId: "provider-anthropic",
        model: "claude-sonnet-4-20250514",
        prompt: "Generate a SQL query to find the top 10 customers by revenue in the last quarter.",
        systemPrompt: "You are a SQL expert.",
        response:
          "SELECT c.customer_id, c.name, SUM(o.amount) AS total_revenue FROM customers c JOIN orders o ON c.customer_id = o.customer_id WHERE o.order_date >= DATE_TRUNC('quarter', CURRENT_DATE - INTERVAL '1 quarter') GROUP BY c.customer_id, c.name ORDER BY total_revenue DESC LIMIT 10;",
        tokensUsed: 189,
        latencyMs: 980,
        cost: 0.00189,
        status: "completed",
        createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000),
      },
      {
        providerId: "provider-openai",
        model: "gpt-4o-mini",
        prompt: "Summarize the key metrics from this sales report data.",
        response:
          "Key metrics: Total revenue increased 12% QoQ to $4.2M. Customer acquisition cost dropped 8%. Churn rate improved from 5.2% to 4.1%. Top performing region: APAC with 18% growth.",
        tokensUsed: 156,
        latencyMs: 650,
        cost: 0.000156,
        status: "completed",
        createdAt: new Date(now.getTime() - 8 * 60 * 60 * 1000),
      },
      {
        providerId: "provider-ollama",
        model: "llama3",
        prompt: "What are best practices for indexing PostgreSQL databases?",
        response:
          "Key PostgreSQL indexing best practices: 1) Create indexes on columns used in WHERE and JOIN clauses. 2) Use partial indexes for frequently filtered subsets. 3) Consider BRIN indexes for large sequential data. 4) Monitor with pg_stat_user_indexes. 5) Avoid over-indexing as it slows writes.",
        tokensUsed: 201,
        latencyMs: 3450,
        cost: 0,
        status: "completed",
        createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000),
      },
      {
        providerId: "provider-openai",
        model: "gpt-4o",
        prompt: "Help me design a real-time dashboard for monitoring API performance.",
        systemPrompt: "You are a dashboard design expert.",
        tokensUsed: undefined,
        latencyMs: undefined,
        cost: undefined,
        status: "failed",
        response: undefined,
        createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      },
    ];

    mockRequests.forEach((req) => {
      const id = `req-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      this.requests.set(id, { id, ...req });
    });
  }

  getProviders(): AIProvider[] {
    return Array.from(this.providers.values());
  }

  getProvider(id: string): AIProvider | undefined {
    return this.providers.get(id);
  }

  createProvider(input: Omit<AIProvider, "id" | "createdAt" | "updatedAt" | "models"> & { models?: AIModel[] }): AIProvider {
    const id = `provider-${Date.now()}`;
    const provider: AIProvider = {
      id,
      models: input.models || [],
      createdAt: new Date(),
      ...input,
    };
    this.providers.set(id, provider);
    return provider;
  }

  updateProvider(id: string, updates: Partial<AIProvider>): AIProvider | undefined {
    const existing = this.providers.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.providers.set(id, updated);
    return updated;
  }

  deleteProvider(id: string): boolean {
    return this.providers.delete(id);
  }

  async testConnection(providerId: string): Promise<{ success: boolean; message: string; latencyMs: number }> {
    const provider = this.providers.get(providerId);
    if (!provider) {
      return { success: false, message: "Provider not found", latencyMs: 0 };
    }
    const start = Date.now();
    await new Promise((r) => setTimeout(r, 300 + Math.random() * 700));
    const latencyMs = Date.now() - start;
    return {
      success: provider.isActive,
      message: provider.isActive
        ? `Successfully connected to ${provider.displayName}`
        : `${provider.displayName} is inactive`,
      latencyMs,
    };
  }

  async sendPrompt(
    providerId: string,
    model: string,
    prompt: string,
    options?: { systemPrompt?: string; maxTokens?: number; temperature?: number }
  ): Promise<AIRequest> {
    const id = `req-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const request: AIRequest = {
      id,
      providerId,
      model,
      prompt,
      systemPrompt: options?.systemPrompt,
      status: "pending",
      createdAt: new Date(),
    };
    this.requests.set(id, request);

    await new Promise((r) => setTimeout(r, 500 + Math.random() * 1500));

    const provider = this.providers.get(providerId);
    const maxTok = options?.maxTokens || 1024;
    const tokensUsed = Math.floor(50 + Math.random() * (maxTok - 50));
    const latencyMs = Math.floor(400 + Math.random() * 2000);

    let cost = 0;
    if (provider) {
      const modelDef = provider.models.find((m) => m.name === model);
      if (modelDef) {
        cost =
          (tokensUsed * modelDef.costPer1kInput) / 1000 +
          (tokensUsed * modelDef.costPer1kOutput) / 1000;
      }
    }

    const mockResponse =
      `This is a simulated response from ${model} (${provider?.displayName || "unknown provider"}).\n\n` +
      `Your prompt was: "${prompt.substring(0, 100)}${prompt.length > 100 ? "..." : ""}"\n\n` +
      `In a production setup, this would be the actual AI-generated content. ` +
      `The model processed ${tokensUsed} tokens in ${latencyMs}ms.`;

    const updated: AIRequest = {
      ...request,
      response: mockResponse,
      tokensUsed,
      latencyMs,
      cost: Math.round(cost * 10000) / 10000,
      status: "completed",
    };
    this.requests.set(id, updated);
    return updated;
  }

  getRequestHistory(providerId?: string): AIRequest[] {
    const all = Array.from(this.requests.values());
    if (providerId) {
      return all.filter((r) => r.providerId === providerId);
    }
    return all.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  getRequest(id: string): AIRequest | undefined {
    return this.requests.get(id);
  }

  getConfig(): ModelConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<ModelConfig>): ModelConfig {
    this.config = { ...this.config, ...updates };
    return { ...this.config };
  }

  getCostSummary(
    providerId?: string,
    dateRange?: { start: Date; end: Date }
  ): { totalCost: number; totalRequests: number; totalTokens: number } {
    let reqs = Array.from(this.requests.values());
    if (providerId) {
      reqs = reqs.filter((r) => r.providerId === providerId);
    }
    if (dateRange) {
      reqs = reqs.filter(
        (r) => r.createdAt >= dateRange.start && r.createdAt <= dateRange.end
      );
    }
    return {
      totalCost: reqs.reduce((sum, r) => sum + (r.cost || 0), 0),
      totalRequests: reqs.length,
      totalTokens: reqs.reduce((sum, r) => sum + (r.tokensUsed || 0), 0),
    };
  }
}
