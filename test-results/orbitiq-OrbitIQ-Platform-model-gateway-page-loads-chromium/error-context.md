# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: orbitiq.spec.ts >> OrbitIQ Platform >> model gateway page loads
- Location: e2e\orbitiq.spec.ts:76:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=Model Gateway')
Expected: visible
Error: strict mode violation: locator('text=Model Gateway') resolved to 2 elements:
    1) <span>Model Gateway</span> aka getByRole('link', { name: 'Model Gateway' })
    2) <h1 class="text-2xl font-bold text-white tracking-tight">Model Gateway</h1> aka getByRole('heading', { name: 'Model Gateway' })

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=Model Gateway')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - complementary [ref=e3]:
      - link "O OrbitIQ" [ref=e5] [cursor=pointer]:
        - /url: /dashboard
        - generic [ref=e7]: O
        - generic [ref=e8]: OrbitIQ
      - button "New Query" [ref=e10] [cursor=pointer]:
        - img [ref=e11]
        - generic [ref=e12]: New Query
      - navigation [ref=e13]:
        - generic [ref=e14]:
          - generic [ref=e15]: Analytics
          - generic [ref=e16]:
            - link "Dashboard" [ref=e17] [cursor=pointer]:
              - /url: /dashboard
              - img [ref=e18]
              - generic [ref=e23]: Dashboard
            - link "Explore" [ref=e24] [cursor=pointer]:
              - /url: /dashboard/explore
              - img [ref=e25]
              - generic [ref=e28]: Explore
            - link "Models" [ref=e29] [cursor=pointer]:
              - /url: /dashboard/models
              - img [ref=e30]
              - generic [ref=e33]: Models
            - link "Dashboards" [ref=e34] [cursor=pointer]:
              - /url: /dashboard/dashboards
              - img [ref=e35]
              - generic [ref=e40]: Dashboards
            - link "Forecasting" [ref=e41] [cursor=pointer]:
              - /url: /dashboard/analytics/forecasting
              - img [ref=e42]
              - generic [ref=e45]: Forecasting
            - link "Hypothesis Testing" [ref=e46] [cursor=pointer]:
              - /url: /dashboard/analytics/hypothesis-testing
              - img [ref=e47]
              - generic [ref=e49]: Hypothesis Testing
            - link "Experiments" [ref=e50] [cursor=pointer]:
              - /url: /dashboard/analytics/experiments
              - img [ref=e51]
              - generic [ref=e53]: Experiments
            - link "ML Experiments" [ref=e54] [cursor=pointer]:
              - /url: /dashboard/analytics/ml
              - img [ref=e55]
              - generic [ref=e63]: ML Experiments
            - link "Federated Query" [ref=e64] [cursor=pointer]:
              - /url: /dashboard/analytics/federation
              - img [ref=e65]
              - generic [ref=e70]: Federated Query
            - link "Performance" [ref=e71] [cursor=pointer]:
              - /url: /dashboard/analytics/performance
              - img [ref=e72]
              - generic [ref=e75]: Performance
        - generic [ref=e76]:
          - generic [ref=e77]: Data
          - generic [ref=e78]:
            - link "Connections" [ref=e79] [cursor=pointer]:
              - /url: /dashboard/connections
              - img [ref=e80]
              - generic [ref=e84]: Connections
            - link "Relationships" [ref=e85] [cursor=pointer]:
              - /url: /dashboard/relationships
              - img [ref=e86]
              - generic [ref=e89]: Relationships
            - link "Data Prep" [ref=e90] [cursor=pointer]:
              - /url: /dashboard/data-prep
              - img [ref=e91]
              - generic [ref=e93]: Data Prep
        - generic [ref=e94]:
          - generic [ref=e95]: Developer
          - link "OQL Playground" [ref=e97] [cursor=pointer]:
            - /url: /dashboard/oql
            - img [ref=e98]
            - generic [ref=e103]: OQL Playground
        - generic [ref=e104]:
          - generic [ref=e105]: Discovery
          - generic [ref=e106]:
            - link "Data Discovery" [ref=e107] [cursor=pointer]:
              - /url: /dashboard/discovery
              - img [ref=e108]
              - generic [ref=e111]: Data Discovery
            - link "Knowledge Graph" [ref=e112] [cursor=pointer]:
              - /url: /dashboard/discovery/knowledge-graph
              - img [ref=e113]
              - generic [ref=e121]: Knowledge Graph
            - link "Column Matching" [ref=e122] [cursor=pointer]:
              - /url: /dashboard/discovery/knowledge-graph/matches
              - img [ref=e123]
              - generic [ref=e130]: Column Matching
            - link "Relationship Canvas" [ref=e131] [cursor=pointer]:
              - /url: /dashboard/discovery/relationship-canvas
              - img [ref=e132]
              - generic [ref=e136]: Relationship Canvas
            - link "Model Generation" [ref=e137] [cursor=pointer]:
              - /url: /dashboard/discovery/model-generation
              - img [ref=e138]
              - generic [ref=e141]: Model Generation
            - link "Cross-Language" [ref=e142] [cursor=pointer]:
              - /url: /dashboard/discovery/cross-language
              - img [ref=e143]
              - generic [ref=e147]: Cross-Language
            - link "Data Catalog" [ref=e148] [cursor=pointer]:
              - /url: /dashboard/discovery/catalog
              - img [ref=e149]
              - generic [ref=e151]: Data Catalog
        - generic [ref=e152]:
          - generic [ref=e153]: Workspace
          - generic [ref=e154]:
            - link "Sharing" [ref=e155] [cursor=pointer]:
              - /url: /dashboard/sharing
              - img [ref=e156]
              - generic [ref=e161]: Sharing
            - link "Schedules" [ref=e162] [cursor=pointer]:
              - /url: /dashboard/schedules
              - img [ref=e163]
              - generic [ref=e166]: Schedules
            - link "Caching" [ref=e167] [cursor=pointer]:
              - /url: /dashboard/caching
              - img [ref=e168]
              - generic [ref=e172]: Caching
            - link "Embedding" [ref=e173] [cursor=pointer]:
              - /url: /dashboard/embedding
              - img [ref=e174]
              - generic [ref=e177]: Embedding
        - generic [ref=e178]:
          - generic [ref=e179]: AI
          - generic [ref=e180]:
            - link "Model Gateway" [ref=e181] [cursor=pointer]:
              - /url: /dashboard/ai/model-gateway
              - img [ref=e182]
              - generic [ref=e185]: Model Gateway
            - link "Intent Parser" [ref=e186] [cursor=pointer]:
              - /url: /dashboard/ai/intent-parser
              - img [ref=e187]
              - generic [ref=e189]: Intent Parser
            - link "AI Agent" [ref=e190] [cursor=pointer]:
              - /url: /dashboard/ai/agent
              - img [ref=e191]
              - generic [ref=e194]: AI Agent
            - link "Conversations" [ref=e195] [cursor=pointer]:
              - /url: /dashboard/ai/conversations
              - img [ref=e196]
              - generic [ref=e198]: Conversations
        - generic [ref=e199]:
          - generic [ref=e200]: Admin
          - generic [ref=e201]:
            - link "Settings" [ref=e202] [cursor=pointer]:
              - /url: /dashboard/settings
              - img [ref=e203]
              - generic [ref=e206]: Settings
            - link "API Keys" [ref=e207] [cursor=pointer]:
              - /url: /dashboard/settings/api-keys
              - img [ref=e208]
              - generic [ref=e212]: API Keys
            - link "GA Launch" [ref=e213] [cursor=pointer]:
              - /url: /dashboard/settings/ga-launch
              - img [ref=e214]
              - generic [ref=e219]: GA Launch
        - generic [ref=e220]:
          - generic [ref=e221]: Security & Governance
          - generic [ref=e222]:
            - link "Row-Level Security" [ref=e223] [cursor=pointer]:
              - /url: /dashboard/security
              - img [ref=e224]
              - generic [ref=e226]: Row-Level Security
            - link "Column Security" [ref=e227] [cursor=pointer]:
              - /url: /dashboard/security/column-security
              - img [ref=e228]
              - generic [ref=e231]: Column Security
            - link "PII Detection" [ref=e232] [cursor=pointer]:
              - /url: /dashboard/security/pii-scanning
              - img [ref=e233]
              - generic [ref=e240]: PII Detection
            - link "User Attributes" [ref=e241] [cursor=pointer]:
              - /url: /dashboard/security/user-attributes
              - img [ref=e242]
              - generic [ref=e247]: User Attributes
            - link "Compliance" [ref=e248] [cursor=pointer]:
              - /url: /dashboard/security/compliance
              - img [ref=e249]
              - generic [ref=e251]: Compliance
            - link "Audit Trail" [ref=e252] [cursor=pointer]:
              - /url: /dashboard/security/compliance/audit-trail
              - img [ref=e253]
              - generic [ref=e256]: Audit Trail
            - link "Audit Log" [ref=e257] [cursor=pointer]:
              - /url: /dashboard/security/audit
              - img [ref=e258]
              - generic [ref=e261]: Audit Log
      - button "Collapse" [ref=e263] [cursor=pointer]:
        - img [ref=e264]
        - generic [ref=e266]: Collapse
    - generic [ref=e267]:
      - banner [ref=e268]:
        - generic [ref=e270]:
          - img [ref=e271]
          - textbox "Search dashboards, models, connections..." [ref=e274]
          - generic [ref=e275]: /
        - generic [ref=e276]:
          - button "Toggle theme" [ref=e277] [cursor=pointer]:
            - img [ref=e278]
          - button [ref=e284] [cursor=pointer]:
            - img [ref=e285]
          - button "A Admin admin@orbitiq.dev" [ref=e290] [cursor=pointer]:
            - generic [ref=e291]: A
            - generic [ref=e292]:
              - generic [ref=e293]: Admin
              - generic [ref=e294]: admin@orbitiq.dev
      - main [ref=e295]:
        - generic [ref=e296]:
          - generic [ref=e297]:
            - generic [ref=e299]:
              - img [ref=e301]
              - generic [ref=e304]:
                - heading "Model Gateway" [level=1] [ref=e305]
                - paragraph [ref=e306]: Configure and manage your AI provider connections
            - button "Add Provider" [ref=e307] [cursor=pointer]:
              - img [ref=e308]
              - text: Add Provider
          - generic [ref=e309]:
            - generic [ref=e310]:
              - generic [ref=e311]:
                - generic [ref=e312]:
                  - generic [ref=e313]: O
                  - generic [ref=e314]:
                    - heading "OpenAI" [level=3] [ref=e315]
                    - generic [ref=e318]: Active
                - button [ref=e319] [cursor=pointer]
              - generic [ref=e321]:
                - generic [ref=e322]: GPT-4o
                - generic [ref=e323]: GPT-4o Mini
                - generic [ref=e324]: GPT-3.5 Turbo
              - generic [ref=e325]:
                - generic [ref=e326]: sk-***abc123
                - button [ref=e327] [cursor=pointer]:
                  - img [ref=e328]
              - generic [ref=e331]: https://api.openai.com/v1
              - generic [ref=e332]:
                - generic [ref=e333]:
                  - generic [ref=e334]: Requests (30d)
                  - generic [ref=e335]: 1,247
                - generic [ref=e336]:
                  - generic [ref=e337]: Total Cost
                  - generic [ref=e338]: $34.82
              - generic [ref=e339]:
                - button "Test" [ref=e340] [cursor=pointer]:
                  - img [ref=e341]
                  - text: Test
                - button "Edit" [ref=e343] [cursor=pointer]:
                  - img [ref=e344]
                  - text: Edit
                - button "Delete" [ref=e347] [cursor=pointer]:
                  - img [ref=e348]
                  - text: Delete
              - button "3 models" [ref=e351] [cursor=pointer]:
                - img [ref=e352]
                - text: 3 models
            - generic [ref=e354]:
              - generic [ref=e355]:
                - generic [ref=e356]:
                  - generic [ref=e357]: A
                  - generic [ref=e358]:
                    - heading "Anthropic" [level=3] [ref=e359]
                    - generic [ref=e362]: Active
                - button [ref=e363] [cursor=pointer]
              - generic [ref=e365]:
                - generic [ref=e366]: Claude Sonnet 4
                - generic [ref=e367]: Claude 3 Haiku
              - generic [ref=e368]:
                - generic [ref=e369]: sk-ant-***xyz789
                - button [ref=e370] [cursor=pointer]:
                  - img [ref=e371]
              - generic [ref=e374]: https://api.anthropic.com/v1
              - generic [ref=e375]:
                - generic [ref=e376]:
                  - generic [ref=e377]: Requests (30d)
                  - generic [ref=e378]: "834"
                - generic [ref=e379]:
                  - generic [ref=e380]: Total Cost
                  - generic [ref=e381]: $21.56
              - generic [ref=e382]:
                - button "Test" [ref=e383] [cursor=pointer]:
                  - img [ref=e384]
                  - text: Test
                - button "Edit" [ref=e386] [cursor=pointer]:
                  - img [ref=e387]
                  - text: Edit
                - button "Delete" [ref=e390] [cursor=pointer]:
                  - img [ref=e391]
                  - text: Delete
              - button "2 models" [ref=e394] [cursor=pointer]:
                - img [ref=e395]
                - text: 2 models
            - generic [ref=e397]:
              - generic [ref=e398]:
                - generic [ref=e399]:
                  - generic [ref=e400]: L
                  - generic [ref=e401]:
                    - heading "Ollama (Local)" [level=3] [ref=e402]
                    - generic [ref=e405]: Active
                - button [ref=e406] [cursor=pointer]
              - generic [ref=e409]: Llama 3
              - generic [ref=e410]: http://localhost:11434
              - generic [ref=e411]:
                - generic [ref=e412]:
                  - generic [ref=e413]: Requests (30d)
                  - generic [ref=e414]: "156"
                - generic [ref=e415]:
                  - generic [ref=e416]: Total Cost
                  - generic [ref=e417]: $0.00
              - generic [ref=e418]:
                - button "Test" [ref=e419] [cursor=pointer]:
                  - img [ref=e420]
                  - text: Test
                - button "Edit" [ref=e422] [cursor=pointer]:
                  - img [ref=e423]
                  - text: Edit
                - button "Delete" [ref=e426] [cursor=pointer]:
                  - img [ref=e427]
                  - text: Delete
              - button "1 model" [ref=e430] [cursor=pointer]:
                - img [ref=e431]
                - text: 1 model
          - generic [ref=e433]:
            - generic [ref=e434]:
              - img [ref=e435]
              - heading "AI Playground" [level=2] [ref=e437]
            - generic [ref=e438]:
              - generic [ref=e439]:
                - generic [ref=e440]: Prompt
                - textbox "Enter your prompt here..." [ref=e441]
              - generic [ref=e442]:
                - generic [ref=e443]: Response
                - generic [ref=e444]: Response will appear here...
            - generic [ref=e445]:
              - generic [ref=e446]:
                - generic [ref=e447]: Provider
                - combobox [ref=e448]:
                  - option "OpenAI" [selected]
                  - option "Anthropic"
                  - option "Ollama (Local)"
              - generic [ref=e449]:
                - generic [ref=e450]: Model
                - combobox [ref=e451]
              - generic [ref=e452]:
                - generic [ref=e453]: "Temperature: 0.7"
                - slider [ref=e454]: "0.7"
              - generic [ref=e455]:
                - generic [ref=e456]: Max Tokens
                - spinbutton [ref=e457]: "4096"
            - generic [ref=e458]:
              - generic [ref=e459]: System Prompt
              - textbox [ref=e460]: You are a helpful data analytics assistant.
            - generic [ref=e461]:
              - button "Send" [disabled]:
                - img
                - text: Send
          - generic [ref=e462]:
            - generic [ref=e463]:
              - img [ref=e464]
              - heading "Request History" [level=2] [ref=e467]
            - table [ref=e469]:
              - rowgroup [ref=e470]:
                - row "Time Provider Model Prompt Tokens Latency Cost Status" [ref=e471]:
                  - columnheader "Time" [ref=e472]
                  - columnheader "Provider" [ref=e473]
                  - columnheader "Model" [ref=e474]
                  - columnheader "Prompt" [ref=e475]
                  - columnheader "Tokens" [ref=e476]
                  - columnheader "Latency" [ref=e477]
                  - columnheader "Cost" [ref=e478]
                  - columnheader "Status" [ref=e479]
              - rowgroup [ref=e480]:
                - row "2 hours ago OpenAI gpt-4o Explain the difference between star and snowflake schemas in data warehousing. 245 1230ms $0.00245" [ref=e481]:
                  - cell "2 hours ago" [ref=e482]
                  - cell "OpenAI" [ref=e483]
                  - cell "gpt-4o" [ref=e484]
                  - cell "Explain the difference between star and snowflake schemas in data warehousing." [ref=e485]
                  - cell "245" [ref=e486]
                  - cell "1230ms" [ref=e487]
                  - cell "$0.00245" [ref=e488]
                  - cell [ref=e489]:
                    - img [ref=e490]
                - row "5 hours ago Anthropic claude-sonnet-4-20250514 Generate a SQL query to find the top 10 customers by revenue in the last quarter. 189 980ms $0.00189" [ref=e493]:
                  - cell "5 hours ago" [ref=e494]
                  - cell "Anthropic" [ref=e495]
                  - cell "claude-sonnet-4-20250514" [ref=e496]
                  - cell "Generate a SQL query to find the top 10 customers by revenue in the last quarter." [ref=e497]
                  - cell "189" [ref=e498]
                  - cell "980ms" [ref=e499]
                  - cell "$0.00189" [ref=e500]
                  - cell [ref=e501]:
                    - img [ref=e502]
                - row "8 hours ago OpenAI gpt-4o-mini Summarize the key metrics from this sales report data. 156 650ms $0.00016" [ref=e505]:
                  - cell "8 hours ago" [ref=e506]
                  - cell "OpenAI" [ref=e507]
                  - cell "gpt-4o-mini" [ref=e508]
                  - cell "Summarize the key metrics from this sales report data." [ref=e509]
                  - cell "156" [ref=e510]
                  - cell "650ms" [ref=e511]
                  - cell "$0.00016" [ref=e512]
                  - cell [ref=e513]:
                    - img [ref=e514]
                - row "12 hours ago Ollama (Local) llama3 What are best practices for indexing PostgreSQL databases? 201 3450ms $0.00000" [ref=e517]:
                  - cell "12 hours ago" [ref=e518]
                  - cell "Ollama (Local)" [ref=e519]
                  - cell "llama3" [ref=e520]
                  - cell "What are best practices for indexing PostgreSQL databases?" [ref=e521]
                  - cell "201" [ref=e522]
                  - cell "3450ms" [ref=e523]
                  - cell "$0.00000" [ref=e524]
                  - cell [ref=e525]:
                    - img [ref=e526]
                - row "1 day ago OpenAI gpt-4o Help me design a real-time dashboard for monitoring API performance. - - -" [ref=e529]:
                  - cell "1 day ago" [ref=e530]
                  - cell "OpenAI" [ref=e531]
                  - cell "gpt-4o" [ref=e532]
                  - cell "Help me design a real-time dashboard for monitoring API performance." [ref=e533]
                  - cell "-" [ref=e534]
                  - cell "-" [ref=e535]
                  - cell "-" [ref=e536]
                  - cell [ref=e537]:
                    - img [ref=e538]
          - generic [ref=e542]:
            - generic [ref=e543]:
              - img [ref=e544]
              - heading "Cost Summary" [level=2] [ref=e546]
            - generic [ref=e547]:
              - generic [ref=e548]:
                - generic [ref=e549]: Total Cost
                - generic [ref=e550]: $56.38
              - generic [ref=e551]:
                - generic [ref=e552]: Total Requests
                - generic [ref=e553]: 2,237
              - generic [ref=e554]:
                - generic [ref=e555]: Total Tokens
                - generic [ref=e556]: 1.2M
              - generic [ref=e557]:
                - generic [ref=e558]: Avg Cost/Request
                - generic [ref=e559]: $0.0252
            - generic [ref=e560]:
              - generic [ref=e562]:
                - generic [ref=e563]: OpenAI
                - generic [ref=e564]: $34.82
              - generic [ref=e568]:
                - generic [ref=e569]: Anthropic
                - generic [ref=e570]: $21.56
              - generic [ref=e574]:
                - generic [ref=e575]: Ollama (Local)
                - generic [ref=e576]: $0.00
  - alert [ref=e578]
```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | 
  3   | test.describe("OrbitIQ Platform", () => {
  4   |   test("homepage loads with title and navigation", async ({ page }) => {
  5   |     await page.goto("/");
  6   |     await expect(page).toHaveTitle(/OrbitIQ/);
  7   |     await expect(page.locator("h1").first()).toBeVisible();
  8   |   });
  9   | 
  10  |   test("dashboard page loads", async ({ page }) => {
  11  |     await page.goto("/dashboard");
  12  |     await expect(page.locator("text=Dashboard")).toBeVisible();
  13  |   });
  14  | 
  15  |   test("sidebar navigation is visible", async ({ page }) => {
  16  |     await page.goto("/dashboard");
  17  |     const sidebar = page.locator("nav").first();
  18  |     await expect(sidebar).toBeVisible();
  19  |   });
  20  | 
  21  |   test("explore page loads", async ({ page }) => {
  22  |     await page.goto("/dashboard/explore");
  23  |     await expect(page.locator("text=Explore")).toBeVisible();
  24  |   });
  25  | 
  26  |   test("models page loads", async ({ page }) => {
  27  |     await page.goto("/dashboard/models");
  28  |     await expect(page.locator("text=Models")).toBeVisible();
  29  |   });
  30  | 
  31  |   test("connections page loads", async ({ page }) => {
  32  |     await page.goto("/dashboard/connections");
  33  |     await expect(page.locator("text=Connections")).toBeVisible();
  34  |   });
  35  | 
  36  |   test("relationships page loads", async ({ page }) => {
  37  |     await page.goto("/dashboard/relationships");
  38  |     await expect(page.locator("text=Relationships")).toBeVisible();
  39  |   });
  40  | 
  41  |   test("OQL playground loads", async ({ page }) => {
  42  |     await page.goto("/dashboard/oql");
  43  |     await expect(page.locator("text=OQL")).toBeVisible();
  44  |   });
  45  | 
  46  |   test("forecasting page loads", async ({ page }) => {
  47  |     await page.goto("/dashboard/analytics/forecasting");
  48  |     await expect(page.locator("text=Forecasting")).toBeVisible();
  49  |   });
  50  | 
  51  |   test("hypothesis testing page loads", async ({ page }) => {
  52  |     await page.goto("/dashboard/analytics/hypothesis-testing");
  53  |     await expect(page.locator("text=Hypothesis")).toBeVisible();
  54  |   });
  55  | 
  56  |   test("experiments page loads", async ({ page }) => {
  57  |     await page.goto("/dashboard/analytics/experiments");
  58  |     await expect(page.locator("text=Experiment")).toBeVisible();
  59  |   });
  60  | 
  61  |   test("ML page loads", async ({ page }) => {
  62  |     await page.goto("/dashboard/analytics/ml");
  63  |     await expect(page.locator("text=Machine Learning")).toBeVisible();
  64  |   });
  65  | 
  66  |   test("federated query page loads", async ({ page }) => {
  67  |     await page.goto("/dashboard/analytics/federation");
  68  |     await expect(page.locator("text=Federated")).toBeVisible();
  69  |   });
  70  | 
  71  |   test("performance page loads", async ({ page }) => {
  72  |     await page.goto("/dashboard/analytics/performance");
  73  |     await expect(page.locator("text=Performance")).toBeVisible();
  74  |   });
  75  | 
  76  |   test("model gateway page loads", async ({ page }) => {
  77  |     await page.goto("/dashboard/ai/model-gateway");
> 78  |     await expect(page.locator("text=Model Gateway")).toBeVisible();
      |                                                      ^ Error: expect(locator).toBeVisible() failed
  79  |   });
  80  | 
  81  |   test("intent parser page loads", async ({ page }) => {
  82  |     await page.goto("/dashboard/ai/intent-parser");
  83  |     await expect(page.locator("text=Intent Parser")).toBeVisible();
  84  |   });
  85  | 
  86  |   test("AI agent page loads", async ({ page }) => {
  87  |     await page.goto("/dashboard/ai/agent");
  88  |     await expect(page.locator("text=AI Agent")).toBeVisible();
  89  |   });
  90  | 
  91  |   test("conversations page loads", async ({ page }) => {
  92  |     await page.goto("/dashboard/ai/conversations");
  93  |     await expect(page.locator("text=Conversations")).toBeVisible();
  94  |   });
  95  | 
  96  |   test("RLS page loads", async ({ page }) => {
  97  |     await page.goto("/dashboard/security");
  98  |     await expect(page.locator("text=Security")).toBeVisible();
  99  |   });
  100 | 
  101 |   test("column security page loads", async ({ page }) => {
  102 |     await page.goto("/dashboard/security/column-security");
  103 |     await expect(page.locator("text=Column Security")).toBeVisible();
  104 |   });
  105 | 
  106 |   test("PII detection page loads", async ({ page }) => {
  107 |     await page.goto("/dashboard/security/pii-scanning");
  108 |     await expect(page.locator("text=PII")).toBeVisible();
  109 |   });
  110 | 
  111 |   test("compliance page loads", async ({ page }) => {
  112 |     await page.goto("/dashboard/security/compliance");
  113 |     await expect(page.locator("text=Compliance")).toBeVisible();
  114 |   });
  115 | 
  116 |   test("sharing page loads", async ({ page }) => {
  117 |     await page.goto("/dashboard/sharing");
  118 |     await expect(page.locator("text=Sharing")).toBeVisible();
  119 |   });
  120 | 
  121 |   test("caching page loads", async ({ page }) => {
  122 |     await page.goto("/dashboard/caching");
  123 |     await expect(page.locator("text=Caching")).toBeVisible();
  124 |   });
  125 | 
  126 |   test("embedding page loads", async ({ page }) => {
  127 |     await page.goto("/dashboard/embedding");
  128 |     await expect(page.locator("text=Embedding")).toBeVisible();
  129 |   });
  130 | 
  131 |   test("data discovery page loads", async ({ page }) => {
  132 |     await page.goto("/dashboard/discovery");
  133 |     await expect(page.locator("text=Data Discovery")).toBeVisible();
  134 |   });
  135 | 
  136 |   test("knowledge graph page loads", async ({ page }) => {
  137 |     await page.goto("/dashboard/discovery/knowledge-graph");
  138 |     await expect(page.locator("text=Knowledge Graph")).toBeVisible();
  139 |   });
  140 | 
  141 |   test("model generation page loads", async ({ page }) => {
  142 |     await page.goto("/dashboard/discovery/model-generation");
  143 |     await expect(page.locator("text=Model Generation")).toBeVisible();
  144 |   });
  145 | 
  146 |   test("data catalog page loads", async ({ page }) => {
  147 |     await page.goto("/dashboard/discovery/catalog");
  148 |     await expect(page.locator("text=Data Catalog")).toBeVisible();
  149 |   });
  150 | 
  151 |   test("GA launch page loads", async ({ page }) => {
  152 |     await page.goto("/dashboard/settings/ga-launch");
  153 |     await expect(page.locator("text=GA Launch")).toBeVisible();
  154 |   });
  155 | });
  156 | 
  157 | test.describe("GraphQL API", () => {
  158 |   const API_URL = "http://localhost:4001/graphql";
  159 | 
  160 |   test("introspection query returns schema", async ({ request }) => {
  161 |     const response = await request.post(API_URL, {
  162 |       data: { query: "{ __typename }" },
  163 |     });
  164 |     const body = await response.json();
  165 |     expect(body.data.__typename).toBe("Query");
  166 |   });
  167 | 
  168 |   test("GA report query returns data", async ({ request }) => {
  169 |     const response = await request.post(API_URL, {
  170 |       data: {
  171 |         query:
  172 |           '{ gaReport { overallStatus totalChecks passed failed warnings } }',
  173 |       },
  174 |     });
  175 |     const body = await response.json();
  176 |     expect(body.data.gaReport).toBeDefined();
  177 |     expect(body.data.gaReport.totalChecks).toBeGreaterThan(0);
  178 |     expect(body.data.gaReport.passed).toBeGreaterThan(0);
```