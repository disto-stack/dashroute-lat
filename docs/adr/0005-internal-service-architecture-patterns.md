# ADR 0005: Internal Service Architecture Patterns (Clean NestJS, Pragmatic Hexagonal & Idiomatic Go)

## Status

Accepted

## Context

DashRoute consists of microservices with distinct operational and domain complexity profiles:

1. **Authentication & Authorization (`Auth Service`):** Requires strong encapsulation of security policies, cryptographic hashing, and identity management with enterprise-grade dependency injection and RBAC guards.
2. **Order Lifecycle Domain (`Orders Service`):** Complex domain workflows with extensive lifecycle state machines, invariant validation, and AMQP event dispatching.
3. **Compute-Intensive Geospatial Dispatcher (`Dispatch Engine`):** High-throughput, compute-focused event worker in Go requiring ultra-low latency (<50ms) and minimal heap allocations.
4. **I/O Pipelines (`Geolocation Service`, `Audit Service`):** Lightweight streaming ingestion and logging sinks.

Enforcing a single rigid pattern across all components leads to unnecessary boilerplate in simple worker pipes. Conversely, writing flat unstructured code in security and domain-heavy services causes severe tight coupling between HTTP frameworks, database drivers, and business rules.

## Decision

Adopt a **Tiered Service Architecture Strategy**:

1. **Auth Service (NestJS / TypeScript) — Clean Architecture (Ports & Adapters with NestJS IoC):**
   - **Domain Layer:** Pure business entities (`User`, `Courier`), value objects, domain exceptions, and outbound port interfaces (`IUserRepository`, `IPasswordHasher`, `ITokenGenerator`). Zero dependencies on NestJS, database drivers, or external libraries.
   - **Application Layer:** Use-case interactors (`RegisterUserUseCase`, `RegisterCourierUseCase`, `LoginUseCase`, `GetProfileUseCase`) and command DTOs.
   - **Infrastructure Layer:** Concrete adapters (`PostgresUserRepository`, `Argon2PasswordHasher`, `JwtTokenAdapter`), NestJS HTTP controllers, guards (`JwtAuthGuard`, `RolesGuard`), and module wiring.

2. **Orders Service (Node.js/TypeScript) — Hexagonal Architecture (Ports & Adapters):**
   - **Domain Layer:** Pure business entities, state machine rules, and domain events. Zero external dependencies.
   - **Application Layer:** Use-case interactors and port interfaces (input/output boundaries).
   - **Infrastructure Layer:** Concrete adapters (HTTP controllers, PostgreSQL repositories, RabbitMQ publishers).

3. **Dispatch Engine (Go 1.23) — Idiomatic Layered Package Architecture:**
   - Structured around standard Go package separation (`cmd/`, `internal/dispatch`, `internal/redis`, `internal/broker`) focused on execution performance and minimal memory allocation.

4. **Audit & Geolocation Services — Lightweight Worker / Pipe Pattern:**
   - Single-responsibility stream consumers directly piping I/O events to datastores without redundant abstraction layers.

## Consequences

### Positive

- **Domain & Security Isolation:** Core authentication rules, encryption, and order lifecycle state machines remain completely decoupled from HTTP frameworks, database drivers, and brokers.
- **Testability:** Domain logic and use cases in `Auth Service` and `Orders Service` can be unit-tested in pure isolation in milliseconds with lightweight mock ports.
- **Developer Velocity:** Avoids over-engineering in simple workers while maintaining maintainability where domain and security complexity demands it.

### Negative

- **Multi-Pattern Maintenance:** Developers navigate differing structural conventions depending on the service repository (NestJS Clean in Auth, Hexagonal in Orders, Idiomatic Packages in Go).
