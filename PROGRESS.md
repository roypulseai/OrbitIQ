# OrbitIQ — Project Progress Tracker

> Last Updated: Sprint 1 — Complete

---

## Sprint Status Overview

| Sprint | Name | Status | Start Date | End Date | % Complete |
|--------|------|--------|------------|----------|------------|
| 0 | Setup & Foundations | ✅ Complete | - | - | 100% |
| 1 | API Gateway + First Connector | ✅ Complete | - | - | 100% |
| 2 | Semantic Model + Charts | ⏳ Pending | - | - | 0% |

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

## Release Milestones

### Release 0 — Foundations (Sprints 0-2)
- [x] Monorepo + CI/CD
- [x] Design system
- [x] Org/Auth data model
- [x] API Gateway skeleton
- [x] PostgreSQL connector
- [ ] Basic chart rendering (Sprint 2)

### Release 1 — Core BI MVP (Sprints 3-7)
- [ ] OQL compiler v1
- [ ] Snowflake, BigQuery, MySQL connectors
- [ ] Relationship modeling
- [ ] Dashboard canvas
- [ ] Caching + sharing

### Release 2 — Security & Governance (Sprints 8-10)
- [ ] RLS engine
- [ ] CLS + data masking
- [ ] GDPR compliance pack

### Release 3 — Smart Data Fabric (Sprints 11-14)
- [ ] Statistical profiling
- [ ] Knowledge Graph
- [ ] Relationship inference
- [ ] Semantic model auto-generation

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

---

## Risks & Blockers

| Risk/Blocker | Impact | Mitigation | Status |
|--------------|--------|------------|--------|
| - | - | - | - |

---

## Next Sprint Preview

### Sprint 2 — Semantic Model + Charts
- Minimal Semantic Model object (tables + basic measures)
- Dashboard object CRUD
- First chart rendering (bar + line) using Vega-Lite
- RBAC v0 (Admin/Editor/Viewer roles)
- Audit log table + basic event logging

---

*This file is a living artifact. Update after each sprint completion.*
