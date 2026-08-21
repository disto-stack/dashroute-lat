# ADR 0008: Auth Service Technology Stack and Drizzle ORM Strategy

## Status

Accepted

## Context

`Auth Service` serves as the central identity, authentication, and Role-Based Access Control (RBAC) gateway for DashRoute. It is responsible for user registration (customers, merchants, couriers, administrators), credential verification, cryptographic password hashing, token issuance, and courier profile management.

Key operational and technical requirements include:

1. **Enterprise Modularity & Clean Inversion of Control:** Clear separation of domain logic from HTTP and database adapters.
2. **Type-Safe Data Access without ORM Bloat:** Database schemas and migrations are managed centrally via raw SQL scripts with `golang-migrate` (as established in ADR 0006). The data access layer must respect existing migrations without trying to own or auto-generate migrations.
3. **High Performance & Predictable SQL Execution:** Low-latency database interactions without hidden N+1 queries or heavy runtime reflection overhead (often found in Prisma or traditional active-record ORMs).
4. **Strict Cryptographic Security Standards:** Safe password hashing resistant to GPU cracking and side-channel timing attacks.

## Decision

Adopt the following technical stack for `Auth Service`:

### 1. Application Framework: **NestJS (Clean Architecture)**

- Use NestJS as the host framework providing modular architecture, dependency injection (IoC container), and declarative security constructs (`@UseGuards(JwtAuthGuard, RolesGuard)`, `@Roles()`, `@CurrentUser()`).
- Domain entities, use cases, and repository interfaces remain framework-agnostic, wired via NestJS Providers.

### 2. Relational Data Access Layer: **Drizzle ORM (`drizzle-orm/node-postgres`)**

- Adopt **Drizzle ORM** paired with `node-postgres` (`pg` connection pool).
- **Why Drizzle over Prisma / TypeORM:**
  - **Zero Runtime Overhead:** Drizzle operates as a lightweight, type-safe SQL query builder rather than a heavy ORM engine, delivering near-raw SQL execution speeds.
  - **Seamless Harmony with SQL Migrations:** Drizzle does not force its own migration engine; TypeScript schemas mirror existing PostgreSQL tables and enums (`user_role`, `vehicle_type`) created in `db/migrations/`.
  - **Compile-Time Type Safety:** Full end-to-end type inference for query results, filtering, joins, and transactional blocks (`db.transaction(...)`).

### 3. Cryptography & Security

- **Password Hashing:** Use **Argon2** (Argon2id variant), the winner of the Password Hashing Competition and OWASP-recommended algorithm for modern password storage.
- **Token Management:** Use stateless JSON Web Tokens (JWT) signed with HMAC-SHA256 / RSA containing user identity, active role (`CUSTOMER`, `COURIER`, `DISPATCHER`, `ADMIN`), and courier associations.

## Consequences

### Positive

- **Predictable & Fast SQL:** Direct mapping to PostgreSQL queries with zero query bloat or hidden overhead.
- **Non-Conflicting Migration Strategy:** Drizzle acts purely as a type-safe query interface, preserving `golang-migrate` as the single source of database evolution truth.
- **Robust RBAC & Testing:** NestJS guards combined with Clean Architecture allow testing business rules with lightweight mocks in milliseconds.

### Negative

- **Schema Mirroring:** Drizzle TypeScript table definitions (`schema.ts`) must be kept synchronized with raw SQL migrations.
