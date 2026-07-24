# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: orbitiq.spec.ts >> OrbitIQ Platform >> knowledge graph page loads
- Location: e2e\orbitiq.spec.ts:136:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=Knowledge Graph')
Expected: visible
Error: strict mode violation: locator('text=Knowledge Graph') resolved to 2 elements:
    1) <span>Knowledge Graph</span> aka getByRole('link', { name: 'Knowledge Graph' })
    2) <h1 class="text-2xl font-bold text-white">Knowledge Graph</h1> aka getByRole('heading', { name: 'Knowledge Graph' })

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=Knowledge Graph')

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
            - heading "Knowledge Graph" [level=1] [ref=e295]
            - paragraph [ref=e296]: Industry ontology of canonical business entities and relationships
          - button "Add Entity" [ref=e297] [cursor=pointer]:
            - img [ref=e298]
            - text: Add Entity
        - generic [ref=e299]:
          - generic [ref=e300]:
            - generic [ref=e301]:
              - generic [ref=e302]: Total Entities
              - img [ref=e303]
            - generic [ref=e311]: "16"
          - generic [ref=e312]:
            - generic [ref=e313]:
              - generic [ref=e314]: Relationships
              - img [ref=e315]
            - generic [ref=e319]: "4"
          - generic [ref=e320]:
            - generic [ref=e321]:
              - generic [ref=e322]: Verticals
              - img [ref=e323]
            - generic [ref=e326]: "2"
        - generic [ref=e327]:
          - button "All" [ref=e328] [cursor=pointer]
          - button "Retail" [ref=e329] [cursor=pointer]
          - button "Saas" [ref=e330] [cursor=pointer]
        - img [ref=e332]:
          - generic [ref=e335]: places (1:N)
          - generic [ref=e338]: contains (N:N)
          - generic [ref=e341]: has (1:N)
          - generic [ref=e344]: generates (1:1)
          - generic [ref=e345] [cursor=pointer]:
            - generic [ref=e347]: Customer
            - generic [ref=e348]: entity · 4 synonyms
          - generic [ref=e349] [cursor=pointer]:
            - generic [ref=e351]: Order
            - generic [ref=e352]: entity · 4 synonyms
          - generic [ref=e353] [cursor=pointer]:
            - generic [ref=e355]: Product
            - generic [ref=e356]: entity · 4 synonyms
          - generic [ref=e357] [cursor=pointer]:
            - generic [ref=e359]: Revenue
            - generic [ref=e360]: metric · 4 synonyms
          - generic [ref=e361] [cursor=pointer]:
            - generic [ref=e363]: Quantity
            - generic [ref=e364]: attribute · 3 synonyms
          - generic [ref=e365] [cursor=pointer]:
            - generic [ref=e367]: OrderDate
            - generic [ref=e368]: attribute · 3 synonyms
          - generic [ref=e369] [cursor=pointer]:
            - generic [ref=e371]: Category
            - generic [ref=e372]: attribute · 3 synonyms
          - generic [ref=e373] [cursor=pointer]:
            - generic [ref=e375]: Price
            - generic [ref=e376]: metric · 3 synonyms
          - generic [ref=e377] [cursor=pointer]:
            - generic [ref=e379]: Subscriber
            - generic [ref=e380]: entity · 4 synonyms
          - generic [ref=e381] [cursor=pointer]:
            - generic [ref=e383]: Subscription
            - generic [ref=e384]: entity · 3 synonyms
          - generic [ref=e385] [cursor=pointer]:
            - generic [ref=e387]: MRR
            - generic [ref=e388]: metric · 2 synonyms
          - generic [ref=e389] [cursor=pointer]:
            - generic [ref=e391]: Churn
            - generic [ref=e392]: metric · 3 synonyms
          - generic [ref=e393] [cursor=pointer]:
            - generic [ref=e395]: NRR
            - generic [ref=e396]: metric · 2 synonyms
          - generic [ref=e397] [cursor=pointer]:
            - generic [ref=e399]: FeatureUsage
            - generic [ref=e400]: entity · 3 synonyms
          - generic [ref=e401] [cursor=pointer]:
            - generic [ref=e403]: PlanTier
            - generic [ref=e404]: attribute · 4 synonyms
          - generic [ref=e405] [cursor=pointer]:
            - generic [ref=e407]: BillingCycle
            - generic [ref=e408]: attribute · 3 synonyms
        - generic [ref=e409]:
          - heading "All Entities" [level=3] [ref=e411]
          - table [ref=e412]:
            - rowgroup [ref=e413]:
              - row "Name Type Vertical Synonyms Actions" [ref=e414]:
                - columnheader "Name" [ref=e415]
                - columnheader "Type" [ref=e416]
                - columnheader "Vertical" [ref=e417]
                - columnheader "Synonyms" [ref=e418]
                - columnheader "Actions" [ref=e419]
            - rowgroup [ref=e420]:
              - row "Customer entity retail 4" [ref=e421]:
                - cell "Customer" [ref=e422]
                - cell "entity" [ref=e423]:
                  - generic [ref=e424]: entity
                - cell "retail" [ref=e425]:
                  - generic [ref=e426]: retail
                - cell "4" [ref=e427]
                - cell [ref=e428]:
                  - generic [ref=e429]:
                    - button [ref=e430] [cursor=pointer]:
                      - img [ref=e431]
                    - button [ref=e434] [cursor=pointer]:
                      - img [ref=e435]
              - row "Order entity retail 4" [ref=e438]:
                - cell "Order" [ref=e439]
                - cell "entity" [ref=e440]:
                  - generic [ref=e441]: entity
                - cell "retail" [ref=e442]:
                  - generic [ref=e443]: retail
                - cell "4" [ref=e444]
                - cell [ref=e445]:
                  - generic [ref=e446]:
                    - button [ref=e447] [cursor=pointer]:
                      - img [ref=e448]
                    - button [ref=e451] [cursor=pointer]:
                      - img [ref=e452]
              - row "Product entity retail 4" [ref=e455]:
                - cell "Product" [ref=e456]
                - cell "entity" [ref=e457]:
                  - generic [ref=e458]: entity
                - cell "retail" [ref=e459]:
                  - generic [ref=e460]: retail
                - cell "4" [ref=e461]
                - cell [ref=e462]:
                  - generic [ref=e463]:
                    - button [ref=e464] [cursor=pointer]:
                      - img [ref=e465]
                    - button [ref=e468] [cursor=pointer]:
                      - img [ref=e469]
              - row "Revenue metric retail 4" [ref=e472]:
                - cell "Revenue" [ref=e473]
                - cell "metric" [ref=e474]:
                  - generic [ref=e475]: metric
                - cell "retail" [ref=e476]:
                  - generic [ref=e477]: retail
                - cell "4" [ref=e478]
                - cell [ref=e479]:
                  - generic [ref=e480]:
                    - button [ref=e481] [cursor=pointer]:
                      - img [ref=e482]
                    - button [ref=e485] [cursor=pointer]:
                      - img [ref=e486]
              - row "Quantity attribute retail 3" [ref=e489]:
                - cell "Quantity" [ref=e490]
                - cell "attribute" [ref=e491]:
                  - generic [ref=e492]: attribute
                - cell "retail" [ref=e493]:
                  - generic [ref=e494]: retail
                - cell "3" [ref=e495]
                - cell [ref=e496]:
                  - generic [ref=e497]:
                    - button [ref=e498] [cursor=pointer]:
                      - img [ref=e499]
                    - button [ref=e502] [cursor=pointer]:
                      - img [ref=e503]
              - row "OrderDate attribute retail 3" [ref=e506]:
                - cell "OrderDate" [ref=e507]
                - cell "attribute" [ref=e508]:
                  - generic [ref=e509]: attribute
                - cell "retail" [ref=e510]:
                  - generic [ref=e511]: retail
                - cell "3" [ref=e512]
                - cell [ref=e513]:
                  - generic [ref=e514]:
                    - button [ref=e515] [cursor=pointer]:
                      - img [ref=e516]
                    - button [ref=e519] [cursor=pointer]:
                      - img [ref=e520]
              - row "Category attribute retail 3" [ref=e523]:
                - cell "Category" [ref=e524]
                - cell "attribute" [ref=e525]:
                  - generic [ref=e526]: attribute
                - cell "retail" [ref=e527]:
                  - generic [ref=e528]: retail
                - cell "3" [ref=e529]
                - cell [ref=e530]:
                  - generic [ref=e531]:
                    - button [ref=e532] [cursor=pointer]:
                      - img [ref=e533]
                    - button [ref=e536] [cursor=pointer]:
                      - img [ref=e537]
              - row "Price metric retail 3" [ref=e540]:
                - cell "Price" [ref=e541]
                - cell "metric" [ref=e542]:
                  - generic [ref=e543]: metric
                - cell "retail" [ref=e544]:
                  - generic [ref=e545]: retail
                - cell "3" [ref=e546]
                - cell [ref=e547]:
                  - generic [ref=e548]:
                    - button [ref=e549] [cursor=pointer]:
                      - img [ref=e550]
                    - button [ref=e553] [cursor=pointer]:
                      - img [ref=e554]
              - row "Subscriber entity saas 4" [ref=e557]:
                - cell "Subscriber" [ref=e558]
                - cell "entity" [ref=e559]:
                  - generic [ref=e560]: entity
                - cell "saas" [ref=e561]:
                  - generic [ref=e562]: saas
                - cell "4" [ref=e563]
                - cell [ref=e564]:
                  - generic [ref=e565]:
                    - button [ref=e566] [cursor=pointer]:
                      - img [ref=e567]
                    - button [ref=e570] [cursor=pointer]:
                      - img [ref=e571]
              - row "Subscription entity saas 3" [ref=e574]:
                - cell "Subscription" [ref=e575]
                - cell "entity" [ref=e576]:
                  - generic [ref=e577]: entity
                - cell "saas" [ref=e578]:
                  - generic [ref=e579]: saas
                - cell "3" [ref=e580]
                - cell [ref=e581]:
                  - generic [ref=e582]:
                    - button [ref=e583] [cursor=pointer]:
                      - img [ref=e584]
                    - button [ref=e587] [cursor=pointer]:
                      - img [ref=e588]
              - row "MRR metric saas 2" [ref=e591]:
                - cell "MRR" [ref=e592]
                - cell "metric" [ref=e593]:
                  - generic [ref=e594]: metric
                - cell "saas" [ref=e595]:
                  - generic [ref=e596]: saas
                - cell "2" [ref=e597]
                - cell [ref=e598]:
                  - generic [ref=e599]:
                    - button [ref=e600] [cursor=pointer]:
                      - img [ref=e601]
                    - button [ref=e604] [cursor=pointer]:
                      - img [ref=e605]
              - row "Churn metric saas 3" [ref=e608]:
                - cell "Churn" [ref=e609]
                - cell "metric" [ref=e610]:
                  - generic [ref=e611]: metric
                - cell "saas" [ref=e612]:
                  - generic [ref=e613]: saas
                - cell "3" [ref=e614]
                - cell [ref=e615]:
                  - generic [ref=e616]:
                    - button [ref=e617] [cursor=pointer]:
                      - img [ref=e618]
                    - button [ref=e621] [cursor=pointer]:
                      - img [ref=e622]
              - row "NRR metric saas 2" [ref=e625]:
                - cell "NRR" [ref=e626]
                - cell "metric" [ref=e627]:
                  - generic [ref=e628]: metric
                - cell "saas" [ref=e629]:
                  - generic [ref=e630]: saas
                - cell "2" [ref=e631]
                - cell [ref=e632]:
                  - generic [ref=e633]:
                    - button [ref=e634] [cursor=pointer]:
                      - img [ref=e635]
                    - button [ref=e638] [cursor=pointer]:
                      - img [ref=e639]
              - row "FeatureUsage entity saas 3" [ref=e642]:
                - cell "FeatureUsage" [ref=e643]
                - cell "entity" [ref=e644]:
                  - generic [ref=e645]: entity
                - cell "saas" [ref=e646]:
                  - generic [ref=e647]: saas
                - cell "3" [ref=e648]
                - cell [ref=e649]:
                  - generic [ref=e650]:
                    - button [ref=e651] [cursor=pointer]:
                      - img [ref=e652]
                    - button [ref=e655] [cursor=pointer]:
                      - img [ref=e656]
              - row "PlanTier attribute saas 4" [ref=e659]:
                - cell "PlanTier" [ref=e660]
                - cell "attribute" [ref=e661]:
                  - generic [ref=e662]: attribute
                - cell "saas" [ref=e663]:
                  - generic [ref=e664]: saas
                - cell "4" [ref=e665]
                - cell [ref=e666]:
                  - generic [ref=e667]:
                    - button [ref=e668] [cursor=pointer]:
                      - img [ref=e669]
                    - button [ref=e672] [cursor=pointer]:
                      - img [ref=e673]
              - row "BillingCycle attribute saas 3" [ref=e676]:
                - cell "BillingCycle" [ref=e677]
                - cell "attribute" [ref=e678]:
                  - generic [ref=e679]: attribute
                - cell "saas" [ref=e680]:
                  - generic [ref=e681]: saas
                - cell "3" [ref=e682]
                - cell [ref=e683]:
                  - generic [ref=e684]:
                    - button [ref=e685] [cursor=pointer]:
                      - img [ref=e686]
                    - button [ref=e689] [cursor=pointer]:
                      - img [ref=e690]
```

# Test source

```ts
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
  133 |     await expect(page.locator("text=Data Discovery")).toBeVisible();
  134 |   });
  135 | 
  136 |   test("knowledge graph page loads", async ({ page }) => {
  137 |     await page.goto("/dashboard/discovery/knowledge-graph");
> 138 |     await expect(page.locator("text=Knowledge Graph")).toBeVisible();
      |                                                        ^ Error: expect(locator).toBeVisible() failed
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