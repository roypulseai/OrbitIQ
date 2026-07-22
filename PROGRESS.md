# OrbitIQ — Project Progress Tracker

> Last Updated: Sprint 0 — Complete

---

## Sprint Status Overview

| Sprint | Name | Status | Start Date | End Date | % Complete |
|--------|------|--------|------------|----------|------------|
| 0 | Setup & Foundations | ✅ Complete | - | - | 100% |
| 1 | API Gateway + First Connector | ⏳ Pending | - | - | 0% |
| 2 | Semantic Model + Charts | ⏳ Pending | - | - | 0% |

---

## Sprint 0 — Setup & Foundations

### Tasks

| Task | Status | Owner | Notes |
|------|--------|-------|-------|
| Monorepo structure created | ✅ Done | - | Turborepo monorepo with packages/ and apps/ |
| CI/CD pipeline (GitHub Actions) | ✅ Done | - | Lint, typecheck, test, build workflows |
| Design system foundations | ✅ Done | - | Tailwind tokens, Button, Card, Input, Badge, Avatar, Modal, Spinner, Toast, Tooltip, Dropdown |
| Postgres data model (Prisma) | ✅ Done | - | Full schema with all entities from spec §13 |
| Basic OIDC login (Keycloak) | ✅ Done | - | NextAuth.js with Keycloak provider |
| Architecture Decision Records | ✅ Done | - | ADR-001 through ADR-004 |
| Docker Compose | ✅ Done | - | Postgres 16, Redis 7, Keycloak 23 |
| Kubernetes manifests | ✅ Done | - | Namespace, API Gateway, Web, Ingress, HPA |
| Terraform infrastructure | ✅ Done | - | VPC, RDS, Redis, EKS, S3 |

---

## Release Milestones

### Release 0 — Foundations (Sprints 0-2)
- [x] Monorepo + CI/CD
- [x] Design system
- [x] Org/Auth data model
- [ ] API Gateway skeleton (Sprint 1)
- [ ] PostgreSQL connector (Sprint 1)
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

### Sprint 0 — Foundations (Complete)
- ✅ Monorepo structure with Turborepo
- ✅ CI/CD pipeline (GitHub Actions)
- ✅ Design system package with 10 base components
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
| Tailwind CSS for styling | Utility-first, consistent design system | Sprint 0 |
| Apollo Server for GraphQL | Industry standard, excellent tooling | Sprint 0 |
| AWS EKS for orchestration | Managed Kubernetes, cloud-native | Sprint 0 |
| Docker Compose for local dev | Simple local development environment | Sprint 0 |

---

## Risks & Blockers

| Risk/Blocker | Impact | Mitigation | Status |
|--------------|--------|------------|--------|
| - | - | - | - |

---

## Next Sprint Preview

### Sprint 1 — API Gateway + First Connector
- API Gateway BFF skeleton with full GraphQL schema
- Connector SDK interface definition
- PostgreSQL native connector end-to-end
- Connection config UI with credential encryption

---

*This file is a living artifact. Update after each sprint completion.*
