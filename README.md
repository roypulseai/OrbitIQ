<div align="center">

# OrbitIQ

### AI-Native Enterprise Business Intelligence Platform

[![CI](https://github.com/roypulseai/OrbitIQ/actions/workflows/ci.yml/badge.svg)](https://github.com/roypulseai/OrbitIQ/actions/workflows/ci.yml)
[![License: Proprietary](https://img.shields.io/badge/License-Proprietary-red.svg)](#license)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)

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

OrbitIQ is built as a cloud-native, microservices-based platform:

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
│  (40+ SQL DWs, DBs, SaaS,     │    PostgreSQL • Redis        │
│   files, streaming, APIs)      │    Kafka • Object Storage    │
└─────────────────────────────────────────────────────────────┘
```

For detailed architecture decisions, see [docs/adrs/](docs/adrs/).

---

## Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend** | Next.js 15, React 19, TypeScript | SSR for fast first paint, massive talent pool |
| **Styling** | Tailwind CSS, custom design system | Utility-first, consistent component library |
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
│   ├── web/                          # Next.js 15 frontend application
│   └── api-gateway/                  # NestJS API gateway with GraphQL
│
├── packages/
│   ├── design-system/                # Shared React component library
│   ├── shared/                       # TypeScript types, Zod schemas, utilities
│   ├── database/                     # Prisma schema, migrations, seed scripts
│   ├── semantic-layer/               # OQL compiler & semantic model engine
│   ├── query-engine/                 # Query federation & execution engine
│   ├── connector-sdk/                # Connector interfaces & SDK
│   ├── ai-orchestrator/              # AI/LLM integration & agent loop
│   ├── analytics-engine/             # Python analytics microservice
│   └── governance/                   # RLS/CLS engine & compliance packs
│
├── infra/
│   ├── terraform/                    # AWS infrastructure (VPC, RDS, EKS, S3)
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

## Development

### Available Scripts

```bash
npm run dev          # Start all apps in development mode
npm run build        # Build all packages and apps
npm run lint         # Run ESLint across all packages
npm run typecheck    # Run TypeScript type checking
npm run test         # Run test suites
```

### Database Management

```bash
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database with demo data
```

---

## Sprint Progress

OrbitIQ follows a 24-sprint delivery plan organized into 8 releases. See [PROGRESS.md](PROGRESS.md) for detailed status.

### Release 0 — Foundations (Sprints 0-2) ✅ In Progress

- [x] Monorepo structure with Turborepo
- [x] CI/CD pipeline (GitHub Actions)
- [x] Design system with 10 base components
- [x] PostgreSQL data model (Prisma)
- [x] OIDC authentication (Keycloak)
- [x] Architecture Decision Records
- [x] Docker Compose for local development
- [x] Kubernetes manifests & Terraform infrastructure
- [ ] API Gateway BFF skeleton (Sprint 1)
- [ ] PostgreSQL native connector (Sprint 1)
- [ ] First chart rendering (Sprint 2)

### Release 1 — Core BI MVP (Sprints 3-7)
OQL compiler, additional connectors, relationship modeling, dashboard canvas, caching.

### Release 2 — Security & Governance (Sprints 8-10)
RLS/CLS engine, dynamic data masking, GDPR compliance pack.

### Release 3 — Smart Data Fabric (Sprints 11-14)
Data discovery, knowledge graph, relationship inference, semantic model auto-generation.

### Release 4 — AI-Native Authoring (Sprints 15-18)
BYO-LLM model gateway, intent parsing, agentic dashboard builder.

### Release 5 — Advanced Analytics (Sprints 19-21)
Forecasting, hypothesis testing, A/B experimentation, ML wizards.

### Release 6 — Performance & Scale (Sprints 22-23)
Federated query engine, aggregate awareness, load testing.

### Release 7 — GA (Sprint 24)
Full compliance coverage, 40+ connectors, mobile app, embedding SDK.

---

## Non-Functional Requirements

| Metric | Target |
|--------|--------|
| Query latency (cached) | < 300ms P95 |
| Query latency (live, 1B rows) | < 3s P95 |
| Dashboard first paint | < 2s P95 |
| Concurrent users | 10,000+ with autoscaling |
| Availability | 99.9% (SaaS) |
| AI response time (NL → chart) | < 8s P95 (cloud) |
| Connectors at GA | 40+ |
| Localization | 10+ languages |

---

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

**Proprietary Software** — All rights reserved.

This software is proprietary and confidential. Unauthorized copying, modification, distribution, or use of this software is strictly prohibited.

For licensing inquiries, contact [your-email@orbitiq.dev](mailto:your-email@orbitiq.dev).

---

<div align="center">

**Built with precision by [RoyPulse AI](https://github.com/roypulseai)**

</div>
