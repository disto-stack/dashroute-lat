# System Overview — DashRoute

## 1. Executive Summary

DashRoute is a high-concurrency, distributed logistics and order auto-dispatch platform. It connects customers, merchants, and couriers through real-time geospatial matching, event-driven orchestration, and polyglot persistence.

### Key Performance & Architectural Objectives

- **Fast HTTP Ingestion:** Sub-20ms order acceptance via decoupled asynchronous pipelines.
- **Low-Latency Dispatching:** In-memory proximity matching and atomic lock acquisition under 50ms.
- **High Availability & Fault Isolation:** Non-blocking message queues with Dead Letter Exchange (DLX) failover.
- **Strict Auditability:** Complete, immutable event trails backed by durable ACID relational storage.

---

## 2. Core Architecture Paradigm

The system leverages an **Event-Driven Microservices Architecture (EDA)** paired with **Polyglot Services**:

- **Synchronous Edge Layer:** HTTP/REST and WebSockets managed via a high-performance reverse proxy (Nginx).
- **Asynchronous Message Backbone:** AMQP 0-9-1 broker (RabbitMQ 4.0) routing domain events through dedicated topic exchanges.
- **Worker Execution Layer:** Specialized Go background workers handling compute-intensive geospatial algorithms and atomic concurrency guards.

---

## 3. Microservices Inventory

| Service                 | Runtime / Stack     | Primary Responsibilities                                                                    | Data Store    |
| :---------------------- | :------------------ | :------------------------------------------------------------------------------------------ | :------------ |
| **API Gateway / Nginx** | C / Nginx Alpine    | TLS termination, rate limiting, and path/protocol routing (`/api/*`, `/ws/*`).              | N/A           |
| **Auth Service**        | NestJS / TypeScript | User/courier authentication, JWT signing/verification, and RBAC (Clean Architecture).       | PostgreSQL 18 |
| **Orders Service**      | Node.js / Express   | Order ingestion, relational lifecycle state updates, and client push orchestration.         | PostgreSQL 18 |
| **Geolocation Service** | Node.js / `ws`      | Ingestion of high-frequency GPS pings (every 3s) from mobile drivers via WebSockets.        | Redis 8.10    |
| **Dispatch Engine**     | Go 1.23             | Geospatial proximity search (`GEOSEARCH`), candidate filtering, and atomic lock management. | Redis 8.10    |
| **Audit Service**       | Node.js / Worker    | Event tap logging all broker events (`#`) into an append-only ledger for analytics.         | PostgreSQL 18 |

---

## 4. Storage & State Management Strategy

The platform implements a **Polyglot Persistence Model**:

- **PostgreSQL 18 (Relational / ACID):** Serves as the source of truth for accounts, formal order contracts, billing ledgers, and audit logs.
- **Redis 8.10 (In-Memory / Volatile):** Manages dynamic geospatial sets (`GEOADD`/`GEOSEARCH`), ephemeral operational statuses (`HASH`), and distributed mutex locks (`SETNX`).

---

## 5. Resilience & Fault Tolerance

- **At-Least-Once Delivery:** All queues use explicit manual consumer acknowledgments (`basic.ack`).
- **Poison Message Isolation:** Queues route rejected payloads to `dashroute.dlx` after 3 consecutive `NACK` attempts.
- **Idempotent Consumers:** State-mutating consumers verify uniqueness using `event_id` keys to ensure safe retries.
