# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: orbitiq.spec.ts >> OrbitIQ Platform >> data discovery page loads
- Location: e2e\orbitiq.spec.ts:131:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=Data Discovery')
Expected: visible
Error: strict mode violation: locator('text=Data Discovery') resolved to 2 elements:
    1) <span>Data Discovery</span> aka getByRole('link', { name: 'Data Discovery' })
    2) <h1 class="text-2xl font-bold text-white">Data Discovery</h1> aka getByRole('heading', { name: 'Data Discovery' })

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=Data Discovery')

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
          - generic [ref=e294]:
            - heading "Data Discovery" [level=1] [ref=e295]
            - paragraph [ref=e296]: Automated profiling and semantic analysis of connected data sources
          - button "Run Discovery" [ref=e297] [cursor=pointer]:
            - img [ref=e298]
            - text: Run Discovery
        - generic [ref=e300]:
          - generic [ref=e301]:
            - generic [ref=e302]:
              - generic [ref=e303]: Tables Profiled
              - img [ref=e304]
            - generic [ref=e306]: "24"
          - generic [ref=e307]:
            - generic [ref=e308]:
              - generic [ref=e309]: Columns Analyzed
              - img [ref=e310]
            - generic [ref=e312]: "186"
          - generic [ref=e313]:
            - generic [ref=e314]:
              - generic [ref=e315]: Formats Detected
              - img [ref=e316]
            - generic [ref=e323]: "12"
          - generic [ref=e324]:
            - generic [ref=e325]:
              - generic [ref=e326]: Avg Null %
              - img [ref=e327]
            - generic [ref=e329]: 3.2%
        - generic [ref=e330]:
          - heading "Recent Profiling Jobs" [level=3] [ref=e332]
          - table [ref=e333]:
            - rowgroup [ref=e334]:
              - row "Job ID Connection Status Tables Columns Duration Started" [ref=e335]:
                - columnheader "Job ID" [ref=e336]
                - columnheader "Connection" [ref=e337]
                - columnheader "Status" [ref=e338]
                - columnheader "Tables" [ref=e339]
                - columnheader "Columns" [ref=e340]
                - columnheader "Duration" [ref=e341]
                - columnheader "Started" [ref=e342]
            - rowgroup [ref=e343]:
              - row "abc-123 PostgreSQL Primary completed 8 64 2m 15s 2 hours ago" [ref=e344] [cursor=pointer]:
                - cell "abc-123" [ref=e345]
                - cell "PostgreSQL Primary" [ref=e346]
                - cell "completed" [ref=e347]:
                  - generic [ref=e348]:
                    - img [ref=e349]
                    - text: completed
                - cell "8" [ref=e352]
                - cell "64" [ref=e353]
                - cell "2m 15s" [ref=e354]
                - cell "2 hours ago" [ref=e355]
              - row "def-456 Snowflake Analytics running 3/12 18 15m 15 min ago" [ref=e356] [cursor=pointer]:
                - cell "def-456" [ref=e357]
                - cell "Snowflake Analytics" [ref=e358]
                - cell "running" [ref=e359]:
                  - generic [ref=e360]:
                    - img [ref=e361]
                    - text: running
                - cell "3/12" [ref=e363]
                - cell "18" [ref=e364]
                - cell "15m" [ref=e365]
                - cell "15 min ago" [ref=e366]
              - row "ghi-789 BigQuery Data Lake pending 0/6 0 - just now" [ref=e367] [cursor=pointer]:
                - cell "ghi-789" [ref=e368]
                - cell "BigQuery Data Lake" [ref=e369]
                - cell "pending" [ref=e370]:
                  - generic [ref=e371]:
                    - img [ref=e372]
                    - text: pending
                - cell "0/6" [ref=e375]
                - cell "0" [ref=e376]
                - cell "-" [ref=e377]
                - cell "just now" [ref=e378]
        - generic [ref=e379]:
          - generic [ref=e380]:
            - heading "Profiling Results — Job abc-123" [level=3] [ref=e381]
            - combobox [ref=e382]:
              - option "Customers" [selected]
              - option "Orders"
              - option "Products"
          - generic [ref=e383]:
            - generic [ref=e384]:
              - generic [ref=e385]:
                - generic [ref=e386]: customer_id
                - generic [ref=e387]: integer
              - generic [ref=e388]:
                - generic [ref=e389]: "Cardinality: 10,000"
                - generic [ref=e390]:
                  - text: "Null:"
                  - generic [ref=e391]: 0%
              - generic [ref=e394]:
                - generic [ref=e395]: numeric
                - generic [ref=e396]: 99%
              - generic [ref=e397]:
                - generic [ref=e398]:
                  - generic [ref=e399]: "10001"
                  - generic [ref=e400]: "200"
                - generic [ref=e401]:
                  - generic [ref=e402]: "10002"
                  - generic [ref=e403]: "198"
                - generic [ref=e404]:
                  - generic [ref=e405]: "10003"
                  - generic [ref=e406]: "195"
              - generic [ref=e407]:
                - generic [ref=e408]: "10001"
                - generic [ref=e409]: "10002"
                - generic [ref=e410]: "10042"
            - generic [ref=e411]:
              - generic [ref=e412]:
                - generic [ref=e413]: email
                - generic [ref=e414]: varchar
              - generic [ref=e415]:
                - generic [ref=e416]: "Cardinality: 9,950"
                - generic [ref=e417]:
                  - text: "Null:"
                  - generic [ref=e418]: 0.5%
              - generic [ref=e421]:
                - generic [ref=e422]: email
                - generic [ref=e423]: 98%
              - generic [ref=e424]:
                - generic [ref=e425]:
                  - generic [ref=e426]: john@example.com
                  - generic [ref=e427]: "3"
                - generic [ref=e428]:
                  - generic [ref=e429]: jane@test.com
                  - generic [ref=e430]: "2"
              - generic [ref=e431]:
                - generic [ref=e432]: john@example.com
                - generic [ref=e433]: jane@test.com
                - generic [ref=e434]: bob@demo.io
            - generic [ref=e435]:
              - generic [ref=e436]:
                - generic [ref=e437]: first_name
                - generic [ref=e438]: varchar
              - generic [ref=e439]:
                - generic [ref=e440]: "Cardinality: 8,420"
                - generic [ref=e441]:
                  - text: "Null:"
                  - generic [ref=e442]: 0.2%
              - generic [ref=e445]:
                - generic [ref=e446]: text
                - generic [ref=e447]: 85%
              - generic [ref=e448]:
                - generic [ref=e449]:
                  - generic [ref=e450]: James
                  - generic [ref=e451]: "120"
                - generic [ref=e452]:
                  - generic [ref=e453]: Mary
                  - generic [ref=e454]: "110"
                - generic [ref=e455]:
                  - generic [ref=e456]: John
                  - generic [ref=e457]: "90"
              - generic [ref=e458]:
                - generic [ref=e459]: James
                - generic [ref=e460]: Mary
                - generic [ref=e461]: John
            - generic [ref=e462]:
              - generic [ref=e463]:
                - generic [ref=e464]: phone
                - generic [ref=e465]: varchar
              - generic [ref=e466]:
                - generic [ref=e467]: "Cardinality: 7,800"
                - generic [ref=e468]:
                  - text: "Null:"
                  - generic [ref=e469]: 5.3%
              - generic [ref=e472]:
                - generic [ref=e473]: phone
                - generic [ref=e474]: 92%
              - generic [ref=e475]:
                - generic [ref=e476]:
                  - generic [ref=e477]: +1-555-0123
                  - generic [ref=e478]: "1"
                - generic [ref=e479]:
                  - generic [ref=e480]: +1-555-0456
                  - generic [ref=e481]: "1"
              - generic [ref=e482]:
                - generic [ref=e483]: +1-555-0123
                - generic [ref=e484]: +1-555-0456
            - generic [ref=e485]:
              - generic [ref=e486]:
                - generic [ref=e487]: region
                - generic [ref=e488]: varchar
              - generic [ref=e489]:
                - generic [ref=e490]: "Cardinality: 5"
                - generic [ref=e491]:
                  - text: "Null:"
                  - generic [ref=e492]: 0%
              - generic [ref=e495]:
                - generic [ref=e496]: text
                - generic [ref=e497]: 70%
              - generic [ref=e498]:
                - generic [ref=e499]:
                  - generic [ref=e500]: US
                  - generic [ref=e501]: 4,000
                - generic [ref=e502]:
                  - generic [ref=e503]: EU
                  - generic [ref=e504]: 3,000
                - generic [ref=e505]:
                  - generic [ref=e506]: APAC
                  - generic [ref=e507]: 2,000
              - generic [ref=e508]:
                - generic [ref=e509]: US
                - generic [ref=e510]: EU
                - generic [ref=e511]: APAC
            - generic [ref=e512]:
              - generic [ref=e513]:
                - generic [ref=e514]: created_at
                - generic [ref=e515]: timestamp
              - generic [ref=e516]:
                - generic [ref=e517]: "Cardinality: 9,980"
                - generic [ref=e518]:
                  - text: "Null:"
                  - generic [ref=e519]: 0%
              - generic [ref=e522]:
                - generic [ref=e523]: date
                - generic [ref=e524]: 95%
              - generic [ref=e525]: "Range: 2023-01-15 — 2026-07-20"
              - generic [ref=e526]:
                - generic [ref=e527]: 2024-01-15
                - generic [ref=e528]: 2024-06-20
            - generic [ref=e529]:
              - generic [ref=e530]:
                - generic [ref=e531]: lifetime_value
                - generic [ref=e532]: decimal
              - generic [ref=e533]:
                - generic [ref=e534]: "Cardinality: 8,700"
                - generic [ref=e535]:
                  - text: "Null:"
                  - generic [ref=e536]: 12.5%
              - generic [ref=e539]:
                - generic [ref=e540]: currency
                - generic [ref=e541]: 88%
              - generic [ref=e542]: "Range: $0.00 — $45,230.50 (mean: $1,250.75)"
              - generic [ref=e543]:
                - generic [ref=e544]: $1,250.75
                - generic [ref=e545]: $3,400.00
            - generic [ref=e546]:
              - generic [ref=e547]:
                - generic [ref=e548]: status
                - generic [ref=e549]: varchar
              - generic [ref=e550]:
                - generic [ref=e551]: "Cardinality: 3"
                - generic [ref=e552]:
                  - text: "Null:"
                  - generic [ref=e553]: 0%
              - generic [ref=e556]:
                - generic [ref=e557]: text
                - generic [ref=e558]: 75%
              - generic [ref=e559]:
                - generic [ref=e560]:
                  - generic [ref=e561]: active
                  - generic [ref=e562]: 6,500
                - generic [ref=e563]:
                  - generic [ref=e564]: inactive
                  - generic [ref=e565]: 2,500
                - generic [ref=e566]:
                  - generic [ref=e567]: suspended
                  - generic [ref=e568]: 1,000
              - generic [ref=e569]:
                - generic [ref=e570]: active
                - generic [ref=e571]: inactive
                - generic [ref=e572]: suspended
```

# Test source

```ts
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
> 133 |     await expect(page.locator("text=Data Discovery")).toBeVisible();
      |                                                       ^ Error: expect(locator).toBeVisible() failed
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
  184 |         query: "{ compliancePacks { id name region status coveragePercent } }",
  185 |       },
  186 |     });
  187 |     const body = await response.json();
  188 |     expect(body.data.compliancePacks).toBeDefined();
  189 |     expect(body.data.compliancePacks.length).toBeGreaterThanOrEqual(4);
  190 |   });
  191 | 
  192 |   test("federation engines query returns data", async ({ request }) => {
  193 |     const response = await request.post(API_URL, {
  194 |       data: {
  195 |         query:
  196 |           "{ federationEngines { id name type status avgLatencyMs queriesProcessed } }",
  197 |       },
  198 |     });
  199 |     const body = await response.json();
  200 |     expect(body.data.federationEngines).toBeDefined();
  201 |     expect(body.data.federationEngines.length).toBeGreaterThanOrEqual(3);
  202 |   });
  203 | 
  204 |   test("connector catalog returns data", async ({ request }) => {
  205 |     const response = await request.post(API_URL, {
  206 |       data: {
  207 |         query:
  208 |           "{ connectorCatalog { id name type status version } }",
  209 |       },
  210 |     });
  211 |     const body = await response.json();
  212 |     expect(body.data.connectorCatalog).toBeDefined();
  213 |     expect(body.data.connectorCatalog.length).toBeGreaterThanOrEqual(4);
  214 |   });
  215 | 
  216 |   test("load tests query returns data", async ({ request }) => {
  217 |     const response = await request.post(API_URL, {
  218 |       data: {
  219 |         query:
  220 |           '{ loadTests { id name status concurrentUsers result { p95LatencyMs throughputPerSec errorRate } } }',
  221 |       },
  222 |     });
  223 |     const body = await response.json();
  224 |     expect(body.data.loadTests).toBeDefined();
  225 |     expect(body.data.loadTests.length).toBeGreaterThanOrEqual(2);
  226 |   });
  227 | });
  228 | 
```