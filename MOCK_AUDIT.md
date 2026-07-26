# OrbitIQ — Mock Audit Report

> **Date: 2026-07-26**
> **Status: All services audited. 41 of 43 are mock.**

---

## Summary

| Status | Count | Details |
|--------|-------|---------|
| **MOCK** | 41 | In-memory `Map`/`array` storage, seeded data, `Math.random()` |
| **REAL** | 2 | `connections.service.ts`, `query-engine.service.ts` — bridge to connector-sdk |

---

## Services by Status

### REAL Services (2)

| Service | File | Why Real |
|---------|------|----------|
| `connections.service.ts` | `src/services/connections.service.ts` | Bridges to `connectorRegistry` from `@orbitiq/connector-sdk`. Calls real `connector.testConnection()`, `listSchemas()`, `listTables()`, `listColumns()`, `sampleData()` |
| `query-engine.service.ts` | `src/services/query-engine.service.ts` | Bridges to `connectorRegistry` for `executeQuery()`. Routes queries to real connectors |

### NEW REAL Services (3) — Added 2026-07-26

| Service | File | Why Real |
|---------|------|----------|
| `ingestion.service.ts` | `src/services/ingestion.service.ts` | Real file upload, CSV/Excel/Parquet/JSON parsing via `papaparse`/`exceljs`, real schema sniffing, real DuckDB materialization |
| `real-profiling.service.ts` | `src/services/real-profiling.service.ts` | Real type inference, null %, cardinality, format detection, percentiles, histograms |
| `duckdb connector` | `packages/connector-sdk/src/connectors/duckdb/connector.ts` | Real DuckDB in-process database, real SQL execution, real schema introspection |

### MOCK Services (41)

| # | Service | File | Mock Evidence |
|---|---------|------|---------------|
| 1 | `agent.service.ts` | `src/services/agent.service.ts` | In-memory `Map`, `seedData()`, `Math.random()` |
| 2 | `analytics.service.ts` | `src/services/analytics.service.ts` | In-memory array, `generateForecastData()` with `Math.random()` |
| 3 | `audit-trail.service.ts` | `src/services/audit-trail.service.ts` | In-memory `Map`, `seedMockData()` |
| 4 | `audit.service.ts` | `src/services/audit.service.ts` | In-memory array |
| 5 | `cache.service.ts` | `src/services/cache.service.ts` | In-memory `Map` |
| 6 | `chart-recommender.service.ts` | `src/services/chart-recommender.service.ts` | Pure logic, no storage |
| 7 | `cls.service.ts` | `src/services/cls.service.ts` | In-memory `Map`s, `seedMockData()` |
| 8 | `compliance.service.ts` | `src/services/compliance.service.ts` | In-memory `Map`s, `seedMockData()` |
| 9 | `conversation.service.ts` | `src/services/conversation.service.ts` | In-memory `Map`s, seeded conversations |
| 10 | `cross-language.service.ts` | `src/services/cross-language.service.ts` | In-memory dictionaries, seeded matches |
| 11 | `dashboards.service.ts` | `src/services/dashboards.service.ts` | In-memory `Map`s |
| 12 | `data-catalog.service.ts` | `src/services/data-catalog.service.ts` | In-memory `Map`, `seedMockData()` |
| 13 | `data-prep.service.ts` | `src/services/data-prep.service.ts` | In-memory `Map`s |
| 14 | `embedding.service.ts` | `src/services/embedding.service.ts` | In-memory `Map`s |
| 15 | `experimentation.service.ts` | `src/services/experimentation.service.ts` | Returns mock results directly |
| 16 | `export.service.ts` | `src/services/export.service.ts` | Pure data transformation |
| 17 | `federation.service.ts` | `src/services/federation.service.ts` | In-memory `Map`s, seeded engines |
| 18 | `ga-checklist.service.ts` | `src/services/ga-checklist.service.ts` | In-memory array |
| 19 | `hypothesis.service.ts` | `src/services/hypothesis.service.ts` | In-memory array, `Math.random()` |
| 20 | `intent-parser.service.ts` | `src/services/intent-parser.service.ts` | In-memory array, seeded intents |
| 21 | `knowledge-graph.service.ts` | `src/services/knowledge-graph.service.ts` | In-memory `Map`s, seeded entities |
| 22 | `ml.service.ts` | `src/services/ml.service.ts` | In-memory array, seeded experiments |
| 23 | `model-gateway.service.ts` | `src/services/model-gateway.service.ts` | In-memory `Map`s, seeded providers |
| 24 | `model-generation.service.ts` | `src/services/model-generation.service.ts` | In-memory `Map` |
| 25 | `oql.service.ts` | `src/services/oql.service.ts` | Calls `@orbitiq/oql` compiler (real compilation, but no DB execution) |
| 26 | `organizations.service.ts` | `src/services/organizations.service.ts` | In-memory `Map` |
| 27 | `performance.service.ts` | `src/services/performance.service.ts` | In-memory array, seeded data |
| 28 | `pii-scanning.service.ts` | `src/services/pii-scanning.service.ts` | Delegates to CLSService (mock) |
| 29 | `profiling.service.ts` | `src/services/profiling.service.ts` | In-memory `Map`s, seeded data |
| 30 | `rbac.service.ts` | `src/services/rbac.service.ts` | Pure role/permission definitions |
| 31 | `relationship-inference.service.ts` | `src/services/relationship-inference.service.ts` | In-memory `Map`s |
| 32 | `relationships.service.ts` | `src/services/relationships.service.ts` | In-memory `Map` |
| 33 | `rls.service.ts` | `src/services/rls.service.ts` | In-memory `Map`s |
| 34 | `scheduled-refresh.service.ts` | `src/services/scheduled-refresh.service.ts` | In-memory `Map` |
| 35 | `semantic-fingerprint.service.ts` | `src/services/semantic-fingerprint.service.ts` | Delegates to KnowledgeGraphService (mock) |
| 36 | `semantic-models.service.ts` | `src/services/semantic-models.service.ts` | In-memory `Map`s |
| 37 | `semantic-resolver.service.ts` | `src/services/semantic-resolver.service.ts` | In-memory `Map` |
| 38 | `sharing.service.ts` | `src/services/sharing.service.ts` | In-memory `Map`s |
| 39 | `user-attributes.service.ts` | `src/services/user-attributes.service.ts` | In-memory `Map` |
| 40 | `users.service.ts` | `src/services/users.service.ts` | In-memory `Map` |
| 41 | `workspaces.service.ts` | `src/services/workspaces.service.ts` | In-memory `Map` |

---

## Connector Drivers Status

| Connector | Driver Installed | In connector-sdk | In api-gateway | Status |
|-----------|-----------------|------------------|----------------|--------|
| PostgreSQL | `pg` ^8.22.0 | Yes (in sub-package) | Root-level | **Ready** |
| MySQL | `mysql2` ^3.23.1 | Yes (in sub-package) | Root-level | **Ready** |
| DuckDB | `duckdb` ^1.4.4 | New (2026-07-26) | Root-level | **Ready** |
| Snowflake | `snowflake-sdk` | Yes (in sub-package) | Not installed | Needs install |
| BigQuery | `@google-cloud/bigquery` | Yes (in sub-package) | Not installed | Needs install |

---

## Infrastructure Status

| Component | Status | Port | Notes |
|-----------|--------|------|-------|
| PostgreSQL | Running (Docker) | 5433 | `postgres:16-alpine` |
| Redis | Running (Docker) | 6380 | `redis:7-alpine` |
| Keycloak | Running (Docker) | 8081 | `keycloak:23.0` |
| DuckDB | In-process (npm) | N/A | Embedded engine, no container |
| MinIO/S3 | Not set up | N/A | Needed for file storage in production |
| Kafka | Not set up | N/A | Needed for CDC in Phase E |

---

## What's Been Fixed (This Session)

| Fix | Before | After |
|-----|--------|-------|
| DuckDB connector | Missing | New `DuckDBConnector` in connector-sdk |
| File ingestion | Missing | New `IngestionService` with CSV/Excel/Parquet/JSON support |
| Real profiling | Hash-based mock | New `RealProfilingService` with type inference, percentiles, histograms |
| Upload UI | Missing | New drag-drop upload page with schema preview |
| Connector registration | Only PostgreSQL registered | PostgreSQL + MySQL + DuckDB registered in `ConnectionsService` |
| Dependencies | No pg/mysql2/duckdb/papaparse/exceljs | All installed at root level |

---

## Next Priorities

1. **Replace in-memory stores with Prisma/PostgreSQL** — Start with `connections.service.ts` and `dashboards.service.ts`
2. **Wire OQL compiler to real query execution** — Connect `oql.service.ts` → DuckDB for actual query execution
3. **Replace mock analytics with real stats** — Use `statsmodels` via FastAPI for forecasting
4. **Replace mock AI with real LLM calls** — Wire `model-gateway.service.ts` to Anthropic/OpenAI APIs
5. **Add Redis caching** — Install `ioredis`, replace `cache.service.ts` in-memory Map with Redis
