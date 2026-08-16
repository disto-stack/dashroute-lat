# ADR 0005: Internal Service Architecture Patterns (Pragmatic Hexagonal & Idiomatic Go)

## Status

Accepted

## Context

DashRoute consists of microservices with distinct operational profiles:

1. Complex domain workflows with extensive lifecycle state machines and validation logic (`Orders Service`).
2. High-throughput, compute-focused event workers requiring ultra-low latency execution (`Dispatch Engine`).
3. Lightweight I/O ingestion and logging sinks (`Geolocation Service`, `Audit Service`).

Enforcing a rigid architectural pattern (such as pure Hexagonal/DDD) across all components leads to unnecessary boilerplate in simple worker pipes. Conversely, writing flat code in domain-heavy services causes severe tight coupling between HTTP frameworks, database ORMs, and message brokers.

## Decision

Adopt a **Tiered Service Architecture Strategy**:

1. **Orders Service (Node.js/TypeScript) — Hexagonal Architecture (Ports & Adapters):**
   * **Domain Layer:** Pure business entities, state machine rules, and domain events. Zero external dependencies.
   * **Application Layer:** Use-case interactors and port interfaces (input/output boundaries).
   * **Infrastructure Layer:** Concrete adapters (Express HTTP controllers, PostgreSQL repositories, RabbitMQ publishers).

2. **Dispatch Engine (Go) — Idiomatic Layered Package Architecture:**
   * Structured around standard Go package separation (`cmd/`, `internal/dispatch`, `internal/redis`, `internal/broker`) focused on execution performance and minimal memory allocation.

3. **Audit & Geolocation Services — Lightweight Worker / Pipe Pattern:**
   * Single-responsibility stream consumers directly piping I/O events to datastores without redundant abstraction layers.

## Consequences

### Positive

* **Domain Isolation:** Core order lifecycle rules remain completely independent of frameworks, databases, and message broker drivers.
* **Developer Velocity:** Avoids over-engineering in simple workers while maintaining maintainability where domain complexity demands it.
* **Testability:** Domain logic and use cases in `Orders Service` can be unit-tested in isolation without mocking relational databases or brokers.

### Negative

* **Multi-Pattern Maintenance:** Developers must navigate differing structural conventions depending on the service repository.
