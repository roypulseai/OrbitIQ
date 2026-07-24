import { Injectable } from "@nestjs/common";

export interface AgentToolCall {
  id: string;
  toolName: string;
  arguments: Record<string, any>;
  status: "pending" | "running" | "completed" | "failed";
}

export interface AgentToolResult {
  toolCallId: string;
  output: any;
  success: boolean;
  error?: string;
}

export interface AgentMessage {
  id: string;
  role: "user" | "assistant" | "tool";
  content: string;
  toolCall?: AgentToolCall;
  toolResult?: AgentToolResult;
  timestamp: Date;
}

export interface AgentSession {
  id: string;
  userId: string;
  status: "idle" | "thinking" | "executing" | "waiting_input" | "completed" | "error";
  messages: AgentMessage[];
  toolsUsed: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentTool {
  name: string;
  description: string;
}

@Injectable()
export class AgentService {
  private sessions: Map<string, AgentSession> = new Map();

  private readonly availableTools: AgentTool[] = [
    { name: "query_data", description: "Execute a data query using OQL or SQL against a connected data source" },
    { name: "generate_chart", description: "Create a visualization from query results (bar, line, pie, scatter, etc.)" },
    { name: "apply_filter", description: "Add filters to the current data view (date ranges, categories, values)" },
    { name: "get_schema", description: "Retrieve schema information for a database connection (tables, columns, types)" },
    { name: "create_dashboard_tile", description: "Add a new tile to an existing dashboard with query and chart config" },
    { name: "calculate_measure", description: "Compute a calculated measure using expressions (e.g., YoY growth, moving average)" },
  ];

  constructor() {
    this.seedSession();
  }

  private generateId(prefix: string = "id"): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  private seedSession(): void {
    const session: AgentSession = {
      id: "agent-session-001",
      userId: "user-001",
      status: "completed",
      messages: [
        {
          id: "msg-001",
          role: "user",
          content: "Show me top 5 products by revenue this quarter",
          timestamp: new Date("2026-07-24T10:00:00Z"),
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
          timestamp: new Date("2026-07-24T10:00:02Z"),
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
              colors: ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe"],
            },
            status: "completed",
          },
          toolResult: {
            toolCallId: "tc-002",
            output: { chartId: "chart_123", status: "created", dimensions: { width: 800, height: 400 } },
            success: true,
          },
          timestamp: new Date("2026-07-24T10:00:04Z"),
        },
        {
          id: "msg-004",
          role: "assistant",
          content: "Here are the top 5 products by revenue this quarter:\n\n1. **OrbitIQ Pro License** — $284,500\n2. **Data Connector Premium** — $198,200\n3. **Analytics Dashboard Suite** — $156,800\n4. **OQL Enterprise Pack** — $132,400\n5. **API Gateway Pro** — $98,700\n\nI've also created a bar chart visualization for you. Total revenue across these top 5 products is **$870,600**.",
          timestamp: new Date("2026-07-24T10:00:05Z"),
        },
        {
          id: "msg-005",
          role: "user",
          content: "Can you also show the quantity sold for each?",
          timestamp: new Date("2026-07-24T10:01:00Z"),
        },
      ],
      toolsUsed: ["query_data", "generate_chart"],
      createdAt: new Date("2026-07-24T10:00:00Z"),
      updatedAt: new Date("2026-07-24T10:01:00Z"),
    };

    this.sessions.set(session.id, session);
  }

  createSession(userId: string): AgentSession {
    const session: AgentSession = {
      id: this.generateId("agent-session"),
      userId,
      status: "idle",
      messages: [],
      toolsUsed: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.sessions.set(session.id, session);
    return session;
  }

  sendMessage(sessionId: string, content: string): AgentSession {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const userMessage: AgentMessage = {
      id: this.generateId("msg"),
      role: "user",
      content,
      timestamp: new Date(),
    };
    session.messages.push(userMessage);

    session.status = "thinking";
    session.updatedAt = new Date();

    const lower = content.toLowerCase();
    const toolCalls: { toolName: string; args: Record<string, any>; result: any }[] = [];

    if (lower.match(/top.*product|product.*revenue|best.selling/)) {
      toolCalls.push({
        toolName: "query_data",
        args: {
          oql: `FROM products JOIN orders ON products.id = orders.product_id SELECT product_name, SUM(revenue) AS total_revenue WHERE order_date >= '2026-04-01' GROUP BY product_name ORDER BY total_revenue DESC LIMIT 5`,
        },
        result: {
          rows: 5,
          data: [
            { product_name: "OrbitIQ Pro License", total_revenue: 284500 },
            { product_name: "Data Connector Premium", total_revenue: 198200 },
            { product_name: "Analytics Dashboard Suite", total_revenue: 156800 },
            { product_name: "OQL Enterprise Pack", total_revenue: 132400 },
            { product_name: "API Gateway Pro", total_revenue: 98700 },
          ],
        },
      });
      toolCalls.push({
        toolName: "generate_chart",
        args: { type: "bar", title: "Top Products by Revenue" },
        result: { chartId: this.generateId("chart"), status: "created" },
      });
    } else if (lower.match(/revenue.*region|region.*revenue|by.region/)) {
      toolCalls.push({
        toolName: "query_data",
        args: {
          oql: `FROM sales SELECT region, SUM(revenue) AS total_revenue GROUP BY region ORDER BY total_revenue DESC`,
        },
        result: {
          rows: 4,
          data: [
            { region: "North America", total_revenue: 1245000 },
            { region: "Europe", total_revenue: 892000 },
            { region: "Asia Pacific", total_revenue: 634000 },
            { region: "Latin America", total_revenue: 218000 },
          ],
        },
      });
      toolCalls.push({
        toolName: "generate_chart",
        args: { type: "bar", title: "Revenue by Region" },
        result: { chartId: this.generateId("chart"), status: "created" },
      });
    } else if (lower.match(/filter|where|show.*only/)) {
      toolCalls.push({
        toolName: "apply_filter",
        args: { field: "status", operator: "=", value: "active" },
        result: { filterId: this.generateId("filter"), applied: true },
      });
    } else if (lower.match(/schema|table|column|structure/)) {
      toolCalls.push({
        toolName: "get_schema",
        args: { connectionId: "conn-001" },
        result: {
          tables: 12,
          columns: 87,
          schemas: ["public", "analytics", "finance"],
        },
      });
    } else if (lower.match(/dashboard|tile|add.*to/)) {
      toolCalls.push({
        toolName: "create_dashboard_tile",
        args: { dashboardId: "dash-001", chartType: "bar", title: "New Analysis" },
        result: { tileId: this.generateId("tile"), status: "created" },
      });
    } else if (lower.match(/calculate|measure|growth|yoy/)) {
      toolCalls.push({
        toolName: "calculate_measure",
        args: { expression: "(current_revenue - previous_revenue) / previous_revenue * 100", alias: "yoy_growth_pct" },
        result: { measureId: this.generateId("measure"), value: 12.4 },
      });
    } else {
      toolCalls.push({
        toolName: "query_data",
        args: { oql: `FROM data SELECT * LIMIT 10` },
        result: { rows: 10, data: [{ note: "general query result" }] },
      });
    }

    for (const tc of toolCalls) {
      const toolCallId = this.generateId("tc");
      const toolCall: AgentToolCall = {
        id: toolCallId,
        toolName: tc.toolName,
        arguments: tc.args,
        status: "completed",
      };

      const toolMsg: AgentMessage = {
        id: this.generateId("msg"),
        role: "assistant",
        content: "",
        toolCall,
        toolResult: {
          toolCallId,
          output: tc.result,
          success: true,
        },
        timestamp: new Date(),
      };

      session.messages.push(toolMsg);

      if (!session.toolsUsed.includes(tc.toolName)) {
        session.toolsUsed.push(tc.toolName);
      }
    }

    session.status = "executing";

    const assistantMsg: AgentMessage = {
      id: this.generateId("msg"),
      role: "assistant",
      content: this.generateResponse(content, toolCalls),
      timestamp: new Date(),
    };
    session.messages.push(assistantMsg);

    session.status = "completed";
    session.updatedAt = new Date();

    return session;
  }

  private generateResponse(userQuery: string, toolCalls: { toolName: string; result: any }[]): string {
    const lower = userQuery.toLowerCase();

    if (lower.match(/top.*product|product.*revenue|best.selling/)) {
      return "Here are the top products by revenue. I queried the data and created a bar chart visualization for you. The leading product continues to show strong quarter-over-quarter growth.";
    }
    if (lower.match(/revenue.*region|region.*revenue|by.region/)) {
      return "Here's the revenue breakdown by region. North America leads with $1.24M, followed by Europe at $892K. I've generated a bar chart to compare regional performance.";
    }
    if (lower.match(/filter|where/)) {
      return "I've applied the requested filter to your current view. The results have been narrowed down accordingly.";
    }
    if (lower.match(/schema|table|column/)) {
      return "Here's the schema information for your connection. There are 12 tables across 3 schemas with a total of 87 columns.";
    }
    if (lower.match(/dashboard|tile/)) {
      return "I've added a new tile to your dashboard with the requested chart configuration.";
    }
    if (lower.match(/calculate|measure|growth/)) {
      return "The calculated measure has been computed. The year-over-year growth rate is 12.4%.";
    }
    return "I've processed your request. Let me know if you need any further analysis or modifications.";
  }

  getSession(id: string): AgentSession | undefined {
    return this.sessions.get(id);
  }

  listSessions(userId?: string): AgentSession[] {
    const all = Array.from(this.sessions.values());
    if (userId) {
      return all.filter((s) => s.userId === userId);
    }
    return all;
  }

  getTools(): AgentTool[] {
    return this.availableTools;
  }

  executeToolCall(sessionId: string, toolName: string, args: Record<string, any>): AgentToolResult {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const toolCallId = this.generateId("tc");
    const tool = this.availableTools.find((t) => t.name === toolName);
    if (!tool) {
      return { toolCallId, output: null, success: false, error: `Unknown tool: ${toolName}` };
    }

    let output: any;
    switch (toolName) {
      case "query_data":
        output = { rows: 5, data: [{ mock: true }], executionTimeMs: 142 };
        break;
      case "generate_chart":
        output = { chartId: this.generateId("chart"), status: "created" };
        break;
      case "apply_filter":
        output = { filterId: this.generateId("filter"), applied: true };
        break;
      case "get_schema":
        output = { tables: 12, columns: 87, schemas: ["public"] };
        break;
      case "create_dashboard_tile":
        output = { tileId: this.generateId("tile"), status: "created" };
        break;
      case "calculate_measure":
        output = { measureId: this.generateId("measure"), value: 0 };
        break;
      default:
        output = { message: "Tool executed" };
    }

    if (!session.toolsUsed.includes(toolName)) {
      session.toolsUsed.push(toolName);
    }
    session.updatedAt = new Date();

    return { toolCallId, output, success: true };
  }

  getConversationHistory(sessionId: string): AgentMessage[] {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }
    return session.messages;
  }
}
