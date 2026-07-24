"use client";

import { useState } from "react";
import { Button } from "@orbitiq/design-system";
import {
  Bot,
  Plus,
  Zap,
  DollarSign,
  Send,
  TestTube,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
} from "lucide-react";

interface AIModel {
  id: string;
  name: string;
  displayName: string;
  maxTokens: number;
  costPer1kInput: number;
  costPer1kOutput: number;
  supportsStreaming: boolean;
  supportsVision: boolean;
  contextWindow: number;
}

interface AIProvider {
  id: string;
  name: string;
  displayName: string;
  apiKey?: string;
  baseUrl?: string;
  defaultModel?: string;
  isActive: boolean;
  models: AIModel[];
  requestsThisMonth: number;
  totalCost: number;
}

interface AIRequest {
  id: string;
  providerId: string;
  model: string;
  prompt: string;
  response?: string;
  tokensUsed?: number;
  latencyMs?: number;
  cost?: number;
  status: "pending" | "completed" | "failed";
  createdAt: string;
}

const PROVIDER_COLORS: Record<string, string> = {
  openai: "from-green-500 to-emerald-600",
  anthropic: "from-orange-500 to-amber-600",
  ollama: "from-purple-500 to-violet-600",
};

const PROVIDER_ICONS: Record<string, string> = {
  openai: "O",
  anthropic: "A",
  ollama: "L",
};

const DEMO_PROVIDERS: AIProvider[] = [
  {
    id: "provider-openai",
    name: "openai",
    displayName: "OpenAI",
    apiKey: "sk-***abc123",
    baseUrl: "https://api.openai.com/v1",
    defaultModel: "gpt-4o",
    isActive: true,
    requestsThisMonth: 1247,
    totalCost: 34.82,
    models: [
      { id: "gpt-4o", name: "gpt-4o", displayName: "GPT-4o", maxTokens: 128000, costPer1kInput: 0.005, costPer1kOutput: 0.015, supportsStreaming: true, supportsVision: true, contextWindow: 128000 },
      { id: "gpt-4o-mini", name: "gpt-4o-mini", displayName: "GPT-4o Mini", maxTokens: 128000, costPer1kInput: 0.00015, costPer1kOutput: 0.0006, supportsStreaming: true, supportsVision: true, contextWindow: 128000 },
      { id: "gpt-3.5-turbo", name: "gpt-3.5-turbo", displayName: "GPT-3.5 Turbo", maxTokens: 16385, costPer1kInput: 0.0005, costPer1kOutput: 0.0015, supportsStreaming: true, supportsVision: false, contextWindow: 16385 },
    ],
  },
  {
    id: "provider-anthropic",
    name: "anthropic",
    displayName: "Anthropic",
    apiKey: "sk-ant-***xyz789",
    baseUrl: "https://api.anthropic.com/v1",
    defaultModel: "claude-sonnet-4-20250514",
    isActive: true,
    requestsThisMonth: 834,
    totalCost: 21.56,
    models: [
      { id: "claude-sonnet-4-20250514", name: "claude-sonnet-4-20250514", displayName: "Claude Sonnet 4", maxTokens: 8192, costPer1kInput: 0.003, costPer1kOutput: 0.015, supportsStreaming: true, supportsVision: true, contextWindow: 200000 },
      { id: "claude-3-haiku-20240307", name: "claude-3-haiku-20240307", displayName: "Claude 3 Haiku", maxTokens: 4096, costPer1kInput: 0.00025, costPer1kOutput: 0.00125, supportsStreaming: true, supportsVision: false, contextWindow: 200000 },
    ],
  },
  {
    id: "provider-ollama",
    name: "ollama",
    displayName: "Ollama (Local)",
    baseUrl: "http://localhost:11434",
    defaultModel: "llama3",
    isActive: true,
    requestsThisMonth: 156,
    totalCost: 0,
    models: [
      { id: "llama3", name: "llama3", displayName: "Llama 3", maxTokens: 8192, costPer1kInput: 0, costPer1kOutput: 0, supportsStreaming: true, supportsVision: false, contextWindow: 8192 },
    ],
  },
];

const DEMO_REQUESTS: AIRequest[] = [
  { id: "req-1", providerId: "provider-openai", model: "gpt-4o", prompt: "Explain the difference between star and snowflake schemas in data warehousing.", tokensUsed: 245, latencyMs: 1230, cost: 0.00245, status: "completed", createdAt: "2 hours ago" },
  { id: "req-2", providerId: "provider-anthropic", model: "claude-sonnet-4-20250514", prompt: "Generate a SQL query to find the top 10 customers by revenue in the last quarter.", tokensUsed: 189, latencyMs: 980, cost: 0.00189, status: "completed", createdAt: "5 hours ago" },
  { id: "req-3", providerId: "provider-openai", model: "gpt-4o-mini", prompt: "Summarize the key metrics from this sales report data.", tokensUsed: 156, latencyMs: 650, cost: 0.000156, status: "completed", createdAt: "8 hours ago" },
  { id: "req-4", providerId: "provider-ollama", model: "llama3", prompt: "What are best practices for indexing PostgreSQL databases?", tokensUsed: 201, latencyMs: 3450, cost: 0, status: "completed", createdAt: "12 hours ago" },
  { id: "req-5", providerId: "provider-openai", model: "gpt-4o", prompt: "Help me design a real-time dashboard for monitoring API performance.", status: "failed", createdAt: "1 day ago" },
];

export default function ModelGatewayPage() {
  const [providers, setProviders] = useState<AIProvider[]>(DEMO_PROVIDERS);
  const [requests] = useState<AIRequest[]>(DEMO_REQUESTS);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("gpt-4o");
  const [prompt, setPrompt] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("You are a helpful data analytics assistant.");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(4096);
  const [sending, setSending] = useState(false);
  const [response, setResponse] = useState("");
  const [testingId, setTestingId] = useState<string | null>(null);
  const [expandedProvider, setExpandedProvider] = useState<string | null>(null);
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});

  const totalCost = providers.reduce((s, p) => s + p.totalCost, 0);
  const totalRequests = providers.reduce((s, p) => s + p.requestsThisMonth, 0);

  const handleSend = () => {
    if (!prompt.trim()) return;
    setSending(true);
    setResponse("");
    setTimeout(() => {
      setSending(false);
      setResponse(
        `This is a simulated response from **${selectedModel}**.\n\n` +
        `Your prompt was:\n> ${prompt.substring(0, 200)}${prompt.length > 200 ? "..." : ""}\n\n` +
        `In a production setup, this would be the actual AI-generated content. ` +
        `The model processed approximately 156 tokens in 890ms.\n\n` +
        `**Settings used:**\n- Temperature: ${temperature}\n- Max tokens: ${maxTokens}\n- System prompt: ${systemPrompt.substring(0, 80)}...`
      );
    }, 1500 + Math.random() * 1000);
  };

  const handleTest = (providerId: string) => {
    setTestingId(providerId);
    setTimeout(() => setTestingId(null), 1200 + Math.random() * 800);
  };

  const toggleProvider = (providerId: string) => {
    setProviders((prev) =>
      prev.map((p) => (p.id === providerId ? { ...p, isActive: !p.isActive } : p))
    );
  };

  return (
    <div className="page-content animate-fade-in">
      {/* Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Model Gateway</h1>
              <p className="text-sm text-muted mt-0.5">Configure and manage your AI provider connections</p>
            </div>
          </div>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="w-4 h-4" /> Add Provider
        </Button>
      </div>

      {/* Add Provider Form */}
      {showAddForm && (
        <div className="surface-card p-5 mb-6 animate-slide-down">
          <h3 className="text-sm font-semibold text-white mb-4">New AI Provider</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs text-muted mb-1.5">Provider Type</label>
              <select className="input-dark">
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
                <option value="google">Google AI</option>
                <option value="azure_openai">Azure OpenAI</option>
                <option value="ollama">Ollama (Local)</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted mb-1.5">Display Name</label>
              <input className="input-dark" placeholder="My OpenAI" />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1.5">API Key</label>
              <input className="input-dark" placeholder="sk-..." type="password" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-muted mb-1.5">Base URL</label>
              <input className="input-dark" placeholder="https://api.openai.com/v1" />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1.5">Default Model</label>
              <input className="input-dark" placeholder="gpt-4o" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setShowAddForm(false)}>Save Provider</Button>
            <Button variant="secondary" onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Provider Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        {providers.map((provider) => (
          <div
            key={provider.id}
            className="surface-card p-5 hover:border-border-strong transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg bg-gradient-to-br ${
                    PROVIDER_COLORS[provider.name] || "from-gray-500 to-gray-600"
                  } flex items-center justify-center text-white font-bold text-sm`}
                >
                  {PROVIDER_ICONS[provider.name] || "?"}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">{provider.displayName}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        provider.isActive ? "bg-success" : "bg-surface-6"
                      }`}
                    />
                    <span className="text-xs text-muted">
                      {provider.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => toggleProvider(provider.id)}
                className={`w-9 h-5 rounded-full transition-colors relative ${
                  provider.isActive ? "bg-accent" : "bg-surface-4"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                    provider.isActive ? "left-[18px]" : "left-0.5"
                  }`}
                />
              </button>
            </div>

            {/* Models */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {provider.models.map((model) => (
                <span
                  key={model.id}
                  className="px-2 py-0.5 text-[11px] font-medium bg-surface-3 text-muted rounded-md border border-border"
                >
                  {model.displayName}
                </span>
              ))}
            </div>

            {/* API Key */}
            {provider.apiKey && (
              <div className="flex items-center gap-2 mb-3 text-xs text-muted">
                <span className="font-mono">
                  {showApiKeys[provider.id] ? provider.apiKey : provider.apiKey}
                </span>
                <button
                  onClick={() =>
                    setShowApiKeys((prev) => ({
                      ...prev,
                      [provider.id]: !prev[provider.id],
                    }))
                  }
                  className="hover:text-white transition-colors"
                >
                  {showApiKeys[provider.id] ? (
                    <EyeOff className="w-3 h-3" />
                  ) : (
                    <Eye className="w-3 h-3" />
                  )}
                </button>
              </div>
            )}

            {/* Base URL */}
            {provider.baseUrl && (
              <div className="text-xs text-muted font-mono mb-3">{provider.baseUrl}</div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4 pt-3 border-t border-border">
              <div>
                <div className="text-xs text-muted">Requests (30d)</div>
                <div className="text-sm font-semibold text-white">
                  {provider.requestsThisMonth.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted">Total Cost</div>
                <div className="text-sm font-semibold text-white">
                  ${provider.totalCost.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-3 border-t border-border">
              <button
                onClick={() => handleTest(provider.id)}
                disabled={testingId === provider.id}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted hover:text-white bg-surface-3 hover:bg-surface-4 rounded-md transition-colors disabled:opacity-50"
              >
                {testingId === provider.id ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <TestTube className="w-3 h-3" />
                )}
                Test
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted hover:text-white bg-surface-3 hover:bg-surface-4 rounded-md transition-colors">
                <Pencil className="w-3 h-3" /> Edit
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-danger hover:text-red-400 bg-surface-3 hover:bg-surface-4 rounded-md transition-colors ml-auto">
                <Trash2 className="w-3 h-3" /> Delete
              </button>
            </div>

            {/* Expanded Models */}
            <button
              onClick={() =>
                setExpandedProvider(expandedProvider === provider.id ? null : provider.id)
              }
              className="flex items-center gap-1 text-xs text-muted hover:text-white mt-3 transition-colors"
            >
              {expandedProvider === provider.id ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
              {provider.models.length} model{provider.models.length !== 1 ? "s" : ""}
            </button>
            {expandedProvider === provider.id && (
              <div className="mt-2 space-y-2">
                {provider.models.map((model) => (
                  <div
                    key={model.id}
                    className="p-2 bg-surface-3 rounded-md text-xs space-y-1"
                  >
                    <div className="font-medium text-white">{model.displayName}</div>
                    <div className="text-muted">
                      Context: {(model.contextWindow / 1000).toFixed(0)}K | Max:{" "}
                      {(model.maxTokens / 1000).toFixed(0)}K
                    </div>
                    <div className="text-muted">
                      ${model.costPer1kInput.toFixed(5)} / ${model.costPer1kOutput.toFixed(4)} per 1K tokens
                    </div>
                    <div className="flex gap-2">
                      {model.supportsStreaming && (
                        <span className="text-accent text-[10px]">streaming</span>
                      )}
                      {model.supportsVision && (
                        <span className="text-success text-[10px]">vision</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* AI Playground */}
      <div className="surface-card p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4 text-accent" />
          <h2 className="text-sm font-semibold text-white">AI Playground</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Prompt Editor */}
          <div>
            <label className="block text-xs text-muted mb-1.5">Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="input-dark w-full h-48 font-mono text-sm resize-none"
              placeholder="Enter your prompt here..."
            />
          </div>
          {/* Response Panel */}
          <div>
            <label className="block text-xs text-muted mb-1.5">Response</label>
            <div className="input-dark w-full h-48 overflow-y-auto text-sm whitespace-pre-wrap">
              {sending ? (
                <div className="flex items-center gap-2 text-muted">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating response...
                </div>
              ) : response ? (
                <span className="text-white">{response}</span>
              ) : (
                <span className="text-surface-6">Response will appear here...</span>
              )}
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-border">
          <div>
            <label className="block text-xs text-muted mb-1.5">Provider</label>
            <select
              className="input-dark"
              value={selectedProvider}
              onChange={(e) => {
                setSelectedProvider(e.target.value);
                const provider = providers.find((p) => p.id === e.target.value);
                if (provider?.models[0]) setSelectedModel(provider.models[0].name);
              }}
            >
              {providers
                .filter((p) => p.isActive)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.displayName}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted mb-1.5">Model</label>
            <select
              className="input-dark"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
            >
              {providers
                .find((p) => p.id === selectedProvider)
                ?.models.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.displayName}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted mb-1.5">
              Temperature: {temperature}
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full accent-accent"
            />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1.5">Max Tokens</label>
            <input
              type="number"
              className="input-dark"
              value={maxTokens}
              onChange={(e) => setMaxTokens(parseInt(e.target.value) || 4096)}
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-xs text-muted mb-1.5">System Prompt</label>
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            className="input-dark w-full h-20 font-mono text-xs resize-none"
          />
        </div>

        <div className="mt-4 flex justify-end">
          <Button onClick={handleSend} disabled={sending || !prompt.trim()}>
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Send
          </Button>
        </div>
      </div>

      {/* Request History */}
      <div className="surface-card p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-muted" />
          <h2 className="text-sm font-semibold text-white">Request History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-xs text-muted font-medium">Time</th>
                <th className="text-left py-2 text-xs text-muted font-medium">Provider</th>
                <th className="text-left py-2 text-xs text-muted font-medium">Model</th>
                <th className="text-left py-2 text-xs text-muted font-medium">Prompt</th>
                <th className="text-right py-2 text-xs text-muted font-medium">Tokens</th>
                <th className="text-right py-2 text-xs text-muted font-medium">Latency</th>
                <th className="text-right py-2 text-xs text-muted font-medium">Cost</th>
                <th className="text-center py-2 text-xs text-muted font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => {
                const provider = providers.find((p) => p.id === req.providerId);
                return (
                  <tr key={req.id} className="border-b border-border/50 hover:bg-surface-2/50">
                    <td className="py-2.5 text-xs text-muted">{req.createdAt}</td>
                    <td className="py-2.5 text-xs text-white font-medium">
                      {provider?.displayName || req.providerId}
                    </td>
                    <td className="py-2.5 text-xs text-muted font-mono">{req.model}</td>
                    <td className="py-2.5 text-xs text-muted max-w-[200px] truncate">
                      {req.prompt}
                    </td>
                    <td className="py-2.5 text-xs text-muted text-right font-mono">
                      {req.tokensUsed?.toLocaleString() || "-"}
                    </td>
                    <td className="py-2.5 text-xs text-muted text-right font-mono">
                      {req.latencyMs ? `${req.latencyMs}ms` : "-"}
                    </td>
                    <td className="py-2.5 text-xs text-muted text-right font-mono">
                      {req.cost !== undefined ? `$${req.cost.toFixed(5)}` : "-"}
                    </td>
                    <td className="py-2.5 text-center">
                      {req.status === "completed" ? (
                        <CheckCircle2 className="w-4 h-4 text-success mx-auto" />
                      ) : req.status === "failed" ? (
                        <XCircle className="w-4 h-4 text-danger mx-auto" />
                      ) : (
                        <Loader2 className="w-4 h-4 text-muted animate-spin mx-auto" />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cost Summary */}
      <div className="surface-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-4 h-4 text-muted" />
          <h2 className="text-sm font-semibold text-white">Cost Summary</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="p-3 bg-surface-2 rounded-lg">
            <div className="text-xs text-muted">Total Cost</div>
            <div className="text-lg font-bold text-white">${totalCost.toFixed(2)}</div>
          </div>
          <div className="p-3 bg-surface-2 rounded-lg">
            <div className="text-xs text-muted">Total Requests</div>
            <div className="text-lg font-bold text-white">{totalRequests.toLocaleString()}</div>
          </div>
          <div className="p-3 bg-surface-2 rounded-lg">
            <div className="text-xs text-muted">Total Tokens</div>
            <div className="text-lg font-bold text-white">1.2M</div>
          </div>
          <div className="p-3 bg-surface-2 rounded-lg">
            <div className="text-xs text-muted">Avg Cost/Request</div>
            <div className="text-lg font-bold text-white">
              ${(totalCost / totalRequests).toFixed(4)}
            </div>
          </div>
        </div>

        {/* Breakdown by provider */}
        <div className="space-y-3">
          {providers.map((provider) => {
            const pct = totalCost > 0 ? (provider.totalCost / totalCost) * 100 : 0;
            return (
              <div key={provider.id}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-white font-medium">{provider.displayName}</span>
                  <span className="text-xs text-muted">${provider.totalCost.toFixed(2)}</span>
                </div>
                <div className="w-full h-1.5 bg-surface-3 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${
                      PROVIDER_COLORS[provider.name] || "from-gray-500 to-gray-600"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
