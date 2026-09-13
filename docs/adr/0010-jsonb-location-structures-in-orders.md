# ADR 0010: JSONB Location Structures in Orders

## Status

Accepted

## Context

Initially, the relational database schema for `orders` flatly separated geolocation coordinates and addresses into 6 distinct columns (`origin_lat`, `origin_lon`, `origin_address`, `dest_lat`, `dest_lon`, `dest_address`).

While flat columns are standard in traditional SQL schemas, modern logistics applications require passing location objects atomically across API endpoints, Domain Entities, and AMQP Event payloads. Managing 6 separate attributes in Domain Entities and DTOs introduced boilerplate code, higher risk of field misalignment, and cumbersome mapping logic.

## Decision

Adopt **Structured JSONB Columns** for Order Locations:

1. **`pickup_location` (JSONB):**
   - Stores the structured pickup point payload `{ lat: number, lng: number }`.
2. **`dropoff_location` (JSONB):**
   - Stores the structured dropoff point payload `{ lat: number, lng: number }`.

This structure is mirrored across `db/schema.dbml`, `db/migrations/000004_create_orders_table.up.sql`, Drizzle ORM schemas, and OpenAPI API contracts.

## Consequences

### Positive

- **Clean Domain Modeling:** Eliminates field fragmentation in DTOs and Domain Entities.
- **Direct JSON Serialization:** Prevents manual mapping code when consuming or producing HTTP and AMQP payloads.
- **PostgreSQL Performance:** PostgreSQL `JSONB` format is binary, efficient, and supports indexing via GIN if querying by nested coordinates becomes necessary.

### Negative

- **Schema Rigidity inside JSON:** Sub-fields inside JSONB are not natively constrained by SQL column types, requiring strict Zod/DTO validation at the Application boundary before insertion.
