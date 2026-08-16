# ADR 0006: Database Migration & Schema Evolution Strategy (golang-migrate & DBML)

## Status

Accepted

## Context

DashRoute is a polyglot microservices system composed of Node.js/TypeScript services (`orders-service`, `auth-service`) and Go services (`dispatch-engine`, `geolocation-service`). All services share a unified PostgreSQL 18 database instance for relational persistence and forensic auditing.

Adopting an ORM-specific migration tool (such as Prisma, TypeORM, or GORM) creates structural friction across polyglot boundaries:

1. It binds database evolution to a single programming language runtime.
2. It complicates CI/CD deployment pipelines by requiring Node.js or Go runtimes solely to execute schema changes.
3. It limits fine-grained control over PostgreSQL-specific features like custom PL/pgSQL triggers, partitioned tables, and partial indexes.

Furthermore, relying on bootstrap initialization scripts (`init.sql` / `/docker-entrypoint-initdb.d`) only works on fresh databases and cannot evolve schemas in live staging/production environments without data loss.

## Decision

Adopt an **Agnostic, Versioned Raw SQL Migration Strategy** managed by **`golang-migrate`** and documented via **DBML**:

1. **Migration Tooling (`golang-migrate`):**
   * Migrations are written in plain, standard PostgreSQL DDL.
   * Every schema modification consists of sequential, paired files: `*.up.sql` (forward migration) and `*.down.sql` (safe rollback).
   * Migration state is tracked via PostgreSQL's internal `schema_migrations` table (`version`, `dirty`).
   * Executed in local development via a dedicated `delivery_migrator` Docker container and in CI/CD / Kubernetes as pre-deployment InitContainers / Jobs before rolling out microservice workloads.

2. **Living Documentation & Visual Modeling (`DBML`):**
   * [db/schema.dbml](file:///home/disto/personal-projects/dashroute/db/schema.dbml) serves as the declarative single source of truth for Entity-Relationship (ER) visualization and data dictionary documentation via [dbdiagram.io](https://dbdiagram.io) and `dbdocs`.

3. **Zero-Downtime Migration Pattern (Expand & Contract):**
   * Backward-incompatible schema changes must follow the *Expand and Contract* pattern to ensure zero downtime across blue/green and rolling deployments.

## Consequences

### Positive

* **Polyglot Independence:** No dependency on Node.js, Go, or specific ORM runtimes for executing database migrations.
* **Granular SQL Control:** Full access to advanced PostgreSQL features, performance indexes, constraints, and PL/pgSQL functions.
* **Safe Rollbacks:** Explicit `.down.sql` scripts enable rapid rollback execution in case of deployment incidents.
* **Zero Overhead in Microservice Bootstrapping:** Services do not run migrations internally, keeping application startup fast and avoiding connection storms / race conditions during replica scale-outs.

### Negative

* **Manual SQL Authoring:** Developers must write both UP and DOWN SQL statements explicitly rather than relying on automatic ORM diff generation.
* **Discipline Required:** Schema changes require updating both the migration file in `db/migrations/` and the documentation in `db/schema.dbml`.
