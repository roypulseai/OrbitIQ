# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: orbitiq.spec.ts >> OrbitIQ Platform >> federated query page loads
- Location: e2e\orbitiq.spec.ts:66:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.goto: Test timeout of 30000ms exceeded.
Call log:
  - navigating to "http://localhost:3001/dashboard/analytics/federation", waiting until "load"

```

# Page snapshot

```yaml
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
        - button [ref=e280] [cursor=pointer]:
          - img [ref=e281]
        - button "A Admin admin@orbitiq.dev" [ref=e286] [cursor=pointer]:
          - generic [ref=e287]: A
          - generic [ref=e288]:
            - generic [ref=e289]: Admin
            - generic [ref=e290]: admin@orbitiq.dev
    - main [ref=e291]:
      - generic [ref=e292]:
        - generic [ref=e293]:
          - generic [ref=e295]:
            - img [ref=e297]
            - generic [ref=e302]:
              - heading "Federated Query Engine" [level=1] [ref=e303]
              - paragraph [ref=e304]: Auto-select between DuckDB, Trino, and ClickHouse
          - generic [ref=e305]:
            - generic [ref=e306]:
              - img [ref=e307]
              - text: "Cache Hit Rate: 68%"
            - generic [ref=e309]:
              - img [ref=e310]
              - text: 4 cached plans
        - generic [ref=e313]:
          - generic [ref=e314]:
            - generic [ref=e315]:
              - generic [ref=e316]:
                - img [ref=e318]
                - generic [ref=e320]:
                  - heading "DuckDB Local" [level=3] [ref=e321]
                  - paragraph [ref=e322]: duckdb
              - generic [ref=e325]: active
            - generic [ref=e326]:
              - generic [ref=e327]:
                - paragraph [ref=e328]: Latency
                - paragraph [ref=e329]: 25ms
              - generic [ref=e330]:
                - paragraph [ref=e331]: Processed
                - paragraph [ref=e332]: 12,500
            - generic [ref=e334]:
              - generic [ref=e335]: Connections
              - generic [ref=e336]: 12/50
          - generic [ref=e339]:
            - generic [ref=e340]:
              - generic [ref=e341]:
                - img [ref=e343]
                - generic [ref=e346]:
                  - heading "Trino Cluster" [level=3] [ref=e347]
                  - paragraph [ref=e348]: trino
              - generic [ref=e351]: active
            - generic [ref=e352]:
              - generic [ref=e353]:
                - paragraph [ref=e354]: Latency
                - paragraph [ref=e355]: 180ms
              - generic [ref=e356]:
                - paragraph [ref=e357]: Processed
                - paragraph [ref=e358]: 4,200
            - generic [ref=e360]:
              - generic [ref=e361]: Connections
              - generic [ref=e362]: 45/200
          - generic [ref=e365]:
            - generic [ref=e366]:
              - generic [ref=e367]:
                - img [ref=e369]
                - generic [ref=e371]:
                  - heading "ClickHouse Analytics" [level=3] [ref=e372]
                  - paragraph [ref=e373]: clickhouse
              - generic [ref=e376]: active
            - generic [ref=e377]:
              - generic [ref=e378]:
                - paragraph [ref=e379]: Latency
                - paragraph [ref=e380]: 35ms
              - generic [ref=e381]:
                - paragraph [ref=e382]: Processed
                - paragraph [ref=e383]: 8,900
            - generic [ref=e385]:
              - generic [ref=e386]: Connections
              - generic [ref=e387]: 28/100
        - generic [ref=e390]:
          - generic [ref=e391]:
            - heading "Query Editor" [level=2] [ref=e392]
            - generic [ref=e393]:
              - combobox [ref=e394]:
                - option "Auto-Select" [selected]
                - option "DuckDB"
                - option "Trino"
                - option "ClickHouse"
              - button "Execute" [ref=e395] [cursor=pointer]:
                - img [ref=e396]
                - text: Execute
          - textbox "Enter your SQL query..." [ref=e398]: SELECT region, SUM(revenue) as total_revenue, COUNT(*) as order_count FROM sales GROUP BY region ORDER BY total_revenue DESC;
          - generic [ref=e399]:
            - generic [ref=e400]:
              - img [ref=e401]
              - generic [ref=e403]: "Auto-selection:"
              - generic [ref=e404]: Simple query (0 joins) → DuckDB
            - generic [ref=e405]:
              - generic [ref=e408]: DuckDB
              - generic [ref=e411]: Trino
              - generic [ref=e414]: ClickHouse
        - generic [ref=e415]:
          - generic [ref=e416]:
            - generic [ref=e417]:
              - heading "Query Plan Cache" [level=2] [ref=e418]
              - button "Clear Cache" [ref=e419] [cursor=pointer]:
                - img [ref=e420]
                - text: Clear Cache
            - table [ref=e424]:
              - rowgroup [ref=e425]:
                - row "Query Preview Engine Hits Last Accessed Action" [ref=e426]:
                  - columnheader "Query Preview" [ref=e427]
                  - columnheader "Engine" [ref=e428]
                  - columnheader "Hits" [ref=e429]
                  - columnheader "Last Accessed" [ref=e430]
                  - columnheader "Action" [ref=e431]
              - rowgroup [ref=e432]:
                - row "SELECT region, SUM(revenue) FROM sales GROUP BY region → 8 rows SeqScan → HashAggregate → Projection duckdb 3 1 hour ago Invalidate" [ref=e433]:
                  - cell "SELECT region, SUM(revenue) FROM sales GROUP BY region → 8 rows SeqScan → HashAggregate → Projection" [ref=e434]:
                    - paragraph [ref=e435]: SELECT region, SUM(revenue) FROM sales GROUP BY region → 8 rows
                    - paragraph [ref=e436]: SeqScan → HashAggregate → Projection
                  - cell "duckdb" [ref=e437]
                  - cell "3" [ref=e438]
                  - cell "1 hour ago" [ref=e439]
                  - cell "Invalidate" [ref=e440]:
                    - button "Invalidate" [ref=e441] [cursor=pointer]
                - row "Multi-join across sales + customers + products → 1240 rows DistributedJoin → Filter → Sort → Limit trino 2 2 hours ago Invalidate" [ref=e442]:
                  - cell "Multi-join across sales + customers + products → 1240 rows DistributedJoin → Filter → Sort → Limit" [ref=e443]:
                    - paragraph [ref=e444]: Multi-join across sales + customers + products → 1240 rows
                    - paragraph [ref=e445]: DistributedJoin → Filter → Sort → Limit
                  - cell "trino" [ref=e446]
                  - cell "2" [ref=e447]
                  - cell "2 hours ago" [ref=e448]
                  - cell "Invalidate" [ref=e449]:
                    - button "Invalidate" [ref=e450] [cursor=pointer]
                - row "Real-time events aggregation → 48 time buckets MergeTree → AggregationMerge → Final clickhouse 5 30 min ago Invalidate" [ref=e451]:
                  - cell "Real-time events aggregation → 48 time buckets MergeTree → AggregationMerge → Final" [ref=e452]:
                    - paragraph [ref=e453]: Real-time events aggregation → 48 time buckets
                    - paragraph [ref=e454]: MergeTree → AggregationMerge → Final
                  - cell "clickhouse" [ref=e455]
                  - cell "5" [ref=e456]
                  - cell "30 min ago" [ref=e457]
                  - cell "Invalidate" [ref=e458]:
                    - button "Invalidate" [ref=e459] [cursor=pointer]
                - row "Single-table SELECT with WHERE → 156 rows IndexScan → Projection duckdb 8 15 min ago Invalidate" [ref=e460]:
                  - cell "Single-table SELECT with WHERE → 156 rows IndexScan → Projection" [ref=e461]:
                    - paragraph [ref=e462]: Single-table SELECT with WHERE → 156 rows
                    - paragraph [ref=e463]: IndexScan → Projection
                  - cell "duckdb" [ref=e464]
                  - cell "8" [ref=e465]
                  - cell "15 min ago" [ref=e466]
                  - cell "Invalidate" [ref=e467]:
                    - button "Invalidate" [ref=e468] [cursor=pointer]
            - generic [ref=e470]:
              - generic [ref=e471]:
                - paragraph [ref=e472]: Total Queries
                - paragraph [ref=e473]: 25,600
              - generic [ref=e474]:
                - paragraph [ref=e475]: Cache Hits
                - paragraph [ref=e476]: "18"
              - generic [ref=e477]:
                - paragraph [ref=e478]: Misses
                - paragraph [ref=e479]: "7"
              - generic [ref=e480]:
                - paragraph [ref=e481]: Hit Rate
                - paragraph [ref=e482]: 68%
          - generic [ref=e483]:
            - heading "Engine Health Monitor" [level=2] [ref=e485]
            - generic [ref=e486]:
              - generic [ref=e487]:
                - generic [ref=e488]:
                  - generic [ref=e489]:
                    - img [ref=e490]
                    - generic [ref=e492]: DuckDB Local
                  - generic [ref=e495]: Operational
                - generic [ref=e496]:
                  - generic [ref=e497]:
                    - paragraph [ref=e498]: Latency
                    - paragraph [ref=e499]: 25ms
                  - generic [ref=e500]:
                    - paragraph [ref=e501]: Uptime
                    - paragraph [ref=e502]: 99.9%
                  - generic [ref=e503]:
                    - paragraph [ref=e504]: Queries/24h
                    - paragraph [ref=e505]: 1,000
                - generic [ref=e507]:
                  - generic [ref=e508]: Uptime
                  - generic [ref=e509]: 99.9%
              - generic [ref=e512]:
                - generic [ref=e513]:
                  - generic [ref=e514]:
                    - img [ref=e515]
                    - generic [ref=e518]: Trino Cluster
                  - generic [ref=e521]: Operational
                - generic [ref=e522]:
                  - generic [ref=e523]:
                    - paragraph [ref=e524]: Latency
                    - paragraph [ref=e525]: 180ms
                  - generic [ref=e526]:
                    - paragraph [ref=e527]: Uptime
                    - paragraph [ref=e528]: 99.9%
                  - generic [ref=e529]:
                    - paragraph [ref=e530]: Queries/24h
                    - paragraph [ref=e531]: "336"
                - generic [ref=e533]:
                  - generic [ref=e534]: Uptime
                  - generic [ref=e535]: 99.9%
              - generic [ref=e538]:
                - generic [ref=e539]:
                  - generic [ref=e540]:
                    - img [ref=e541]
                    - generic [ref=e543]: ClickHouse Analytics
                  - generic [ref=e546]: Operational
                - generic [ref=e547]:
                  - generic [ref=e548]:
                    - paragraph [ref=e549]: Latency
                    - paragraph [ref=e550]: 35ms
                  - generic [ref=e551]:
                    - paragraph [ref=e552]: Uptime
                    - paragraph [ref=e553]: 99.9%
                  - generic [ref=e554]:
                    - paragraph [ref=e555]: Queries/24h
                    - paragraph [ref=e556]: "712"
                - generic [ref=e558]:
                  - generic [ref=e559]: Uptime
                  - generic [ref=e560]: 99.9%
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
> 67  |     await page.goto("/dashboard/analytics/federation");
      |                ^ Error: page.goto: Test timeout of 30000ms exceeded.
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
```