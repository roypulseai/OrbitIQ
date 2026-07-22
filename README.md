# OrbitIQ

> AI-Native Enterprise BI Platform

OrbitIQ is a web-based, AI-native enterprise BI platform that lets any business user describe what they want in plain language and get a governed, accurate, production-grade dashboard.

## Architecture

See [docs/adrs/](docs/adrs/) for Architecture Decision Records.

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **API**: NestJS, GraphQL (Apollo), REST
- **Database**: PostgreSQL, Redis
- **Auth**: Keycloak (OIDC/SAML)
- **Infrastructure**: Kubernetes, Terraform, AWS
- **Build**: Turborepo, npm workspaces

## Getting Started

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 16 (or use Docker)

### Development

1. Start infrastructure:
   ```bash
   docker-compose up -d
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Setup database:
   ```bash
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```

4. Start development servers:
   ```bash
   npm run dev
   ```

This will start:
- Web app at http://localhost:3001
- API gateway at http://localhost:4001/graphql
- Keycloak at http://localhost:8081

### Project Structure

```
orbitiq/
├── apps/
│   ├── web/                    # Next.js frontend
│   └── api-gateway/            # NestJS API gateway
├── packages/
│   ├── design-system/          # Shared React components
│   ├── shared/                 # Types, schemas, utilities
│   ├── database/               # Prisma schema and migrations
│   ├── semantic-layer/         # OQL compiler (Sprint 3+)
│   ├── query-engine/           # Query execution (Sprint 22+)
│   ├── connector-sdk/          # Connector interfaces (Sprint 1+)
│   ├── ai-orchestrator/        # AI/LLM integration (Sprint 15+)
│   ├── analytics-engine/       # Python analytics (Sprint 19+)
│   └── governance/             # RLS/CLS engine (Sprint 8+)
├── infra/
│   ├── terraform/              # Infrastructure as Code
│   └── k8s/                    # Kubernetes manifests
└── docs/
    └── adrs/                   # Architecture Decision Records
```

## Sprint Progress

See [PROGRESS.md](PROGRESS.md) for current sprint status.

### Sprint 0 - Foundations (In Progress)
- [x] Monorepo structure with Turborepo
- [x] CI/CD pipeline (GitHub Actions)
- [x] Design system foundations (tokens, base components)
- [x] Postgres data model (Prisma)
- [x] Basic OIDC login (Keycloak)
- [x] Architecture Decision Records
- [x] Docker Compose for local development
- [x] Kubernetes manifests
- [x] Terraform infrastructure

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

## License

Proprietary - All rights reserved.
