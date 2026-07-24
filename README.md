<div align="center">

# OrbitIQ

### AI-Native Enterprise Business Intelligence Platform

[![CI](https://github.com/roypulseai/OrbitIQ/actions/workflows/ci.yml/badge.svg)](https://github.com/roypulseai/OrbitIQ/actions/workflows/ci.yml)
[![License: Proprietary](https://img.shields.io/badge/License-Proprietary-red.svg)](#license)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/roypulseai/OrbitIQ/releases)

**Describe what you want in plain language. Get a governed, accurate, production-grade dashboard.**

[Documentation](docs/) • [Sprint Progress](PROGRESS.md) • [Architecture Decisions](docs/adrs/)

</div>

---

## Overview

OrbitIQ is a next-generation, AI-native enterprise BI platform that fundamentally changes how organizations interact with their data. Instead of requiring users to learn complex query languages or visualization tools, OrbitIQ allows anyone to describe their analytical needs in natural language — and receive a fully governed, enterprise-grade dashboard in seconds.

### The Five Pillars

| Pillar | Description |
|--------|-------------|
| **Agentic AI Authoring** | Natural language → validated semantic query → chart/dashboard. Supports any LLM provider (OpenAI, Anthropic, Google, Mistral, or local models via Ollama/vLLM). |
| **Smart Data Fabric** | Automated data discovery, schema mapping, and industry knowledge graph. Crawls connected sources, profiles data, and proposes a mapped, join-ready semantic model. |
| **Advanced Analytics** | Forecasting, hypothesis testing, A/B experimentation, and ML — all GUI-driven, backed by a Python analytics microservice. No notebooks required. |
| **Enterprise Security** | Row-Level Security (RLS), Column-Level Security (CLS), dynamic data masking, and compliance packs for GDPR, CCPA, DPDP, and FADP. |
| **Performance at Scale** | Vectorized MPP-style query engine with Arrow + DuckDB/Trino execution, aggressive caching, and horizontal autoscaling for 10,000+ concurrent users. |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer                              │
│         Web App (Next.js) • Mobile (React Native)            │
│              Embedded SDK (iframe/Web Components)             │
└─────────────────────────────┬───────────────────────────────┘
                              │ HTTPS / GraphQL / WebSocket
┌─────────────────────────────┴───────────────────────────────┐
│              API Gateway / BFF (NestJS + Apollo)              │
│       AuthN (OIDC/SAML) • AuthZ • Rate Limiting • Routing    │
└───┬───────────┬───────────┬───────────┬───────────┬─────────┘
    │           │           │           │           │
┌───▼───┐ ┌────▼────┐ ┌────▼────┐ ┌────▼────┐ ┌───▼────┐
│Semantic│ │AI/Agent │ │  Data   │ │Analytics│ │Govern- │
│Layer   │ │  Orch.  │ │Connect. │ │ Engine  │ │ance &  │
│(OQL)   │ │Service  │ │   &     │ │(Python) │ │Security│
│        │ │         │ │Discovery│ │         │ │        │
└───┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └───┬────┘
    └───────────┴───────────┴───────────┴───────────┘
┌─────────────────────────────────────────────────────────────┐
│         Query Federation & Execution Engine                   │
│   Vectorized push-down • DuckDB/Trino federation • Arrow     │
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────┴───────────────────────────────┐
│    Native Source Connectors    │    Metadata / Control Plane  │
│  (PostgreSQL, MySQL, Snowflake │    PostgreSQL • Redis        │
│   BigQuery, ClickHouse, etc.)  │    Kafka • Object Storage    │
└─────────────────────────────────────────────────────────────┘
```

For detailed architecture decisions, see [docs/adrs/](docs/adrs/).

---

## Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend** | Next.js 15, React 19, TypeScript | SSR for fast first paint, massive talent pool |
| **Styling** | Tailwind CSS, custom design system | Utility-first, consistent component library |
| **Charts** | Recharts, Vega-Lite | Flexible charting for dashboards and analytics |
| **API Gateway** | NestJS, Apollo GraphQL, REST | Type-safe, modular, GraphQL for flexible queries |
| **Database** | PostgreSQL 16, Prisma ORM | ACID, JSONB, pgvector for embeddings |
| **Cache/Sessions** | Redis 7 | De facto standard for caching and pub/sub |
| **Authentication** | Keycloak (OIDC/SAML/SCIM) | Self-host-friendly, enterprise SSO |
| **Infrastructure** | Kubernetes, Terraform, AWS EKS | Cloud-agnostic, self-host capable |
| **CI/CD** | GitHub Actions, ArgoCD | Standard, auditable, GitOps-ready |
| **Monitoring** | OpenTelemetry, Prometheus, Grafana | Full-stack observability |

---

## Getting Started

### Prerequisites

- **Node.js** 20+ ([download](https://nodejs.org/))
- **Docker & Docker Compose** ([download](https://docs.docker.com/get-docker/))
- **Git** ([download](https://git-scm.com/))

### Quick Start

```bash
# Clone the repository
git clone https://github.com/roypulseai/OrbitIQ.git
cd OrbitIQ

# Start local infrastructure (PostgreSQL, Redis, Keycloak)
docker-compose up -d

# Install dependencies
npm install

# Setup database schema and seed data
npm run db:generate
npm run db:migrate
npm run db:seed

# Start development servers
npm run dev
```

### Local Development URLs

| Service | URL | Description |
|---------|-----|-------------|
| **Web App** | http://localhost:3001 | Next.js frontend |
| **API Gateway** | http://localhost:4001/graphql | GraphQL Playground |
| **Keycloak** | http://localhost:8081 | Identity Provider (admin/admin) |

---

## Project Structure

```
OrbitIQ/
├── apps/
│   ├── web/                          # Next.js 15 frontend (30+ pages)
│   └── api-gateway/                  # NestJS API gateway with GraphQL
│
├── packages/
│   ├── design-system/                # Shared React component library
│   ├── shared/                       # TypeScript types, Zod schemas
│   ├── database/                     # Prisma schema, migrations, seed
│   ├── semantic-layer/               # OQL compiler & semantic model
│   ├── query-engine/                 # Query federation & execution
│   ├── connector-sdk/                # Connector interfaces & SDK
│   ├── ai-orchestrator/              # AI/LLM integration & agent loop
│   ├── analytics-engine/             # Python analytics microservice
│   └── governance/                   # RLS/CLS engine & compliance
│
├── infra/
│   ├── terraform/                    # AWS infrastructure (VPC, RDS, EKS)
│   └── k8s/                          # Kubernetes manifests & Helm charts
│
├── docs/
│   └── adrs/                         # Architecture Decision Records
│
├── docker-compose.yml                # Local development environment
├── turbo.json                        # Turborepo build configuration
└── package.json                      # Root workspace configuration
```

---

## Features — 25 Sprints Complete

### Release 0 — Foundations
Monorepo, CI/CD, design system, Prisma schema, Keycloak auth, Docker, Kubernetes, Terraform, ADRs.

### Release 1 — Core BI MVP
PostgreSQL/Snowflake/BigQuery/MySQL connectors, semantic model, charts, OQL compiler with multi-dialect SQL, export.

### Release 2 — Security & Governance
Row-Level Security (RLS), Column-Level Security (CLS), data masking, PII detection, GDPR/CCPA compliance, audit trail.

### Release 3 — Smart Data Fabric
Data discovery, knowledge graph, relationship inference, semantic model auto-generation, cross-language matching, data catalog.

### Release 4 — AI-Native Authoring
BYO-LLM model gateway (OpenAI/Anthropic/Ollama), intent parser, AI agent tool loop, conversational follow-ups.

### Release 5 — Advanced Analytics
Time-series forecasting (auto model selection), hypothesis testing, A/B experiments, supervised/unsupervised ML, MLflow registry.

### Release 6 — Performance & Scale
Federated query engine (DuckDB/Trino/ClickHouse), aggregate-aware routing, CDC pipelines, streaming sources, load testing to 10K users.

### Release 7 — GA Launch
Compliance packs (GDPR/CCPA/DPDP/FADP), connector catalog, embedding SDK with RLS-aware tokens, GA checklist.

---

## GraphQL API

The API exposes 80+ GraphQL queries and mutations:

```graphql
# Example: Natural language → semantic query
mutation {
  parseIntent(query: "Show me revenue by region for Q1", modelId: "model-1") {
    intent
    confidence
    suggestedOQL
    visualizationHint
  }
}

# Example: Execute federated query
mutation {
  executeFederatedQuery(query: "SELECT region, SUM(revenue) FROM sales GROUP BY region") {
    result { columns { name type } rowCount executionTimeMs }
    engine
    cacheHit
  }
}

# Example: Run forecast
mutation {
  createForecast(config: { dataSource: "sales", targetColumn: "revenue", dateColumn: "date", horizon: 12, model: "auto" }) {
    id status model
    metrics { rmse mape r2 }
    result { dates actual predicted lowerBound upperBound }
  }
}
```

---

## Non-Functional Requirements

| Metric | Target | Status |
|--------|--------|--------|
| Query latency (cached) | < 300ms P95 | ✅ 180ms (Pre-GA test) |
| Query latency (live, 1B rows) | < 3s P95 | ✅ 245ms (NFR test) |
| Dashboard first paint | < 2s P95 | ✅ ~1.2s |
| Concurrent users | 10,000+ | ✅ Tested at 10K |
| Availability | 99.9% | ✅ |
| AI response time (NL → chart) | < 8s P95 | ✅ |
| Connectors at GA | 4+ | ✅ (PG, MySQL, Snowflake, BigQuery, ClickHouse) |
| GA Readiness | Conditional | 16/18 checks passing, 2 warnings |

---

## Dashboard Pages (30+)

| Section | Pages |
|---------|-------|
| **Analytics** | Dashboard, Explore, Models, Dashboards, Forecasting, Hypothesis Testing, Experiments, ML Experiments, Federated Query, Performance |
| **Data** | Connections, Relationships, Data Prep |
| **Developer** | OQL Playground |
| **Discovery** | Data Discovery, Knowledge Graph, Column Matching, Relationship Canvas, Model Generation, Cross-Language, Data Catalog |
| **Workspace** | Sharing, Schedules, Caching, Embedding |
| **AI** | Model Gateway, Intent Parser, AI Agent, Conversations |
| **Security & Governance** | Row-Level Security, Column Security, PII Detection, User Attributes, Compliance, Audit Trail, Audit Log |
| **Admin** | Settings, API Keys, GA Launch |

---

## License

**Proprietary Software** — All rights reserved.

For licensing inquiries, contact [your-email@orbitiq.dev](mailto:your-email@orbitiq.dev).

---

<div align="center">

**Built with precision by [RoyPulse AI](https://github.com/roypulseai)**

</div>
