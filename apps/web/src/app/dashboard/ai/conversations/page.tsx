"use client";

import { useState } from "react";
import {
  MessageCircle,
  Plus,
  Search,
  Send,
  Bot,
  User,
  Sparkles,
  Clock,
  Hash,
  BarChart3,
  GitCompare,
  Filter,
  Lightbulb,
  ChevronRight,
  Trash2,
} from "lucide-react";

interface FollowUp {
  id: string;
  question: string;
  category: "drill_down" | "comparison" | "filter" | "visualization" | "explanation";
  relevance: number;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  followUps?: FollowUp[];
}

interface ConversationData {
  id: string;
  title: string;
  messages: Message[];
  context: {
    previousIntents: string[];
    activeFilters: string[];
    activeModels: string[];
    summary: string;
    tokenCount: number;
    maxTokens: number;
  };
  updatedAt: string;
}

const MOCK_CONVERSATIONS: ConversationData[] = [
  {
    id: "conv-001",
    title: "Q1 Revenue Analysis",
    messages: [
      {
        id: "msg-001",
        role: "user",
        content: "What was our total revenue in Q1?",
        timestamp: "2026-07-24 09:00",
      },
      {
        id: "msg-002",
        role: "assistant",
        content:
          "Total revenue for Q1 2026 was **$2.4M**, up **12%** from Q4 2025. This growth was primarily driven by strong performance in the North American market and new enterprise contracts signed in February.",
        timestamp: "2026-07-24 09:00",
        followUps: [
          { id: "fu-1a", question: "Compare revenue across regions", category: "comparison", relevance: 0.95 },
          { id: "fu-1b", question: "Show monthly trend", category: "visualization", relevance: 0.92 },
          { id: "fu-1c", question: "Break down by product category", category: "drill_down", relevance: 0.88 },
          { id: "fu-1d", question: "What drove the 12% growth?", category: "explanation", relevance: 0.85 },
        ],
      },
      {
        id: "msg-003",
        role: "user",
        content: "Which region contributed the most?",
        timestamp: "2026-07-24 09:01",
      },
      {
        id: "msg-004",
        role: "assistant",
        content:
          "North America contributed **$1.1M (46%)**, followed by EMEA at **$890K (37%)**. APAC contributed $312K (13%) and Latin America $98K (4%). North America showed the strongest YoY growth at 18%.",
        timestamp: "2026-07-24 09:01",
        followUps: [
          { id: "fu-1e", question: "Show Q1 breakdown by product", category: "drill_down", relevance: 0.95 },
          { id: "fu-1f", question: "Compare to Q1 2025", category: "comparison", relevance: 0.92 },
          { id: "fu-1g", question: "Show weekly trend within Q1", category: "visualization", relevance: 0.88 },
          { id: "fu-1h", question: "Export this revenue report", category: "visualization", relevance: 0.82 },
        ],
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
    updatedAt: "2026-07-24 09:01",
  },
  {
    id: "conv-002",
    title: "Customer Churn Investigation",
    messages: [
      {
        id: "msg-010",
        role: "user",
        content: "What's our current churn rate?",
        timestamp: "2026-07-24 08:30",
      },
      {
        id: "msg-011",
        role: "assistant",
        content:
          "The current monthly churn rate is **4.2%**, affecting **128 customers**. This represents a slight increase from 3.8% last month. The MRR impact is approximately **$48K/month**.",
        timestamp: "2026-07-24 08:30",
        followUps: [
          { id: "fu-2a", question: "Show churn trend over last 6 months", category: "visualization", relevance: 0.94 },
          { id: "fu-2b", question: "Compare churn by region", category: "comparison", relevance: 0.91 },
          { id: "fu-2c", question: "Identify at-risk accounts", category: "drill_down", relevance: 0.96 },
          { id: "fu-2d", question: "What factors correlate with churn?", category: "explanation", relevance: 0.89 },
        ],
      },
      {
        id: "msg-012",
        role: "user",
        content: "Which customer segment has the highest churn?",
        timestamp: "2026-07-24 08:31",
      },
      {
        id: "msg-013",
        role: "assistant",
        content:
          "Enterprise tier has the highest churn at **6.1%**, mostly from customers with **<3 months tenure**. Mid-market follows at 3.9%, and SMB is lowest at 2.8%. The onboarding period appears to be the critical retention window.",
        timestamp: "2026-07-24 08:31",
        followUps: [
          { id: "fu-2e", question: "Show churn trend over last 6 months", category: "visualization", relevance: 0.94 },
          { id: "fu-2f", question: "Compare churn by region", category: "comparison", relevance: 0.91 },
          { id: "fu-2g", question: "Identify at-risk accounts", category: "drill_down", relevance: 0.96 },
          { id: "fu-2h", question: "What factors correlate with churn?", category: "explanation", relevance: 0.89 },
        ],
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
    updatedAt: "2026-07-24 08:31",
  },
];

const CATEGORY_CONFIG: Record<string, { icon: typeof BarChart3; color: string; label: string }> = {
  drill_down: { icon: ChevronRight, color: "text-blue-400 bg-blue-400/10 border-blue-400/20", label: "Drill-down" },
  comparison: { icon: GitCompare, color: "text-purple-400 bg-purple-400/10 border-purple-400/20", label: "Compare" },
  filter: { icon: Filter, color: "text-amber-400 bg-amber-400/10 border-amber-400/20", label: "Filter" },
  visualization: { icon: BarChart3, color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", label: "Chart" },
  explanation: { icon: Lightbulb, color: "text-rose-400 bg-rose-400/10 border-rose-400/20", label: "Explain" },
};

export default function ConversationsPage() {
  const [conversations] = useState<ConversationData[]>(MOCK_CONVERSATIONS);
  const [activeConvId, setActiveConvId] = useState<string>("conv-001");
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const activeConv = conversations.find((c) => c.id === activeConvId);

  const filteredConversations = conversations.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.messages.some((m) => m.content.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const totalMessages = conversations.reduce((acc, c) => acc + c.messages.length, 0);
  const totalFollowUps = conversations.reduce(
    (acc, c) => acc + c.messages.filter((m) => m.followUps && m.followUps.length > 0).length,
    0,
  );

  const tokenPercent = activeConv
    ? Math.round((activeConv.context.tokenCount / activeConv.context.maxTokens) * 100)
    : 0;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-border px-6 py-4 bg-surface-2/50">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white">Conversations</h1>
                <p className="text-sm text-muted mt-0.5">
                  Context-aware AI chat with follow-up suggestions
                </p>
              </div>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors">
            <Plus className="w-4 h-4" />
            New Conversation
          </button>
        </div>

        {/* Stats */}
        <div className="flex gap-6 mt-4">
          <div className="flex items-center gap-2 text-sm">
            <MessageCircle className="w-4 h-4 text-muted" />
            <span className="text-muted">Total Conversations</span>
            <span className="text-white font-medium">{conversations.length}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Hash className="w-4 h-4 text-muted" />
            <span className="text-muted">Avg Messages</span>
            <span className="text-white font-medium">{(totalMessages / conversations.length).toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Sparkles className="w-4 h-4 text-muted" />
            <span className="text-muted">Follow-ups Shown</span>
            <span className="text-white font-medium">{totalFollowUps}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Conversation List */}
        <div className="w-72 border-r border-border bg-surface-2/30 flex flex-col shrink-0">
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface-3/50 border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-surface-6 focus:outline-none focus:ring-1 focus:ring-accent/30 transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setActiveConvId(conv.id)}
                className={`w-full text-left px-4 py-3 border-b border-border/50 transition-colors ${
                  conv.id === activeConvId
                    ? "bg-accent/10 border-l-2 border-l-accent"
                    : "hover:bg-surface-3/50 border-l-2 border-l-transparent"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-sm font-medium truncate ${conv.id === activeConvId ? "text-accent" : "text-white"}`}>
                      {conv.title}
                    </h3>
                    <p className="text-xs text-muted mt-1 line-clamp-2">
                      {conv.messages[conv.messages.length - 1]?.content.slice(0, 60)}...
                    </p>
                  </div>
                  <Trash2 className="w-3.5 h-3.5 text-surface-6 hover:text-rose-400 transition-colors mt-0.5 ml-2 shrink-0" />
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Clock className="w-3 h-3 text-surface-6" />
                  <span className="text-[11px] text-surface-6">{conv.updatedAt}</span>
                  <span className="text-[11px] text-surface-6 ml-auto">{conv.messages.length} msgs</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {activeConv && (
            <>
              {/* Context Panel */}
              <div className="border-b border-border px-6 py-3 bg-surface-2/30 flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted">Models:</span>
                  {activeConv.context.activeModels.map((model) => (
                    <span key={model} className="px-2 py-0.5 rounded text-[11px] font-medium bg-violet-500/10 text-violet-400 border border-violet-500/20">
                      {model}
                    </span>
                  ))}
                </div>
                <div className="w-px h-4 bg-border" />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted">Filters:</span>
                  {activeConv.context.activeFilters.map((filter) => (
                    <span key={filter} className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {filter}
                    </span>
                  ))}
                </div>
                <div className="w-px h-4 bg-border" />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted">Tokens:</span>
                  <div className="w-24 h-1.5 bg-surface-4 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${tokenPercent > 80 ? "bg-rose-500" : tokenPercent > 50 ? "bg-amber-500" : "bg-emerald-500"}`}
                      style={{ width: `${tokenPercent}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-muted">
                    {activeConv.context.tokenCount.toLocaleString()} / {activeConv.context.maxTokens.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {activeConv.messages.map((msg) => (
                  <div key={msg.id} className="space-y-3">
                    <div className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
                      {msg.role === "assistant" && (
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20 flex items-center justify-center shrink-0 mt-0.5">
                          <Bot className="w-4 h-4 text-violet-400" />
                        </div>
                      )}
                      <div
                        className={`max-w-[70%] rounded-xl px-4 py-3 ${
                          msg.role === "user"
                            ? "bg-accent/15 text-white border border-accent/20"
                            : "bg-surface-3/70 text-white/90 border border-border"
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] text-surface-6">{msg.timestamp}</span>
                        </div>
                      </div>
                      {msg.role === "user" && (
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent/20 to-purple-500/20 border border-accent/20 flex items-center justify-center shrink-0 mt-0.5">
                          <User className="w-4 h-4 text-accent" />
                        </div>
                      )}
                    </div>

                    {/* Follow-ups */}
                    {msg.followUps && msg.followUps.length > 0 && (
                      <div className="ml-11 space-y-2">
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3 text-violet-400" />
                          <span className="text-[11px] text-violet-400 font-medium">Suggested follow-ups</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {msg.followUps.map((fu) => {
                            const config = CATEGORY_CONFIG[fu.category] || CATEGORY_CONFIG.explanation;
                            const Icon = config.icon;
                            return (
                              <button
                                key={fu.id}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all hover:scale-[1.02] active:scale-[0.98] ${config.color}`}
                              >
                                <Icon className="w-3 h-3" />
                                {fu.question}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Input Bar */}
              <div className="border-t border-border px-6 py-4 bg-surface-2/30">
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Ask a follow-up question..."
                      className="w-full bg-surface-3/50 border border-border rounded-xl px-4 py-3 text-sm text-white placeholder-surface-6 focus:outline-none focus:ring-1 focus:ring-accent/30 focus:border-accent/30 transition-all pr-12"
                    />
                  </div>
                  <button className="w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center hover:bg-accent/90 transition-colors shrink-0">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[11px] text-surface-6 mt-2 text-center">
                  Context is maintained across messages. Follow-up suggestions are generated based on your conversation history.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
