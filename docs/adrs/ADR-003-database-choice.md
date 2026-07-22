# ADR-003: Metadata Database Choice

## Status
Accepted

## Context
OrbitIQ needs a metadata/control-plane database to store organizations, users, workspaces, semantic models, dashboards, connections, audit logs, and other platform metadata. The database must support:
- Relational data with complex joins
- JSON/document storage for flexible schemas
- Vector storage for semantic embeddings (future)
- Full ACID compliance for transactional data
- Strong ecosystem and tooling

## Decision
We will use **PostgreSQL** as the primary metadata database with **Prisma** as the ORM.

### Why PostgreSQL
1. **Mature and reliable**: Battle-tested in production environments
2. **JSONB support**: Native JSON storage for flexible schemas (config, metadata, attributes)
3. **pgvector extension**: Vector storage for semantic embeddings (Sprint 12)
4. **Full-text search**: Built-in search capabilities
5. **Extensibility**: Extensions for PostGIS, TimescaleDB, etc.
6. **Cloud-native**: Managed services available on all major clouds (RDS, Cloud SQL, Azure Database)
7. **Cost-effective**: Open-source with no licensing fees

### Why Prisma
1. **Type safety**: Auto-generated TypeScript types from schema
2. **Migrations**: Version-controlled schema changes
3. **Query builder**: Type-safe queries without raw SQL
4. **Preview features**: Early access to new PostgreSQL features
5. **Excellent DX**: Great developer experience with Prisma Studio

### Schema Design Principles
- UUIDs for all primary keys (distributed-friendly)
- JSONB for flexible metadata (configs, attributes, findings)
- Proper foreign key constraints
- Indexes on frequently queried columns
- Soft deletes via `deletedAt` timestamp (future)

## Consequences

### Positive
- Reliable, scalable metadata storage
- Type-safe database access
- Easy schema evolution with migrations
- Rich query capabilities
- Good cloud managed service options

### Negative
- Single database (potential bottleneck at extreme scale)
- Requires PostgreSQL expertise for optimization
- Prisma has some limitations for complex queries

### Mitigations
- Connection pooling for concurrent access
- Read replicas for scaling reads
- Raw SQL for complex queries when needed
- Monitor and optimize slow queries
