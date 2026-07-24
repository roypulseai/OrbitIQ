# OrbitIQ — Project Progress Tracker

> Last Updated: Sprint 17 — Complete

---

## Sprint Status Overview

| Sprint | Name | Status | Start Date | End Date | % Complete |
|--------|------|--------|------------|----------|------------|
| 0 | Setup & Foundations | ✅ Complete | - | - | 100% |
| 1 | API Gateway + First Connector | ✅ Complete | - | - | 100% |
| 2 | Semantic Model + Charts | ✅ Complete | - | - | 100% |
| 3 | OQL Compiler v1 | ✅ Complete | - | - | 100% |
| 4 | Multi-Connector Support | ✅ Complete | - | - | 100% |
| 5 | Relationship Modeling | ✅ Complete | - | - | 100% |
| 6 | Dashboard Canvas v1 | ✅ Complete | - | - | 100% |
| 7 | Caching + Sharing + Embedding | ✅ Complete | - | - | 100% |
| 8 | Row-Level Security (RLS) | ✅ Complete | - | - | 100% |
| 9 | Column-Level Security + Data Masking | ✅ Complete | - | - | 100% |
| 10 | Compliance Policy Engine + SOC2 | ✅ Complete | - | - | 100% |
| 11 | Statistical Profiling + Knowledge Graph | ✅ Complete | - | - | 100% |
| 12 | Relationship Inference Engine | ✅ Complete | - | - | 100% |
| 13 | Semantic Model Auto-generation | ✅ Complete | - | - | 100% |
| 14 | Cross-language Matching + Data Catalog | ✅ Complete | - | - | 100% |
| 15 | Model Gateway (BYO-LLM) | ✅ Complete | - | - | 100% |
| 16 | Intent Parser + Semantic Resolver | ✅ Complete | - | - | 100% |
| 17 | Agent Tool Loop | ✅ Complete | - | - | 100% |
| 9 | Column-Level Security + Data Masking | ✅ Complete | - | - | 100% |

---

## Sprint 1 — API Gateway + First Connector

### Tasks

| Task | Status | Owner | Notes |
|------|--------|-------|-------|
| Connector SDK interface | ✅ Done | - | Full interface: testConnection, listSchemas, listTables, listColumns, sampleData, executeQuery |
| PostgreSQL native connector | ✅ Done | - | End-to-end: connect, list schemas/tables, sample data, execute pushdown SQL |
| Connector Registry | ✅ Done | - | Plugin system for registering/connecting multiple connector types |
| GraphQL schema expansion | ✅ Done | - | Full types for Organization, Workspace, User, Connection, SchemaInfo, TableInfo, ColumnInfo |
| Schema resolver | ✅ Done | - | Queries: organizations, workspaces, users, connections, schemas, tables, columns, sampleData |
| Connection service | ✅ Done | - | CRUD + test + schema discovery + query execution |
| Audit service | ✅ Done | - | Event logging for queries and connection tests |
| Credential encryption | ✅ Done | - | AES-256-GCM encryption for sensitive config fields |
| Prisma schema updates | ✅ Done | - | Added status, lastTestedAt, lastTestResult to Connection |
| Connection config UI | ✅ Done | - | Dashboard pages: connections, explore, models, settings |
| Dashboard layout | ✅ Done | - | Sidebar navigation with links to all sections |

---

## Sprint 2 — Semantic Model + Charts

### Tasks

| Task | Status | Owner | Notes |
|------|--------|-------|-------|
| Semantic Model types | ✅ Done | - | GraphQL types: SemanticModel, ModelTable, ModelColumn, ModelMeasure with enums |
| Semantic Model service | ✅ Done | - | Full CRUD + publish/unpublish + SQL builder |
| Dashboard types | ✅ Done | - | GraphQL types: Dashboard, DashboardLayout, Tile, TileConfig |
| Dashboard service | ✅ Done | - | Full CRUD + tile management + layout updates |
| RBAC service | ✅ Done | - | 5 roles: admin, editor, viewer, data_steward, security_admin with granular permissions |
| Chart recommender service | ✅ Done | - | Data profiling + chart type recommendations + config generation |
| GraphQL resolvers | ✅ Done | - | SemanticModelsResolver with all queries/mutations + audit logging |
| AppModule update | ✅ Done | - | Registered all new services and resolver |
| Models page UI | ✅ Done | - | Interactive page with create modal + model list |
| Chart rendering (Vega-Lite) | ✅ Done | - | Chart component with bar, line, area, scatter, pie, donut support |
| Explore page update | ✅ Done | - | Integrated Chart component for query results |
| Dashboard detail page | ✅ Done | - | Integrated Chart component with demo tiles |

---

## Sprint 3 — OQL Compiler v1

### Tasks

| Task | Status | Owner | Notes |
|------|--------|-------|-------|
| OQL Lexer/Tokenizer | ✅ Done | - | Full tokenizer with 60+ token types, comments, strings, numbers |
| OQL Parser | ✅ Done | - | Recursive descent parser generating full AST |
| OQL to SQL Compiler | ✅ Done | - | Multi-dialect: PostgreSQL, MySQL, BigQuery, Snowflake |
| OQL Service | ✅ Done | - | Compile, validate, explain, examples, keywords, functions |
| OQL Resolver | ✅ Done | - | GraphQL mutations: compileOQL, validateOQL; queries: explainOQL, oqlExamples, oqlKeywords, oqlFunctions |
| Export Service | ✅ Done | - | CSV and JSON export with configurable options |
| Export Resolver | ✅ Done | - | GraphQL mutation: exportData, getSupportedExportFormats |
| OQL Playground UI | ✅ Done | - | Interactive editor with examples, quick reference, export |
| AppModule update | ✅ Done | - | Registered OQL and Export services and resolvers |

---

## Sprint 4 — Multi-Connector Support

### Tasks

| Task | Status | Owner | Notes |
|------|--------|-------|-------|
| Snowflake connector | ✅ Done | - | Full implementation: test, listSchemas, listTables, listColumns, sampleData, executeQuery |
| BigQuery connector | ✅ Done | - | Full implementation: test, listSchemas, listTables, listColumns, sampleData, executeQuery |
| MySQL connector | ✅ Done | - | Full implementation: test, listSchemas, listTables, listColumns, sampleData, executeQuery |
| Connector package.json files | ✅ Done | - | Added package.json for snowflake, bigquery, mysql connectors |
| Connector SDK index exports | ✅ Done | - | Updated to export all new connectors |
| Connection Form UI | ✅ Done | - | Dynamic form fields per connector type, test connection functionality |
| API Keys page | ✅ Done | - | Full UI for managing AI provider credentials with security notices |
| Credential encryption | ✅ Done | - | AES-256-GCM encryption service already existed in shared package |

---

## Release Milestones

### Release 0 — Foundations (Sprints 0-2)
- [x] Monorepo + CI/CD
- [x] Design system
- [x] Org/Auth data model
- [x] API Gateway skeleton
- [x] PostgreSQL connector
- [x] Basic chart rendering (Sprint 2)

### Release 1 — Core BI MVP (Sprints 3-7)
- [x] OQL compiler v1 (Sprint 3)
- [x] Snowflake, BigQuery, MySQL connectors (Sprint 4)
- [x] Relationship modeling + Data Prep (Sprint 5)
- [x] Dashboard canvas (Sprint 6)
- [x] Caching + sharing + embedding (Sprint 7)

### Release 2 — Security & Governance (Sprints 8-10)
- [x] RLS engine (Sprint 8)
- [x] CLS + data masking (Sprint 9)
- [x] GDPR compliance pack (Sprint 10)

### Release 3 — Smart Data Fabric (Sprints 11-14)
- [x] Statistical profiling (Sprint 11)
- [x] Knowledge Graph (Sprint 12)
- [x] Relationship inference (Sprint 13)
- [x] Semantic model auto-generation (Sprint 14)

### Release 4 — AI-Native Authoring (Sprints 15-18)
- [ ] Model Gateway (BYO-LLM)
- [ ] Intent Parser + Semantic Resolver
- [ ] Agent tool loop
- [ ] Conversational follow-ups

### Release 5 — Advanced Analytics (Sprints 19-21)
- [ ] Forecasting wizard
- [ ] Hypothesis testing
- [ ] ML wizards

### Release 6 — Performance & Scale (Sprints 22-23)
- [ ] Federated query engine
- [ ] Aggregate awareness
- [ ] Load testing

### Release 7 — GA (Sprint 24)
- [ ] CCPA, DPDP, FADP compliance packs
- [ ] 40+ connectors
- [ ] Mobile app
- [ ] Embedding SDK

---

## Completed Work

### Sprint 5 — Relationship Modeling (Complete)
- ✅ GraphQL types for Relationship, RelationshipSuggestion, CreateRelationshipInput, UpdateRelationshipInput
- ✅ GraphQL types for DataPipeline, TransformStep, TransformStepType enum (12 types)
- ✅ GraphQL types for CreateDataPipelineInput, UpdateDataPipelineInput, AddTransformStepInput, UpdateTransformStepInput
- ✅ RelationshipsService with full CRUD + suggestRelationships + buildJoinSQL
- ✅ DataPrepService with full Pipeline CRUD + Transform Step CRUD + SQL compilation for 12 step types
- ✅ RelationshipsResolver with all queries and mutations + audit logging
- ✅ Registered RelationshipsService, DataPrepService, RelationshipsResolver in AppModule
- ✅ Relationship Canvas UI with list view, canvas view, create/edit modal, suggestion banner
- ✅ Data Prep Canvas UI with pipeline list, step canvas, create pipeline modal, add/edit step modal, SQL preview
- ✅ Updated dashboard sidebar navigation with Relationships and Data Prep links

### Sprint 4 — Multi-Connector Support (Complete)
- ✅ Snowflake connector with full implementation
- ✅ BigQuery connector with full implementation
- ✅ MySQL connector with full implementation
- ✅ Connector package.json files for all new connectors
- ✅ Updated Connector SDK exports
- ✅ Dynamic Connection Form UI per connector type
- ✅ API Keys management page with security notices
- ✅ Credential encryption (AES-256-GCM) in shared package

### Sprint 3 — OQL Compiler v1 (Complete)
- ✅ OQL Lexer/Tokenizer with 60+ token types
- ✅ Recursive descent parser generating full AST
- ✅ Multi-dialect SQL compiler (PostgreSQL, MySQL, BigQuery, Snowflake)
- ✅ OQL Service: compile, validate, explain, examples, keywords, functions
- ✅ GraphQL mutations: compileOQL, validateOQL
- ✅ GraphQL queries: explainOQL, oqlExamples, oqlKeywords, oqlFunctions
- ✅ Export Service: CSV and JSON export with configurable options
- ✅ GraphQL mutation: exportData, getSupportedExportFormats
- ✅ OQL Playground UI: interactive editor with examples, quick reference, export
- ✅ Registered all new services and resolvers in AppModule

### Sprint 2 — Semantic Model + Charts (Complete)
- ✅ GraphQL types for SemanticModel, ModelTable, ModelColumn, ModelMeasure
- ✅ GraphQL types for Dashboard, DashboardLayout, Tile, TileConfig
- ✅ Semantic Models service with full CRUD + publish/unpublish
- ✅ SQL builder for semantic models (SELECT, FROM, WHERE, GROUP BY, ORDER BY, LIMIT)
- ✅ Dashboards service with full CRUD + tile management
- ✅ RBAC service with 5 roles and granular permissions
- ✅ Chart recommender service for data profiling
- ✅ SemanticModelsResolver with all queries and mutations
- ✅ Audit logging for all operations
- ✅ Models page UI with create modal
- ✅ Chart component with Vega-Lite support (bar, line, area, scatter, pie, donut)
- ✅ Updated Explore page with chart rendering
- ✅ Dashboard detail page with chart tiles

### Sprint 1 — API Gateway + First Connector (Complete)
- ✅ Connector SDK with full interface definition
- ✅ PostgreSQL connector (test, listSchemas, listTables, listColumns, sampleData, executeQuery)
- ✅ Connector Registry for plugin management
- ✅ Expanded GraphQL schema with all entity types
- ✅ Schema resolver with queries/mutations for all resources
- ✅ Connection service with test and discovery
- ✅ Query engine service for executing SQL
- ✅ Audit service for event logging
- ✅ AES-256-GCM credential encryption
- ✅ Connection config UI (add/test/browse connections)
- ✅ Dashboard layout with sidebar navigation
- ✅ Explore page (NL query input)
- ✅ Models page (semantic model management)
- ✅ Settings page (AI providers, compliance)

### Sprint 0 — Foundations (Complete)
- ✅ Monorepo structure with Turborepo
- ✅ CI/CD pipeline (GitHub Actions)
- ✅ Design system with 10 base components
- ✅ Shared types, schemas, constants, utilities
- ✅ Prisma schema with all core entities
- ✅ Next.js web app with auth pages
- ✅ NestJS API gateway with GraphQL
- ✅ Docker Compose for local development
- ✅ Kubernetes manifests (namespace, deployments, services, ingress, HPA)
- ✅ Terraform infrastructure (VPC, RDS, Redis, EKS, S3)
- ✅ Architecture Decision Records (ADR-001 through ADR-004)
- ✅ Database seed script

---

## Key Decisions Log

| Decision | Rationale | Date |
|----------|-----------|------|
| Monorepo with Turborepo | Shared packages, atomic commits, consistent tooling | Sprint 0 |
| Next.js 15 + React 19 for frontend | Modern SSR, huge talent pool (per spec §12) | Sprint 0 |
| NestJS for API gateway | Type-safe, GraphQL support (per spec §12) | Sprint 0 |
| PostgreSQL 16 for metadata | Supports relational + pgvector for embeddings | Sprint 0 |
| Prisma 6 for ORM | Type-safe, migration-friendly, good DX | Sprint 0 |
| Keycloak for auth | Self-host-friendly, OIDC/SAML/SCIM support | Sprint 0 |
| AES-256-GCM for credential encryption | Industry standard, authenticated encryption | Sprint 1 |
| Plugin-based Connector Registry | Extensible architecture for future connectors | Sprint 1 |
| Vega-Lite for chart rendering | Declarative grammar, wide chart type support | Sprint 2 |
| In-memory stores for Sprint 2 | Fast iteration, replace with Prisma in Sprint 3 | Sprint 2 |
| 5 RBAC roles | Granular permissions per spec §9.4 | Sprint 2 |
| Custom OQL language | Purpose-built for semantic layer, simpler than SQL | Sprint 3 |
| Recursive descent parser | Easy to understand, extend, and debug | Sprint 3 |
| Multi-dialect SQL compiler | Support PostgreSQL, MySQL, BigQuery, Snowflake | Sprint 3 |
| Snowflake via snowflake-sdk | Official SDK, best support | Sprint 4 |
| BigQuery via @google-cloud/bigquery | Official Google SDK | Sprint 4 |
| MySQL via mysql2/promise | Promise-based, fast, supports SSL | Sprint 4 |
| Dynamic connection forms | Different fields per connector type, better UX | Sprint 4 |
| Column name analysis for join suggestions | FK patterns, exact matches, similarity scoring | Sprint 5 |
| 12 transform step types | Full SQL compilation pipeline for data prep | Sprint 5 |

---

## Risks & Blockers

| Risk/Blocker | Impact | Mitigation | Status |
|--------------|--------|------------|--------|
| - | - | - | - |

---

## Next Sprint Preview

### Sprint 6 — Dashboard Canvas v1 (Complete)
- ✅ react-grid-layout for responsive draggable/resizable grid canvas
- ✅ DashboardProvider context for filter state management
- ✅ GlobalFilterBar with date range picker (presets) and category dropdowns
- ✅ Cross-filtering: click chart elements to filter all tiles
- ✅ DrillDownPanel slide-in panel with dimension breakdown
- ✅ DashboardToolbar with edit/save mode, export dropdown, active filter badge
- ✅ DashboardTile with KPI cards, chart rendering, drag handles, maximize modal
- ✅ Chart component: dark theme Vega-Lite config, tooltips, click handlers, palette
- ✅ Export to PDF (html2canvas + jspdf) and PNG
- ✅ Rewrote dashboard detail page with all Sprint 6 features

---

## Next Sprint Preview

### Sprint 7 — Caching + Sharing + Embedding (Complete)
- ✅ CacheService with in-memory TTL-based caching, stats, pattern invalidation
- ✅ ScheduledRefreshService for cron-based refresh schedule tracking
- ✅ SharingService for dashboard sharing with permission levels (view/edit/admin) + public links with password/expiry
- ✅ EmbeddingService for iframe embedding with HMAC-signed tokens + domain allowlists
- ✅ GraphQL types: CacheEntry, CacheStats, RefreshSchedule, DashboardShare, PublicLink, EmbedConfig, EmbedToken + 8 InputTypes
- ✅ GraphQL resolvers: CacheResolver, SharingResolver, EmbeddingResolver with full CRUD + audit logging
- ✅ Sharing & Permissions UI page with people table, invite form, public links management
- ✅ Embedding & Integration UI page with live preview, config panel, embed code generator
- ✅ Scheduled Refreshes UI page with schedule cards, create modal, toggle/run controls
- ✅ Query Cache UI page with stats cards, operations panel, entries table
- ✅ Updated dashboard sidebar with new Workspace nav group (Sharing, Schedules, Caching, Embedding)

---

## Sprint 8 — Row-Level Security (RLS) (Complete)
- ✅ RLSService with full CRUD, OQL expression evaluator (USERATTRIBUTE, =, !=, IN, AND, OR, NOT, comparisons)
- ✅ `buildRLSFilter()` — injects SQL WHERE clause fragments from policies at query-plan layer
- ✅ `getEffectivePolicies()` — resolves applicable policies for user + table + model
- ✅ UserAttributesService for managing user attribute key-value pairs
- ✅ GraphQL types: RLSPolicy, UserAttributes, CreateRLSPolicyInput, UpdateRLSPolicyInput, SetUserAttributesInput
- ✅ GraphQL resolver: RLSResolver with full CRUD + toggle + effective policies + user attribute management
- ✅ RLS Policy Management UI page with stats, policy table, create/edit modal, expression tester
- ✅ User Attributes UI page with attribute keys sidebar, user table, add/edit modal
- ✅ Security Audit Log UI page with filters, date range, 12 mock audit entries
- ✅ Dashboard sidebar updated with "Security & Governance" nav group

---

## Sprint 9 — Column-Level Security + Data Masking (Complete)
- ✅ CLSService with full CRUD for column security rules
- ✅ 6 mask types: NONE, FULL, PARTIAL, HASH, TOKENIZE, GENERALIZE
- ✅ applyMasking() with per-role enforcement at query time
- ✅ autoDetectPII() with regex-based detection for 9 PII types
- ✅ PIIScanningService for batch scanning and auto-tagging
- ✅ GraphQL types: ColumnSecurityRule, PIITag, Create/UpdateColumnSecurityRuleInput, UpdatePIITagInput
- ✅ GraphQL resolver: CLSResolver with all queries/mutations + audit logging
- ✅ Column Security UI page with mask type legend, rules table, create/edit modal, masking preview
- ✅ PII Detection & Tagging UI page with scan results, PII tags table, scan config panel
- ✅ Dashboard sidebar updated with Column Security and PII Detection links

---

## Sprint 10 — Compliance Policy Engine + SOC2 Hardening (Complete)
- ✅ ComplianceService with CRUD for compliance packs, rules, data residency, consent records, DSAR requests
- ✅ GDPR compliance pack (data residency, consent, RTBF, purpose limitation) + CCPA pack (do-not-sell, DSAR, data minimization)
- ✅ AuditTrailService with append-only immutable store, query/search, stats, export
- ✅ GraphQL types: CompliancePack, DataResidencyRule, ConsentRecord, DSARRequest, AuditTrailStats + input types
- ✅ GraphQL resolver: ComplianceResolver with all queries/mutations + audit trail logging
- ✅ Compliance Policy Engine UI with GDPR/CCPA pack cards, data residency table, consent management, DSAR requests
- ✅ Immutable Audit Trail UI with stats, filters, 15-entry log with expandable details
- ✅ Dashboard sidebar updated with Compliance and Audit Trail links

---

## Sprint 11 — Statistical Profiling + Knowledge Graph (Complete)
- ✅ ProfilingService with format detection (email, phone, currency, ZIP, date, IBAN, etc.), cardinality, null%, top-N values, percentiles
- ✅ KnowledgeGraphService with starter ontology: 8 Retail entities + 8 SaaS entities + 4 relationships
- ✅ SemanticFingerprintService for column-to-ontology matching via hash-based similarity
- ✅ GraphQL types: ProfilingJob, ColumnProfile, TableProfile, TopValue, KGEntity, KGRelationship, KGMatch, KGStats, VerticalInfo
- ✅ GraphQL resolvers: ProfilingResolver + KnowledgeGraphResolver with full CRUD + discovery runs
- ✅ Data Discovery UI page with profiling jobs table, column profiling cards with format detection
- ✅ Knowledge Graph UI page with SVG entity-relationship visualization, entity detail panel, entities table
- ✅ Semantic Fingerprinting UI page with match results, confidence bars, unmatched columns
- ✅ Dashboard sidebar updated with new Discovery nav group

---

## Sprint 12 — Relationship Inference Engine (Complete)
- ✅ RelationshipInferenceService with FK detection, name similarity, value-overlap sampling, cardinality matching, KG-based inference
- ✅ InferredRelationship type with confidence, evidence, method, cardinality, status (proposed/approved/rejected/needs_review)
- ✅ 10 seeded inferred relationships across Customers/Orders/Products/Subscriptions
- ✅ GraphQL types: InferredRelationship, InferenceJob, InferenceStats, StartInferenceInput
- ✅ GraphQL resolver: RelationshipInferenceResolver with queries + approve/reject mutations
- ✅ Relationship Canvas UI page with SVG entity-relationship diagram, color-coded edges, approve/reject workflow
- ✅ Dashboard sidebar updated with Relationship Canvas link

---

## Sprint 13 — Semantic Model Auto-generation (Complete)
- ✅ ModelGenerationService with auto-draft from profiling output (dimensions + measures pre-populated)
- ✅ Diff/review workflow: approve → publish, with dimension/measure editing
- ✅ GraphQL types: GeneratedDimension, GeneratedMeasure, GeneratedModel, ModelDiff
- ✅ GraphQL resolver: ModelGenerationResolver with CRUD + approve/publish mutations
- ✅ Model Generation UI with two-column dimensions/measures review, diff table, action buttons
- ✅ Dashboard sidebar updated with Model Generation link

---

## Sprint 14 — Cross-language Matching + Data Catalog (Complete)
- ✅ CrossLanguageService with EN/DE/ES/FR dictionaries (14 terms each), translateColumnName, batchTranslate, matchCrossLanguage
- ✅ DataCatalogService with 15 seeded entries (3 tables, 8 columns, 4 metrics), full-text search, tag management, quality scores
- ✅ GraphQL types: SupportedLanguage, TranslationEntry, CrossLanguageMatch, CatalogEntry, CatalogStats
- ✅ GraphQL resolvers: CrossLanguageResolver + DataCatalogResolver
- ✅ Cross-Language Matching UI with language selectors, translation dictionary grid, match results table, language cards
- ✅ Data Catalog UI with search, stat cards, filter bar, 9-entry card grid with quality scores
- ✅ Dashboard sidebar updated with Cross-Language and Data Catalog links

---

## Next Sprint Preview

### Sprint 15 — Model Gateway (BYO-LLM)
