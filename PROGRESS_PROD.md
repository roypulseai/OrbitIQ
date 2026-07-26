# OrbitIQ — Production Buildout Progress

> **Status: 🟡 IN PROGRESS — Phase A (Real Data In)**
> **Last Updated: 2026-07-26**
> **Plan:** See `OrbitIQ_Production_Buildout_Plan.md` for full context.

---

## Phase Overview

| Phase | Name | Duration | Status | Exit Criterion |
|-------|------|----------|--------|----------------|
| **A** | Real Data In | 4-6 weeks | 🟡 In Progress | User can upload Excel or connect real Postgres DB and see real sampled data + inferred schema |
| **B** | Real Query Path | 4-6 weeks | ⬜ Not Started | Dashboard tile shows real numbers from real sources, RLS enforced, complex measures work |
| **C** | Real Analytics Engine | 4-6 weeks | ⬜ Not Started | Forecast on real data returns backtested, verifiably correct numbers |
| **D** | Real Agentic AI | 4-6 weeks | ⬜ Not Started | NL question against real dataset produces correct chart matching hand-built query |
| **E** | Scale, Compliance, GA | 4-6 weeks | ⬜ Not Started | Real load tests, real security audit, GA checklist against real subsystems |

---

## Phase A — Real Data In (4-6 weeks)

### A.1 Mock Audit & Status Tagging
- [x] Audit each resolver's true implementation state
- [x] Create `MOCK_AUDIT.md` with findings (41 of 43 services are mock)
- [ ] Add `status: "mock" | "real"` field to every existing service
- [ ] Update GA checklist to reflect real vs mock status

### A.2 Real Database Connectors
- [x] **PostgreSQL connector** — already implemented in connector-sdk with real `pg` driver
  - [x] `testConnection()` — real TCP connect + auth via `pg.Pool`
  - [x] `listSchemas()` — real `information_schema.schemata` query
  - [x] `listTables()` — real `information_schema.tables` query
  - [x] `listColumns()` — real `information_schema.columns` query with PK/FK detection
  - [x] `sampleData()` — streaming cursor
  - [x] `executeQuery()` — parameterized query with `pg.Pool`
  - [ ] Test against Dockerized PostgreSQL with 10M+ row dataset
- [x] **MySQL connector** — already implemented in connector-sdk with real `mysql2/promise` driver
  - [x] All interface methods real
  - [ ] Test against Dockerized MySQL with large dataset
- [x] **DuckDB connector** — NEW, in-process OLAP engine
  - [x] `testConnection()` — real DuckDB version check
  - [x] `listSchemas()` — real `information_schema.schemata`
  - [x] `listTables()` — real `information_schema.tables`
  - [x] `listColumns()` — real `information_schema.columns`
  - [x] `sampleData()` — real DuckDB query
  - [x] `executeQuery()` — real DuckDB query execution
- [ ] **Snowflake connector** — real `snowflake-sdk` calls (driver not yet installed)
- [ ] **BigQuery connector** — real `@google-cloud/bigquery` calls (driver not yet installed)
- [ ] **New: Redshift** — `pg` wire-compatible + UNLOAD-to-S3 path
- [ ] **New: SQL Server** — `mssql` (Tedious) driver
- [ ] **New: ClickHouse** — `@clickhouse/client`
- [ ] **New: Oracle** — `oracledb`

### A.3 File & Spreadsheet Ingestion (NEW — from scratch)
- [x] **Upload pipeline** — file upload via REST endpoint
  - [x] Multipart upload support via `@nestjs/platform-express` + `multer`
  - [x] File type validation (CSV, TSV, XLSX, XLS, Parquet, JSON)
  - [x] Stored to local filesystem (production: S3/GCS/MinIO)
- [x] **CSV/TSV ingestion**
  - [x] `papaparse` for parsing with auto-delimiter detection
  - [x] Header row detection
  - [x] Null/blank handling
- [x] **Excel ingestion**
  - [x] `exceljs` for .xlsx/.xls
  - [x] Multi-sheet support (reads first sheet)
  - [x] CSV conversion for DuckDB materialization
- [x] **Schema sniffing** (real profiling)
  - [x] Type inference per column (integer/float/boolean/date/datetime/currency/percentage/string)
  - [x] Null percentage calculation
  - [x] Cardinality estimation
  - [x] Format detection (email, phone, URL, ZIP, IP, UUID)
- [x] **Materialization into DuckDB**
  - [x] CSV/TSV: `read_csv_auto()` with auto-delimiter
  - [x] Excel: convert to CSV then `read_csv_auto()`
  - [x] Parquet: `read_parquet()`
  - [x] JSON: `read_json_auto()`
- [ ] **Re-upload / refresh workflow** — "Replace data, keep schema" flow
- [ ] **Schema drift detection** — detect renamed/missing columns on re-upload

### A.4 Real Profiling Pipeline
- [x] Replace hash-based fingerprinting with real type inference
- [x] Real format detection (email, phone, URL, ZIP, IP, UUID)
- [x] Real cardinality counting
- [x] Real null/blank percentage
- [x] Real top-N values with frequency
- [x] Real percentiles for numeric columns (p25, p50, p75, p95)
- [x] Real histogram for numeric columns
- [ ] Profiling results stored in Postgres (currently in-memory)

### A.5 DuckDB Infrastructure
- [x] DuckDB npm bindings installed (`duckdb` ^1.4.4)
- [x] DuckDB connector created in connector-sdk
- [x] IngestionService materializes files into DuckDB
- [ ] DuckDB extensions for Postgres/MySQL/S3 attachment
- [ ] Test cross-source joins via DuckDB

### A.6 Phase A Exit Criteria Verification
- [ ] Upload real Excel file → see real sampled data in Explore
- [ ] Connect real Postgres DB → see real schema + data in Explore
- [x] Schema inference produces correct types for all column categories (tested in IngestionService)
- [ ] 10M+ row table streams without OOM
- [ ] File refresh workflow works end-to-end

---

## Phase B — Real Query Path (4-6 weeks)

### B.1 OQL Compiler — DAX-Equivalent Engine
- [ ] **Confirm current state**: Does OQL support `CALCULATE`/filter-context override?
  - [ ] Audit existing lexer/parser for CALCULATE token support
  - [ ] Audit existing compiler for filter-context threading
- [ ] **Filter context model**
  - [ ] Implement `{ table_filters, ignore_dims, override_dims }` object
  - [ ] Thread context through measure compilation
- [ ] **`CALCULATE` + context transition**
  - [ ] Parse `CALCULATE(expression, filter-modifiers...)`
  - [ ] Recompile inner measure with replaced/merged filter context
  - [ ] Emit as CTE or correlated subquery
- [ ] **Time intelligence functions**
  - [ ] `SAMEPERIODLASTYEAR`, `DATEADD`, `DATESBETWEEN`
  - [ ] `YTD`, `QTD`, `MTD`
  - [ ] `PARALLELPERIOD`, `ROLLINGN`
  - [ ] Require modeled date/calendar table per model
- [ ] **Window/ranking functions**
  - [ ] `RANK`, `DENSERANK` → `RANK() OVER (...)`
  - [ ] `RUNNINGSUM`, `MOVINGAVERAGE` → `SUM(...) OVER (ORDER BY ... ROWS BETWEEN ...)`
  - [ ] `PERCENTOFTOTAL` → window function with SUM OVER ()
- [ ] **Context-clearing functions**
  - [ ] `ALL`, `ALLEXCEPT`, `ALLSELECTED`, `REMOVEFILTERS`, `KEEPPILTERS`
- [ ] **Relationship-aware functions**
  - [ ] `RELATED` — follow relationship to get related column value
  - [ ] `RELATEDTABLE` — get related table filtered to current row
- [ ] **Dependency graph (DAG)**
  - [ ] Parse measure references into real DAG
  - [ ] Detect circular references at save time
  - [ ] Topological ordering for compilation
  - [ ] "Depends on" graph in OQL IDE
- [ ] **Full function library**
  - [ ] Aggregation: SUM, AVG, COUNT, COUNTD, MIN, MAX, MEDIAN, PERCENTILE, STDEV, VARIANCE
  - [ ] Logical: IF, SWITCH, AND, OR, IFERROR
  - [ ] Text: CONCAT, FORMAT, LEFT, RIGHT, MID, TRIM
  - [ ] All context/time/window functions listed above

### B.2 OQL Measure Test Suite (DAX-style)
- [ ] Create benchmark dataset (known ground truth)
- [ ] Write 50+ measure tests across all function categories
- [ ] Test `[Revenue YoY %]` filtered to `Region="EMEA", Year=2024` equals hand-calculated value
- [ ] Run on every PR touching OQL compiler
- [ ] CI gate: test failure = PR blocked

### B.3 OQL IDE Improvements
- [ ] Autocomplete over real measure/column names from semantic model
- [ ] Inline dependency-graph view from real DAG
- [ ] "Translate Excel formula" AI helper (reuse Model Gateway + LLM)

### B.4 Real Query Federation
- [ ] DuckDB in-process engine for moderate federation
  - [ ] Attach Postgres via `postgres_scanner` extension
  - [ ] Attach MySQL via DuckDB MySQL extension
  - [ ] Query S3/Parquet files directly
- [ ] Trino cluster (3 workers) for large-scale federation
  - [ ] Docker Compose for local dev Trino
  - [ ] Query pushdown to Trino
- [ ] Aggregate-awareness query rewrite
  - [ ] Detect when query can be satisfied by pre-aggregated table
  - [ ] Rewrite query to use aggregate table
  - [ ] Verify results match original query

### B.5 Real Governance Enforcement
- [ ] **RLS** — compile policies into actual SQL predicates
  - [ ] Inject `AND region = current_user_region()` clauses
  - [ ] Test: restricted user cannot see restricted rows via any path
- [ ] **CLS** — masking in query engine projection step
  - [ ] Apply masking functions in SQL projection, not frontend
  - [ ] Test: browser dev-tools inspection shows masked values
- [ ] **Audit log** — genuinely append-only
  - [ ] Postgres with no UPDATE/DELETE grants on audit table
  - [ ] Or proper WORM store
- [ ] **Penetration-style test**
  - [ ] Log in as restricted user
  - [ ] Attempt every export/AI/embed path
  - [ ] Confirm restricted rows never appear anywhere

### B.6 Real Caching
- [ ] Redis-backed result cache
  - [ ] Key: compiled SQL + RLS context + data-freshness watermark
  - [ ] Invalidation on CDC events
  - [ ] TTL-based fallback

### B.7 Phase B Exit Criteria Verification
- [ ] Dashboard tile shows real numbers from real connected source
- [ ] RLS policy correctly filters rows for restricted user
- [ ] YoY% measure computes correctly against golden test suite
- [ ] Running total computes correctly
- [ ] Cross-source join via DuckDB works
- [ ] Cache invalidation works correctly

---

## Phase C — Real Analytics Engine (4-6 weeks)

### C.1 FastAPI Analytics Engine Setup
- [ ] New Python service: `apps/analytics-engine/`
- [ ] FastAPI framework with async endpoints
- [ ] Celery + Redis job queue for long-running jobs
- [ ] Arrow Flight / Arrow IPC for data hand-off from Query Engine
- [ ] Docker Compose for local dev
- [ ] OpenAPI schema generation

### C.2 Real Forecasting
- [ ] Replace mock forecast with real `statsmodels` (ARIMA/ETS/SARIMAX)
- [ ] Real `prophet` or `neuralprophet` integration
- [ ] `pmdarima` for auto-ARIMA model selection
- [ ] Real backtesting with held-out window
- [ ] Auto model selection by comparing MAPE/RMSE across candidates
- [ ] Real confidence intervals
- [ ] Test against synthetic dataset with known ground truth

### C.3 Real Hypothesis Testing
- [ ] Real `scipy.stats` test statistic computation
- [ ] Real assumption checks (normality, variance homogeneity)
- [ ] Auto-test-selection driven by assumption checks
- [ ] `pingouin` for additional statistical tests

### C.4 Real A/B Experimentation
- [ ] Real power analysis (`statsmodels.stats.power`)
- [ ] Real p-value/CI computation from actual variant data
- [ ] Sequential testing option
- [ ] Bayesian mode with `PyMC` (optional)

### C.5 Real Supervised ML
- [ ] Real train/validation split
- [ ] Real leaderboard: `scikit-learn` (Logistic Regression, Random Forest), `xgboost`/`lightgbm`
- [ ] Real SHAP values for feature importance
- [ ] Real metrics: accuracy, precision, recall, F1, AUC-ROC

### C.6 Real Unsupervised ML
- [ ] Real KMeans/HDBSCAN clustering
- [ ] Real silhouette-score-driven cluster-count suggestion
- [ ] `yellowbrick` for diagnostics

### C.7 MLflow Model Registry
- [ ] Self-hosted MLflow backed by Postgres + S3 artifact store
- [ ] Real experiment tracking
- [ ] Model versioning and stage promotion
- [ ] Integration with NestJS resolver (proxy calls)

### C.8 "Push Result Back as Field" Pipeline
- [ ] Completed forecast/cluster-assignment/prediction writable as new column in semantic model
- [ ] Materialized into extract or companion table
- [ ] Chartable like any other field

### C.9 Phase C Exit Criteria Verification
- [ ] Forecast on real data returns backtested numbers
- [ ] RMSE/MAPE are verifiably not random
- [ ] Hypothesis test on real data produces correct p-value
- [ ] ML experiment on real data produces real leaderboard
- [ ] Model registry tracks experiments correctly
- [ ] Prediction can be pushed back as a field

---

## Phase D — Real Agentic AI (4-6 weeks)

### D.1 Real Model Gateway
- [ ] Real HTTP calls to Anthropic (`/v1/messages`)
- [ ] Real HTTP calls to OpenAI (`/v1/chat/completions` or Responses API)
- [ ] Real Ollama/vLLM endpoint for local models
- [ ] Native tool-calling / function-calling format per provider
- [ ] API keys encrypted (AES-256-GCM) — already exists, verify
- [ ] Never log raw keys or full prompts with customer data

### D.2 Real Agent Tool Loop
- [ ] Replace 6 mock tools with real tool execution:
  - [ ] `get_schema(model_id)` → real semantic model introspection
  - [ ] `run_oql_query(oql)` → real OQL compile + execute via Query Federation
  - [ ] `suggest_chart(data_shape)` → rule-based (can stay simple)
  - [ ] `apply_filter(...)` → real query plan mutation
  - [ ] `create_dashboard_tile(...)` → real Dashboard service persistence
  - [ ] `calculate_measure(...)` → real OQL measure compilation
- [ ] Loop: LLM → tool call → real execution → result back to LLM → repeat
- [ ] Cap iterations (6 max) and token/cost budget per session

### D.3 Real Intent Parser
- [ ] Replace pattern-matching with real LLM call via Model Gateway
- [ ] Parse natural language into structured intent using real model
- [ ] Confidence scoring from model response

### D.4 Guardrails (Non-negotiable)
- [ ] LLM never receives raw credentials or unrestricted SQL
- [ ] LLM only calls `run_oql_query` (OQL only compiles against governed semantic model)
- [ ] PII scrubbing pass before any prompt sent to third-party provider
  - [ ] Use same CLS tags used for dashboard masking
- [ ] Prompt-injection test suite
  - [ ] Seed dashboards with adversarial strings
  - [ ] Verify agent never interprets query results as instructions
  - [ ] Treat all tool results as untrusted data
- [ ] Local-model network verification
  - [ ] Canary domain check: zero calls leave VPC when local-only mode is on
  - [ ] Automated check in CI

### D.5 Semantic Fingerprinting — Real Embeddings
- [ ] Replace hash-based similarity with real embeddings
- [ ] `text-embedding-3-small`/`-large` or open model for regulated customers
- [ ] Store in `pgvector` (already in stack)
- [ ] Column-name-to-ontology matching via cosine similarity

### D.6 Knowledge Graph — Real Ontology
- [ ] Expand beyond 8+8 Retail/SaaS entities
- [ ] Real seed set per vertical (finance, healthcare, e-commerce, etc.)
- [ ] Embedding-based entity matching

### D.7 Phase D Exit Criteria Verification
- [ ] NL question against real dataset produces correct chart
- [ ] Agent chart matches hand-built Explore canvas query for same question
- [ ] Prompt injection attempts are blocked
- [ ] PII is scrubbed from prompts
- [ ] Local model mode makes zero external calls

---

## Phase E — Scale, Compliance, GA Hardening (4-6 weeks)

### E.1 Trino Cluster
- [ ] 3-worker Trino cluster in Docker Compose (dev) and Kubernetes (staging)
- [ ] Real query pushdown to Trino
- [ ] Load test against Trino with large datasets

### E.2 Aggregate Awareness
- [ ] Build actual summary/rollup tables
- [ ] Real query-rewrite step
- [ ] Detect when incoming query can be satisfied by smaller pre-aggregated table
- [ ] Verify correctness (aggregate query results match full-table query)

### E.3 Real CDC
- [ ] Debezium connectors for Postgres/MySQL → Kafka
- [ ] Ingestion service consumes CDC events
- [ ] Update materialized extracts incrementally
- [ ] Cloud warehouse: Snowflake Streams / BigQuery CDC for incremental pull

### E.4 Real Load Testing
- [ ] k6 or Locust scripts
- [ ] Real staging cluster with real data volumes (1B+ rows)
- [ ] NFR targets: P95 < 300ms cached, < 3s live, 10K concurrent users
- [ ] Real numbers in report, not simulated

### E.5 Compliance Packs — Real Enforcement
- [ ] GDPR pack: real data residency enforcement, real consent management
- [ ] CCPA pack: real do-not-sell, real DSAR fulfillment
- [ ] DPDP/FADP packs: real policy configs
- [ ] Compliance checks enforceable at query time, not just UI checkboxes

### E.6 Security Hardening
- [ ] Real pen test (automated + manual)
- [ ] Remediate all findings
- [ ] Automated security regression tests on every release

### E.7 Infrastructure
- [ ] Real Kubernetes deployment (EKS/GKE/AKS or on-prem k3s)
- [ ] Real CI/CD: GitHub Actions → container build → ArgoCD sync
- [ ] Real observability: OpenTelemetry → Grafana/Tempo/Loki
- [ ] Real alerting: query latency, job queue depth, connector failure rate
- [ ] Real secrets management: Vault / AWS Secrets Manager
- [ ] Real backups: Postgres automated backups + object storage versioning
- [ ] Documented RTO/RPO

### E.8 Connector Catalog Expansion
- [ ] Target 10+ hand-built high-fidelity connectors
- [ ] Airbyte-protocol compatibility for breadth (Salesforce, HubSpot, Stripe, etc.)
- [ ] Google Sheets (OAuth, live-linked, not one-time upload)

### E.9 Phase E Exit Criteria Verification
- [ ] Load test report with real numbers meeting NFR targets
- [ ] Security audit findings remediated
- [ ] GA checklist re-run against real subsystems (not mocks)
- [ ] All compliance packs enforceable
- [ ] Deployment pipeline works end-to-end

---

## Testing Strategy

### Golden Question Regression Suite
- [ ] Create benchmark dataset with known ground truth
- [ ] Write 50+ NL questions with expected answers
- [ ] Run on every PR touching agent, OQL compiler, or query engine
- [ ] CI gate: regression = PR blocked

### Connector Contract Tests
- [ ] Shared test suite for all connectors
- [ ] Test against Dockerized instances (testcontainers)
- [ ] Tests: connect, list schema, stream 100K+ rows, handle malformed data

### Analytics Accuracy Tests
- [ ] Synthetic datasets with known ground truth
- [ ] Forecast: sine-wave-plus-noise with known best RMSE
- [ ] Assert real pipeline beats naive baseline

### Security Regression Tests
- [ ] Automated RLS/CLS bypass attempts
- [ ] Test every access path (GraphQL, export, embed, AI agent)
- [ ] Run on every release

---

## Key Decisions Log (Production)

| Decision | Rationale | Date |
|----------|-----------|------|
| DuckDB for in-process federation | Zero-infra cross-source joins for most customers | Phase A |
| FastAPI for Analytics Engine | Async, OpenAPI, good for job-oriented endpoints | Phase C |
| Celery + Redis for job queue | Proven, simple, scales horizontally | Phase C |
| Arrow Flight for data hand-off | Zero-copy large result set transfer | Phase C |
| Real embeddings over hash similarity | Accuracy for column-to-ontology matching | Phase D |
| PII scrubbing before LLM calls | Compliance requirement per spec Principle #1 | Phase D |
| Golden-question regression suite | Operationalizes "AI path == manual path" KPI | Testing |

---

## Risk Register

| Risk | Impact | Mitigation | Status |
|------|--------|------------|--------|
| OQL compiler may lack CALCULATE/filter-context | Gates all complex measure claims | Audit immediately in Phase B | 🔴 Open |
| File ingestion scope creep | Timeline slip | Focus on CSV + Excel first, add formats incrementally | 🟡 Monitoring |
| Real LLM costs for agent testing | Budget | Use Ollama for dev, budget Anthropic for staging | 🟡 Monitoring |
| Trino cluster complexity | Operational overhead | Start with DuckDB-only for Phase B, add Trino in Phase E | 🟡 Monitoring |
| Embedding costs for semantic matching | Ongoing cost | Start with text-embedding-3-small (cheapest), upgrade if needed | 🟢 Mitigated |
