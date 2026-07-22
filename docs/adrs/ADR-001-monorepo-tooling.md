# ADR-001: Monorepo Tooling

## Status
Accepted

## Context
OrbitIQ is a complex enterprise BI platform with multiple microservices, a web frontend, shared libraries, and infrastructure code. We need to decide how to organize the codebase to maximize developer velocity, code sharing, and deployment flexibility.

## Decision
We will use a **monorepo** approach with **Turborepo** as the build orchestration tool.

### Package Structure
```
orbitiq/
├── apps/
│   ├── web/                    # Next.js frontend
│   └── api-gateway/            # NestJS API gateway
├── packages/
│   ├── design-system/          # Shared React components
│   ├── shared/                 # Types, schemas, utilities
│   ├── database/               # Prisma schema and migrations
│   ├── semantic-layer/         # OQL compiler (future)
│   ├── query-engine/           # Query execution (future)
│   ├── connector-sdk/          # Connector interfaces (future)
│   ├── ai-orchestrator/        # AI/LLM integration (future)
│   ├── analytics-engine/       # Python analytics (future)
│   └── governance/             # RLS/CLS engine (future)
├── infra/
│   ├── terraform/              # Infrastructure as Code
│   └── k8s/                    # Kubernetes manifests
└── docs/
    └── adrs/                   # Architecture Decision Records
```

### Tooling Choices
- **Turborepo**: Build orchestration, caching, task running
- **npm workspaces**: Package management
- **TypeScript**: Type safety across all packages
- **ESLint + Prettier**: Code quality and formatting

## Consequences

### Positive
- Atomic commits across related packages
- Shared types and utilities without publishing
- Consistent tooling and configuration
- Fast builds via Turborepo caching
- Easy code navigation and refactoring

### Negative
- Requires discipline to maintain package boundaries
- Larger repository size
- CI/CD needs careful configuration for partial builds

### Mitigations
- Enforce boundaries via ESLint rules
- Use Turborepo's filtering for efficient CI
- Document package responsibilities clearly
