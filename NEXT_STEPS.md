# OrbitIQ — Immediate Next Steps

> **Created: 2026-07-24**
> **Context:** All 25 sprints complete as POC scaffold (v1.0.0). Production buildout begins now with Phase A.
> **Reference:** `OrbitIQ_Production_Buildout_Plan.md` (full context), `PROGRESS_PROD.md` (phase tracker)

---

## Before Writing Code: Audit Phase

These must be done first to avoid wasting effort building on false assumptions.

### 1. OQL Compiler Reality Check 🔴 CRITICAL
The OQL gap is the single biggest technical risk. A "simple aggregation compiler" cannot support `CALCULATE`, filter-context override, or time intelligence. If this is true, the `complexMeasure` type in the schema is dead code.

- [ ] **Open the OQL compiler source files** and audit for:
  - [ ] Does the lexer recognize `CALCULATE` token?
  - [ ] Does the parser handle `CALCULATE(expression, filter-modifiers...)`?
  - [ ] Is there a filter-context threading model in the compiler?
  - [ ] Does it support time intelligence functions (`SAMEPERIODLASTYEAR`, `DATEADD`, `YTD`, `QTD`, `MTD`)?
  - [ ] Does it support window/ranking functions (`RANK`, `DENSERANK`, `RUNNINGSUM`)?
  - [ ] Does it support context-clearing functions (`ALL`, `ALLEXCEPT`, `REMOVEFILTERS`)?
  - [ ] Does it support `RELATED` and `RELATEDTABLE`?
  - [ ] Is there a dependency graph (DAG) with circular-reference detection?

**Expected answer:** No to most/all of these — this means we need to rewrite the OQL compiler as a real DAX-equivalent engine before any analytics work can be trusted.

### 2. Mock Audit Across All Services
- [ ] Audit each of the 25+ services in `apps/api-gateway/src/services/`:
  - [ ] Which return hard-coded/seeded data?
  - [ ] Which return randomly generated data (even worse — appears real)?
  - [ ] Which actually call external systems?
- [ ] Tag each service with `mock` or `real` status
- [ ] Create `MOCK_AUDIT.md` with findings
- [ ] Verify the GA checklist (`ga-checklist.ts`) doesn't claim subsystems are real when they're mocked

### 3. Connector Driver Status
- [ ] Audit each connector for real driver usage:
  - [ ] PostgreSQL: does it use `pg` driver or mock data?
  - [ ] MySQL: does it use `mysql2` driver or mock data?
  - [ ] Snowflake: does it use `snowflake-sdk` or mock data?
  - [ ] BigQuery: does it use `@google-cloud/bigquery` or mock data?
- [ ] Check if real drivers are even in `package.json`

---

## Phase A Sprint Plan (First 2 Weeks)

### Week 1: Infrastructure + Real Connectors

#### Day 1-2: DuckDB Setup
- [ ] Add `duckdb` npm bindings to API gateway
- [ ] Add DuckDB to `docker-compose.yml`
- [ ] Install DuckDB extensions (`postgres_scanner`, `httpfs`)
- [ ] Verify basic DuckDB operations (create table, insert, query)
- [ ] Create `DuckDBService` that wraps DuckDB operations

#### Day 2-3: PostgreSQL Connector (Real)
- [ ] Audit current PostgreSQL connector (`postgres-connector.ts` or similar)
- [ ] Install `pg` driver if not present
- [ ] Replace mock methods with real implementations:
  - [ ] `testConnection()` — real TCP connect + auth via `pg.Pool`
  - [ ] `listSchemas()` — `SELECT schema_name FROM information_schema.schemata`
  - [ ] `listTables()` — `SELECT table_name, table_type FROM information_schema.tables WHERE schema_name = $1`
  - [ ] `listColumns()` — `SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_schema = $1 AND table_name = $2`
  - [ ] `sampleData()` — `SELECT * FROM schema.table LIMIT 1000` (never `SELECT *` into memory)
  - [ ] `executeQuery()` — parameterized query with streaming cursor
- [ ] Test against Dockerized PostgreSQL with 10M+ row dataset

#### Day 3-4: MySQL Connector (Real)
- [ ] Audit current MySQL connector
- [ ] Install `mysql2` driver if not present
- [ ] Same pattern as PostgreSQL: list schemas, list tables, list columns, sample data, execute query
- [ ] Test against Dockerized MySQL

#### Day 4-5: File Ingestion Pipeline
- [ ] Create new `IngestionService` (does not exist yet)
- [ ] Install `papaparse` (CSV/TSV), `exceljs` (xlsx), `xlsx`/SheetJS (xls)
- [ ] Implement upload endpoint (multipart form)
- [ ] Store files in S3/MinIO/local filesystem
- [ ] Schema sniffing: type inference per column, null percentage, cardinality, format detection
- [ ] Materialize into DuckDB (small files direct, large files → Parquet → external table)
- [ ] Create `apps/api-gateway/src/services/ingestion.service.ts`
- [ ] Create `apps/api-gateway/src/resolvers/ingestion.resolver.ts`
- [ ] Add GraphQL types to `schema.ts`

### Week 2: Frontend + Integration

#### Day 1-2: Connection Form UI
- [ ] Audit current `ConnectionForm` component
- [ ] Make it dynamic (already planned in Sprint 4)
- [ ] Add real `testConnection` call
- [ ] Add file upload component (drag-and-drop)
- [ ] Add Excel sheet selector

#### Day 2-3: Upload UI
- [ ] Create upload page/flow in the web app
- [ ] File drop zone with progress indicator
- [ ] Preview of schema sniffing results (detected types, null %, cardinality)
- [ ] "Replace data, keep schema" option
- [ ] File refresh workflow

#### Day 3-4: Explore with Real Data
- [ ] Verify Explore page can connect to real DuckDB source
- [ ] Verify real data appears in the column browser
- [ ] Verify profiling results come from real data (not mock)
- [ ] Test with 1M+ row dataset

#### Day 4-5: Integration Testing
- [ ] End-to-end: connect Postgres → see real schema → see real data in Explore
- [ ] End-to-end: upload Excel → see real schema → see real data in Explore
- [ ] Verify no OOM on large datasets
- [ ] Write smoke tests for real connectors

---

## Dependency Graph

```
OQL Audit ───────────────────────────────────────────────────────┐
                                                                 │
DuckDB Setup ──┬── Postgres Connector ──┬── Ingestion Pipeline ──┤
               │                        │                        │
               └── MySQL Connector ─────┤                        │
                                        │                        │
                                        └── File Ingestion ──────┤
                                                                 │
                                             Explore UI ─────────┘
```

---

## What to Build vs. Buy

| Component | Build | Buy/Use |
|-----------|-------|---------|
| DuckDB service | ✅ Build wrapper | DuckDB itself (npm) |
| PostgreSQL connector | ✅ Build (thin wrapper over `pg`) | `pg` npm package |
| MySQL connector | ✅ Build (thin wrapper over `mysql2`) | `mysql2` npm package |
| CSV parsing | ✅ Build ingestion service | `papaparse` npm |
| Excel parsing | ✅ Build ingestion service | `exceljs` npm |
| File storage | ✅ Build adapter | S3/MinIO/local FS |
| Schema inference | ✅ Build profiling logic | `duckdb` type introspection |
| Type detection | ✅ Build (regex + heuristics) | None |

---

## Commands to Run First

```bash
# Check current duckdb availability
npm ls duckdb

# Check if real drivers exist
npm ls pg mysql2 snowflake-sdk @google-cloud/bigquery

# Audit OQL compiler file count and size
ls -la apps/api-gateway/src/services/oql*.ts
ls -la apps/api-gateway/src/resolvers/oql*.ts

# Check Docker Compose for existing services
docker compose config --services

# Check what's in the connectors directory
ls -la apps/api-gateway/src/services/connectors/

# Verify API gateway compiles clean
cd apps/api-gateway && npx tsc --noEmit

# Verify web app compiles clean
cd apps/web && npx tsc --noEmit
```

---

## Success Criteria for Phase A Exit

1. **Real Postgres** — Connect to a real Postgres DB with 10M+ rows, stream data, see real schema in Explore
2. **Real MySQL** — Connect to a real MySQL DB, same verification
3. **Real Excel upload** — Upload a real .xlsx file, see real schema inferred, see real data in Explore
4. **Real CSV upload** — Same for .csv with auto-delimiter detection
5. **Real profiling** — Column types, null %, cardinality, format detection all come from real data
6. **No OOM** — 10M+ row table streams without crashing
7. **File refresh** — Re-upload with schema changes triggers warning
8. **Smoke tests pass** — API + Web both working on local ports

---

## Open Questions for You

1. **Do you have a real Postgres dataset** (10M+ rows) available for testing? Or should I create one with the seed script?
2. **Do you have real Excel/CSV files** to test upload, or should I create sample datasets?
3. **Should I start with the OQL compiler audit** (highest risk) or the DuckDB infrastructure (enables everything else)?
4. **Docker environment** — Is Docker Desktop running and ready? Any preference for local DB vs cloud?
5. **Phase A timeline** — Should I follow the 2-week sprint plan above, or do you want to adjust the scope?
