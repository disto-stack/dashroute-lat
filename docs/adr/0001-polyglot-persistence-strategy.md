# ADR 0001: Polyglot Persistence Strategy (PostgreSQL + Redis)

## Status

Accepted

## Context

DashRoute requires high write throughput for GPS telemetry updates (every 2–5 seconds per active courier) and sub-millisecond latency for proximity searches. Concurrently, the platform must guarantee strict ACID transactional consistency for financial transactions, user accounts, and permanent order lifecycle records.

Handling high-frequency geospatial writes and real-time state flags directly in a relational database introduces heavy disk I/O bottlenecks and connection pool exhaustion. Conversely, relying solely on an in-memory store poses data durability and compliance risks.

## Decision

Adopt a **Polyglot Persistence Architecture**:

1. **PostgreSQL 17 (Primary Relational Store):**
   * Acts as the single source of truth for durable, auditable business entities (`users`, `couriers`, `orders`, `audit_logs`).
   * Handles formal lifecycle state changes (`PENDING`, `ASSIGNED`, `DELIVERED`, `CANCELLED`).
2. **Redis 7.4 (Volatile Real-Time & Caching Store):**
   * Stores dynamic driver locations via geospatial sorted sets (`GEOADD`, `GEOSEARCH`).
   * Holds ephemeral operational statuses (`ONLINE`, `BUSY`, `OFFLINE`) and distributed mutex locks.
   * Manages token revocation blacklists and API query caches.

## Consequences

### Positive

* **High Performance:** Telemetry ingestion and proximity queries execute entirely in RAM with sub-millisecond latencies.
* **ACID Guarantees:** Financial, legal, and operational histories remain resilient against system restarts and crashes.
* **Resource Optimization:** Eliminates unnecessary disk write operations and table lock contention on PostgreSQL.

### Negative

* **Eventual Consistency Window:** Temporary propagation latency exists between Redis real-time state and PostgreSQL durable state during event publishing.
* **Operational Overhead:** Requires monitoring, maintenance, and backup strategies for two distinct database engines.
