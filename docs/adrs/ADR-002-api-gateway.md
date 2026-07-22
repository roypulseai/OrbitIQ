# ADR-002: API Gateway Choice

## Status
Accepted

## Context
We need an API gateway/BFF (Backend for Frontend) to handle authentication, authorization, rate limiting, and route requests to backend microservices. The gateway must support both GraphQL (for flexible client queries) and REST (for integrations).

## Decision
We will use **NestJS** as the API gateway framework with **Apollo Server** for GraphQL.

### Architecture
- **NestJS**: Node.js framework with excellent TypeScript support, modular architecture, and built-in dependency injection
- **Apollo Server**: Industry-standard GraphQL server with excellent tooling
- **Passport.js**: Authentication middleware supporting OIDC/SAML
- **Class Validator**: Request validation with decorators

### Why NestJS over Express/Fastify
1. **Type-first approach**: Decorators and TypeScript decorators align with our type-safe philosophy
2. **Modular architecture**: Easy to split into microservices later if needed
3. **Built-in GraphQL support**: First-class Apollo integration
4. **Enterprise patterns**: Guards, interceptors, pipes for cross-cutting concerns
5. **Testing**: Built-in testing utilities

### Why GraphQL + REST
- **GraphQL**: Flexible queries for dashboard composition, reduces over-fetching
- **REST**: Simpler integrations, webhooks, third-party APIs

## Consequences

### Positive
- Type-safe API layer matching our TypeScript frontend
- Flexible GraphQL queries for complex dashboard data
- Easy to add new resolvers and mutations
- Built-in Playground for development
- Good ecosystem of plugins

### Negative
- Node.js single-threaded (mitigated by running multiple instances)
- GraphQL complexity requires careful schema design
- Learning curve for team members new to NestJS

### Mitigations
- Use NestJS CLI for scaffolding
- Document GraphQL schema conventions
- Implement query complexity limits
