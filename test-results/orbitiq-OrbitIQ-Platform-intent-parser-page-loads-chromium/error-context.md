# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: orbitiq.spec.ts >> OrbitIQ Platform >> intent parser page loads
- Location: e2e\orbitiq.spec.ts:81:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=Intent Parser')
Expected: visible
Error: strict mode violation: locator('text=Intent Parser') resolved to 2 elements:
    1) <span>Intent Parser</span> aka getByRole('link', { name: 'Intent Parser' })
    2) <h1 class="text-2xl font-bold text-white tracking-tight">Intent Parser</h1> aka getByRole('heading', { name: 'Intent Parser' })

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=Intent Parser')

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
          - generic [ref=e299]:
            - img [ref=e301]
            - generic [ref=e303]:
              - heading "Intent Parser" [level=1] [ref=e304]
              - paragraph [ref=e305]: Natural language to query — powered by AI
          - generic [ref=e306]:
            - textbox "Ask a question about your data..." [ref=e307]
            - generic [ref=e308]:
              - generic [ref=e309]:
                - button "Show total revenue by region" [ref=e310] [cursor=pointer]
                - button "What's the churn trend?" [ref=e311] [cursor=pointer]
                - button "Compare US vs EU sales" [ref=e312] [cursor=pointer]
                - button "Top 10 customers by LTV" [ref=e313] [cursor=pointer]
                - button "Forecast next quarter MRR" [ref=e314] [cursor=pointer]
              - button "Parse" [disabled]:
                - img
                - text: Parse
          - generic [ref=e315]:
            - generic [ref=e316]:
              - img [ref=e317]
              - heading "Recent Intents" [level=2] [ref=e320]
            - table [ref=e322]:
              - rowgroup [ref=e323]:
                - row "Time Query Intent Confidence Visualization Actions" [ref=e324]:
                  - columnheader "Time" [ref=e325]
                  - columnheader "Query" [ref=e326]
                  - columnheader "Intent" [ref=e327]
                  - columnheader "Confidence" [ref=e328]
                  - columnheader "Visualization" [ref=e329]
                  - columnheader "Actions" [ref=e330]
              - rowgroup [ref=e331]:
                - row "2 hours ago Show me total revenue by region for Q1 2026 aggregate 92% bar" [ref=e332]:
                  - cell "2 hours ago" [ref=e333]
                  - cell "Show me total revenue by region for Q1 2026" [ref=e334]
                  - cell "aggregate" [ref=e335]
                  - cell "92%" [ref=e336]:
                    - generic [ref=e340]: 92%
                  - cell "bar" [ref=e341]
                  - cell [ref=e342]:
                    - button [ref=e343] [cursor=pointer]:
                      - img [ref=e344]
                - row "5 hours ago What's the churn rate trend over the last 12 months? trend 88% line" [ref=e346]:
                  - cell "5 hours ago" [ref=e347]
                  - cell "What's the churn rate trend over the last 12 months?" [ref=e348]
                  - cell "trend" [ref=e349]
                  - cell "88%" [ref=e350]:
                    - generic [ref=e354]: 88%
                  - cell "line" [ref=e355]
                  - cell [ref=e356]:
                    - button [ref=e357] [cursor=pointer]:
                      - img [ref=e358]
                - row "8 hours ago Compare revenue between US and EU regions compare 90% bar" [ref=e360]:
                  - cell "8 hours ago" [ref=e361]
                  - cell "Compare revenue between US and EU regions" [ref=e362]
                  - cell "compare" [ref=e363]
                  - cell "90%" [ref=e364]:
                    - generic [ref=e368]: 90%
                  - cell "bar" [ref=e369]
                  - cell [ref=e370]:
                    - button [ref=e371] [cursor=pointer]:
                      - img [ref=e372]
                - row "1 day ago List all customers with lifetime value above $10,000 query 95% table" [ref=e374]:
                  - cell "1 day ago" [ref=e375]
                  - cell "List all customers with lifetime value above $10,000" [ref=e376]
                  - cell "query" [ref=e377]
                  - cell "95%" [ref=e378]:
                    - generic [ref=e382]: 95%
                  - cell "table" [ref=e383]
                  - cell [ref=e384]:
                    - button [ref=e385] [cursor=pointer]:
                      - img [ref=e386]
                - row "1 day ago Forecast next quarter's MRR based on current trends forecast 75% line" [ref=e388]:
                  - cell "1 day ago" [ref=e389]
                  - cell "Forecast next quarter's MRR based on current trends" [ref=e390]
                  - cell "forecast" [ref=e391]
                  - cell "75%" [ref=e392]:
                    - generic [ref=e396]: 75%
                  - cell "line" [ref=e397]
                  - cell [ref=e398]:
                    - button [ref=e399] [cursor=pointer]:
                      - img [ref=e400]
          - generic [ref=e402]:
            - generic [ref=e403]:
              - generic [ref=e404]:
                - img [ref=e405]
                - generic [ref=e407]: Total Intents
              - generic [ref=e408]: "247"
            - generic [ref=e409]:
              - generic [ref=e410]:
                - img [ref=e411]
                - generic [ref=e415]: Avg Confidence
              - generic [ref=e416]: 88%
            - generic [ref=e417]:
              - generic [ref=e418]:
                - img [ref=e419]
                - generic [ref=e421]: Queries This Week
              - generic [ref=e422]: "42"
            - generic [ref=e423]:
              - generic [ref=e424]:
                - img [ref=e425]
                - generic [ref=e428]: Top Intent
              - generic [ref=e429]: aggregate
  - alert [ref=e430]
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
  78  |     await expect(page.locator("text=Model Gateway")).toBeVisible();
  79  |   });
  80  | 
  81  |   test("intent parser page loads", async ({ page }) => {
  82  |     await page.goto("/dashboard/ai/intent-parser");
> 83  |     await expect(page.locator("text=Intent Parser")).toBeVisible();
      |                                                      ^ Error: expect(locator).toBeVisible() failed
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
  179 |   });
  180 | 
  181 |   test("compliance packs query returns data", async ({ request }) => {
  182 |     const response = await request.post(API_URL, {
  183 |       data: {
```