# ADR-004: Query Execution Engine POC Plan

## Status
Proposed

## Context
OrbitIQ needs a query execution engine that can:
1. Compile OQL (OrbitIQ Query Language) to SQL
2. Push down queries to source databases
3. Execute federated queries across multiple sources
4. Handle caching and performance optimization
5. Support vectorized execution for analytics

## Decision
We will conduct a POC comparing three approaches before Sprint 6.

### Approach 1: DuckDB (Embedded)
- **Pros**: Extremely fast vectorized execution, embeddable, Arrow-native, single-node simplicity
- **Cons**: Limited federation, single-node only, no distributed queries
- **Best for**: Single-source queries, moderate federated workloads, development/testing

### Approach 2: Trino (Distributed)
- **Pros**: True distributed federation, connectors to many sources, ANSI SQL support
- **Cons**: Complex deployment, JVM overhead, operational complexity
- **Best for**: Large-scale federation, cross-source joins, enterprise deployments

### Approach 3: Hybrid (DuckDB + Trino)
- **Pros**: Best of both worlds - fast for simple queries, powerful for complex federation
- **Cons**: Two systems to maintain, routing logic complexity
- **Best for**: Production deployments with varying query complexity

### POC Criteria
1. **Performance**: Query latency on benchmark datasets (1M, 100M, 1B rows)
2. **Federation**: Cross-source join performance (PostgreSQL + CSV, PostgreSQL + Snowflake)
3. **Push-down**: SQL generation quality for each source dialect
4. **Arrow integration**: Zero-copy data transfer between components
5. **Operational complexity**: Deployment, monitoring, scaling effort

### POC Timeline
- **Sprint 4-5**: DuckDB integration POC
- **Sprint 5-6**: Trino integration POC
- **Sprint 6**: Hybrid decision based on benchmark results

## Consequences

### Positive
- Data-driven decision based on real benchmarks
- Clear evaluation criteria
- Early risk identification

### Negative
- POC work delays final implementation
- Team needs to learn multiple systems
- Benchmark results may not reflect production workloads

### Mitigations
- Focus POC on representative workloads
- Document findings in ADR-005 (final decision)
- Plan for incremental migration if needed
