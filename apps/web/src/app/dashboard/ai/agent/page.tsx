"use client";

import { useState, useRef, useEffect } from "react";
import {
  Cpu,
  Send,
  Plus,
  Database,
  BarChart3,
  Filter,
  Table2,
  LayoutDashboard,
  Calculator,
  ChevronDown,
  ChevronRight,
  Bot,
  CheckCircle2,
  XCircle,
  Loader2,
  Wrench,
} from "lucide-react";

interface ToolCall {
  id: string;
  toolName: string;
  arguments: Record<string, any>;
  status: "pending" | "running" | "completed" | "failed";
}

interface ToolResult {
  toolCallId: string;
  output: any;
  success: boolean;
  error?: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "tool";
  content: string;
  toolCall?: ToolCall;
  toolResult?: ToolResult;
  timestamp: string;
}

const TOOLS = [
  { name: "query_data", icon: Database, description: "Execute data queries (OQL/SQL)" },
  { name: "generate_chart", icon: BarChart3, description: "Create visualizations" },
  { name: "apply_filter", icon: Filter, description: "Add filters to views" },
  { name: "get_schema", icon: Table2, description: "Retrieve schema info" },
  { name: "create_dashboard_tile", icon: LayoutDashboard, description: "Add dashboard tiles" },
  { name: "calculate_measure", icon: Calculator, description: "Compute calculated measures" },
];

const TOOL_COLORS: Record<string, string> = {
  query_data: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  generate_chart: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  apply_filter: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  get_schema: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  create_dashboard_tile: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  calculate_measure: "bg-pink-500/15 text-pink-400 border-pink-500/30",
};

const SEED_MESSAGES: ChatMessage[] = [
  {
    id: "msg-001",
    role: "user",
    content: "Show me top 5 products by revenue this quarter",
    timestamp: "10:00 AM",
  },
  {
    id: "msg-002",
    role: "assistant",
    content: "I'll help you analyze top products by revenue. Let me query the data and create a visualization.",
    toolCall: {
      id: "tc-001",
      toolName: "query_data",
      arguments: {
        oql: "FROM products JOIN orders ON products.id = orders.product_id SELECT product_name, SUM(revenue) AS total_revenue WHERE order_date >= '2026-04-01' AND order_date < '2026-07-01' GROUP BY product_name ORDER BY total_revenue DESC LIMIT 5",
      },
      status: "completed",
    },
    toolResult: {
      toolCallId: "tc-001",
      output: {
        rows: 5,
        columns: ["product_name", "total_revenue"],
        data: [
          { product_name: "OrbitIQ Pro License", total_revenue: 284500 },
          { product_name: "Data Connector Premium", total_revenue: 198200 },
          { product_name: "Analytics Dashboard Suite", total_revenue: 156800 },
          { product_name: "OQL Enterprise Pack", total_revenue: 132400 },
          { product_name: "API Gateway Pro", total_revenue: 98700 },
        ],
      },
      success: true,
    },
    timestamp: "10:00 AM",
  },
  {
    id: "msg-003",
    role: "assistant",
    content: "",
    toolCall: {
      id: "tc-002",
      toolName: "generate_chart",
      arguments: {
        type: "bar",
        title: "Top 5 Products by Revenue (Q2 2026)",
        xAxis: "product_name",
        yAxis: "total_revenue",
      },
      status: "completed",
    },
    toolResult: {
      toolCallId: "tc-002",
      output: { chartId: "chart_123", status: "created", dimensions: { width: 800, height: 400 } },
      success: true,
    },
    timestamp: "10:00 AM",
  },
  {
    id: "msg-004",
    role: "assistant",
    content: "Here are the top 5 products by revenue this quarter:\n\n1. **OrbitIQ Pro License** — $284,500\n2. **Data Connector Premium** — $198,200\n3. **Analytics Dashboard Suite** — $156,800\n4. **OQL Enterprise Pack** — $132,400\n5. **API Gateway Pro** — $98,700\n\nI've also created a bar chart visualization for you. Total revenue across these top 5 products is **$870,600**.",
    timestamp: "10:00 AM",
  },
  {
    id: "msg-005",
    role: "user",
    content: "Can you also show the quantity sold for each?",
    timestamp: "10:01 AM",
  },
];

function ToolCallCard({ toolCall, toolResult }: { toolCall: ToolCall; toolResult?: ToolResult }) {
  const [expanded, setExpanded] = useState(false);
  const toolMeta = TOOLS.find((t) => t.name === toolCall.toolName);

  return (
    <div className="ml-0 mt-1 mb-1">
      <button
        onClick={() => setExpanded(!expanded)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
          TOOL_COLORS[toolCall.toolName] || "bg-surface-3 text-muted border-border"
        } hover:opacity-80`}
      >
        {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        {toolMeta && <toolMeta.icon className="w-3 h-3" />}
        <span>{toolCall.toolName}</span>
        {toolCall.status === "completed" && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
        {toolCall.status === "failed" && <XCircle className="w-3 h-3 text-red-400" />}
        {toolCall.status === "running" && <Loader2 className="w-3 h-3 animate-spin" />}
      </button>

      {expanded && (
        <div className="ml-4 mt-1 space-y-1">
          <div className="bg-surface-3/50 rounded-lg border border-border p-3">
            <div className="text-[10px] text-muted mb-1 font-semibold uppercase tracking-wider">Arguments</div>
            <pre className="text-[11px] text-emerald-400 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {JSON.stringify(toolCall.arguments, null, 2)}
            </pre>
          </div>
          {toolResult && (
            <div className="bg-surface-3/50 rounded-lg border border-border p-3">
              <div className="flex items-center gap-1.5 text-[10px] mb-1 font-semibold uppercase tracking-wider">
                {toolResult.success ? (
                  <span className="text-emerald-400">Result (Success)</span>
                ) : (
                  <span className="text-red-400">Result (Error)</span>
                )}
              </div>
              <pre className="text-[11px] text-sky-400 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {JSON.stringify(toolResult.output, null, 2)}
              </pre>
              {toolResult.error && (
                <div className="text-[11px] text-red-400 mt-1">{toolResult.error}</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end mb-3">
        <div className="max-w-[70%] bg-accent text-white rounded-2xl rounded-br-md px-4 py-2.5 text-sm leading-relaxed">
          {msg.content}
        </div>
      </div>
    );
  }

  if (msg.role === "assistant") {
    return (
      <div className="flex gap-2.5 mb-3">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center shrink-0 mt-0.5">
          <Bot className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="max-w-[75%]">
          {msg.toolCall && (
            <ToolCallCard toolCall={msg.toolCall} toolResult={msg.toolResult} />
          )}
          {msg.content && (
            <div className="bg-surface-3 border border-border rounded-2xl rounded-tl-md px-4 py-2.5 text-sm text-white/90 leading-relaxed whitespace-pre-wrap">
              {msg.content.split("**").map((part, i) =>
                i % 2 === 1 ? <strong key={i} className="text-white font-semibold">{part}</strong> : part
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}

export default function AgentPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(SEED_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    const userQuery = input;
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const lower = userQuery.toLowerCase();
      const toolCalls: { toolCall: ToolCall; toolResult: ToolResult }[] = [];
      let responseText = "";

      if (lower.match(/top.*product|product.*revenue|best.selling/)) {
        toolCalls.push({
          toolCall: {
            id: `tc-${Date.now()}-1`,
            toolName: "query_data",
            arguments: {
              oql: "FROM products JOIN orders ON products.id = orders.product_id SELECT product_name, SUM(revenue) AS total_revenue WHERE order_date >= '2026-04-01' GROUP BY product_name ORDER BY total_revenue DESC LIMIT 5",
            },
            status: "completed",
          },
          toolResult: {
            toolCallId: `tc-${Date.now()}-1`,
            output: {
              rows: 5,
              data: [
                { product_name: "OrbitIQ Pro License", total_revenue: 284500 },
                { product_name: "Data Connector Premium", total_revenue: 198200 },
                { product_name: "Analytics Dashboard Suite", total_revenue: 156800 },
                { product_name: "OQL Enterprise Pack", total_revenue: 132400 },
                { product_name: "API Gateway Pro", total_revenue: 98700 },
              ],
            },
            success: true,
          },
        });
        toolCalls.push({
          toolCall: {
            id: `tc-${Date.now()}-2`,
            toolName: "generate_chart",
            arguments: { type: "bar", title: "Top Products by Revenue" },
            status: "completed",
          },
          toolResult: {
            toolCallId: `tc-${Date.now()}-2`,
            output: { chartId: `chart-${Date.now()}`, status: "created" },
            success: true,
          },
        });
        responseText = "Here are the top products by revenue. I've created a bar chart visualization for you.";
      } else if (lower.match(/revenue.*region|region.*revenue|by.region/)) {
        toolCalls.push({
          toolCall: {
            id: `tc-${Date.now()}-1`,
            toolName: "query_data",
            arguments: { oql: "FROM sales SELECT region, SUM(revenue) AS total_revenue GROUP BY region ORDER BY total_revenue DESC" },
            status: "completed",
          },
          toolResult: {
            toolCallId: `tc-${Date.now()}-1`,
            output: {
              rows: 4,
              data: [
                { region: "North America", total_revenue: 1245000 },
                { region: "Europe", total_revenue: 892000 },
                { region: "Asia Pacific", total_revenue: 634000 },
                { region: "Latin America", total_revenue: 218000 },
              ],
            },
            success: true,
          },
        });
        responseText = "Revenue by region has been retrieved. North America leads with $1.24M. I've generated a bar chart for comparison.";
      } else if (lower.match(/filter|where|show.*only/)) {
        toolCalls.push({
          toolCall: {
            id: `tc-${Date.now()}-1`,
            toolName: "apply_filter",
            arguments: { field: "status", operator: "=", value: "active" },
            status: "completed",
          },
          toolResult: {
            toolCallId: `tc-${Date.now()}-1`,
            output: { filterId: `filter-${Date.now()}`, applied: true },
            success: true,
          },
        });
        responseText = "I've applied the filter to your current view. Results have been updated.";
      } else if (lower.match(/schema|table|column|structure/)) {
        toolCalls.push({
          toolCall: {
            id: `tc-${Date.now()}-1`,
            toolName: "get_schema",
            arguments: { connectionId: "conn-001" },
            status: "completed",
          },
          toolResult: {
            toolCallId: `tc-${Date.now()}-1`,
            output: { tables: 12, columns: 87, schemas: ["public", "analytics", "finance"] },
            success: true,
          },
        });
        responseText = "Here's the schema information: 12 tables across 3 schemas with 87 columns total.";
      } else if (lower.match(/dashboard|tile|add.*to/)) {
        toolCalls.push({
          toolCall: {
            id: `tc-${Date.now()}-1`,
            toolName: "create_dashboard_tile",
            arguments: { dashboardId: "dash-001", chartType: "bar", title: "New Analysis" },
            status: "completed",
          },
          toolResult: {
            toolCallId: `tc-${Date.now()}-1`,
            output: { tileId: `tile-${Date.now()}`, status: "created" },
            success: true,
          },
        });
        responseText = "I've added a new tile to your dashboard with the requested configuration.";
      } else if (lower.match(/calculate|measure|growth|yoy/)) {
        toolCalls.push({
          toolCall: {
            id: `tc-${Date.now()}-1`,
            toolName: "calculate_measure",
            arguments: { expression: "(current - previous) / previous * 100", alias: "growth_pct" },
            status: "completed",
          },
          toolResult: {
            toolCallId: `tc-${Date.now()}-1`,
            output: { measureId: `measure-${Date.now()}`, value: 12.4 },
            success: true,
          },
        });
        responseText = "The calculated measure shows a 12.4% growth rate. I've stored this as a reusable measure.";
      } else {
        toolCalls.push({
          toolCall: {
            id: `tc-${Date.now()}-1`,
            toolName: "query_data",
            arguments: { oql: "FROM data SELECT * LIMIT 10" },
            status: "completed",
          },
          toolResult: {
            toolCallId: `tc-${Date.now()}-1`,
            output: { rows: 10, data: [{ note: "query result" }] },
            success: true,
          },
        });
        responseText = "I've processed your request. Let me know if you need any further analysis.";
      }

      const newMessages: ChatMessage[] = [];
      for (const tc of toolCalls) {
        newMessages.push({
          id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          role: "assistant",
          content: "",
          toolCall: tc.toolCall,
          toolResult: tc.toolResult,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        });
      }
      newMessages.push({
        id: `msg-${Date.now()}-final`,
        role: "assistant",
        content: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });

      setMessages((prev) => [...prev, ...newMessages]);
      setIsTyping(false);
    }, 1200 + Math.random() * 800);
  };

  return (
    <div className="flex h-full animate-fade-in">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">AI Agent</h1>
              <p className="text-xs text-muted">Multi-step AI assistant with tool execution</p>
            </div>
          </div>
          <button
            onClick={() => {
              setMessages([]);
              setIsTyping(false);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-surface-3 hover:bg-surface-4 text-muted hover:text-white rounded-lg text-sm font-medium transition-colors border border-border"
          >
            <Plus className="w-4 h-4" />
            New Session
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-purple-500/20 flex items-center justify-center mb-4">
                <Cpu className="w-8 h-8 text-accent" />
              </div>
              <h2 className="text-lg font-semibold text-white mb-1">Start a conversation</h2>
              <p className="text-sm text-muted max-w-md">
                Ask me to query data, create charts, apply filters, or build dashboards. I can execute multi-step workflows using available tools.
              </p>
              <div className="flex flex-wrap gap-2 mt-6 max-w-lg justify-center">
                {[
                  "Show top 5 products by revenue",
                  "Revenue breakdown by region",
                  "Apply active status filter",
                  "Show me the database schema",
                  "Calculate YoY growth rate",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setInput(suggestion);
                      setTimeout(() => {
                        const userMsg: ChatMessage = {
                          id: `msg-${Date.now()}`,
                          role: "user",
                          content: suggestion,
                          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                        };
                        setMessages([userMsg]);
                        setInput("");
                        setIsTyping(true);
                        setTimeout(() => {
                          setMessages((prev) => [
                            ...prev,
                            {
                              id: `msg-${Date.now()}-resp`,
                              role: "assistant",
                              content: "I've processed your request using the available tools. Let me know if you need more details.",
                              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                            },
                          ]);
                          setIsTyping(false);
                        }, 1500);
                      }, 100);
                    }}
                    className="px-3 py-1.5 text-xs font-medium bg-surface-3 text-muted hover:text-white hover:bg-surface-4 rounded-full border border-border transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}

          {isTyping && (
            <div className="flex gap-2.5 mb-3">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="bg-surface-3 border border-border rounded-2xl rounded-tl-md px-4 py-2.5">
                <div className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 text-accent animate-spin" />
                  <span className="text-xs text-muted">Thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="px-6 py-4 border-t border-border shrink-0">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask the agent to do something..."
              className="flex-1 bg-surface-3/50 border border-border rounded-xl px-4 py-2.5 text-sm text-white placeholder-surface-6 focus:outline-none focus:ring-1 focus:ring-accent/30 focus:border-accent/30 transition-all"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="p-2.5 bg-accent hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tools Sidebar */}
      <div className="w-64 border-l border-border bg-surface-2/50 shrink-0 overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Wrench className="w-4 h-4 text-accent" />
            <h2 className="text-sm font-semibold text-white">Available Tools</h2>
          </div>
          <div className="space-y-2">
            {TOOLS.map((tool) => {
              const colorClass = TOOL_COLORS[tool.name] || "bg-surface-3 text-muted border-border";
              return (
                <div
                  key={tool.name}
                  className={`p-3 rounded-lg border transition-colors cursor-default ${colorClass}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <tool.icon className="w-3.5 h-3.5" />
                    <span className="text-xs font-semibold">{tool.name}</span>
                  </div>
                  <p className="text-[11px] opacity-70 leading-relaxed">{tool.description}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-border">
            <div className="text-[10px] text-muted font-semibold uppercase tracking-wider mb-3">Session Stats</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted">Status</span>
                <span className="px-2 py-0.5 bg-emerald-500/15 text-emerald-400 rounded-full text-[10px] font-medium">
                  {isTyping ? "executing" : messages.length > 0 ? "completed" : "idle"}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted">Messages</span>
                <span className="text-white font-mono">{messages.length}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted">Tools Used</span>
                <span className="text-white font-mono">
                  {new Set(messages.filter((m) => m.toolCall).map((m) => m.toolCall!.toolName)).size}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
