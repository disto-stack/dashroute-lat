# AI Agent Guidelines for DashRoute

Welcome, Agent! You are working on **DashRoute**, a modern polyglot logistics routing system.
Please strictly adhere to the following project-specific rules, architectural boundaries, and conventions during any session.

## 1. Tech Stack & Tooling

- DashRoute is a **Polyglot Microservices** system.
- There is NO single global language or framework. The stack varies per service (e.g., NestJS/TypeScript for Auth/Orders, Go for Dispatch Engine).
- **CRITICAL:** Do not assume the tech stack. Always check the `package.json`, `go.mod`, or the specific service's ADR (e.g., ADR 0008 for Auth Service) to understand the framework, ORM, and testing tools required for the service you are working on.
- **Package Manager:** `pnpm` is used for monorepo orchestration where applicable, but respect the native tooling of the service's language (e.g., `go build`).

## 2. Architecture & Domain-Driven Design (DDD)

- The architectural boundaries, patterns, and conventions of DashRoute are formally documented in the **Architectural Decision Records (ADRs)** located in `docs/adr/`.
- **CRITICAL:** Do NOT invent new architectural patterns or deviate from existing ones. Always read the relevant ADRs (e.g., `0001` for persistence, `0005` for internal service patterns) before implementing new features or making structural decisions.

## 3. Architectural Decision Records (ADRs)

When asked to document architectural decisions or when making structural changes that require a new ADR:

- **Location:** `docs/adr/`
- **Naming Convention:** `XXXX-descriptive-title.md` (e.g., `0010-jsonb-location-structures-in-orders.md`). Check the directory for the next available sequential number.
- **Strict Format Template:** Every ADR MUST follow this exact structure:
  - `# ADR XXXX: Title`
  - `## Status` (e.g., Draft, Accepted, Superceded, Rejected)
  - `## Context`
  - `## Decision`
  - `## Consequences`
    - `### Positive`
    - `### Negative`

## 4. Test Structure (1:1 Mirroring)

- We mandate a strict 1:1 file mirroring strategy for unit tests.
- Every test created in `tests/unit/` MUST perfectly mirror the folder structure and filename of the source file in `src/`.
- **Example:** A use case at `src/application/use-cases/create-order.use-case.ts` MUST have its unit test at `tests/unit/application/use-cases/create-order.use-case.spec.ts`.

## 5. Data Contracts and Database Schema Evolution

If you make any changes to a database table structure, column type, or entity schema, you are **obligated** to synchronize all of the following layers to prevent silent contract breaks:

1. **Global DBML:** Update `/db/schema.dbml`.
2. **Official Migrations:** Update or create SQL files in `/db/migrations/` (e.g., `000004_create_orders_table.up.sql`).
3. **ORM Schema:** Update the corresponding Drizzle ORM schema (e.g., `src/infrastructure/database/schema.ts`).
4. **OpenAPI Spec:** Ensure the API contracts in `docs/api/dashroute-unified.openapi.yaml` accurately reflect the change.

## 6. Database Safety and Testing

- Integration tests must run against ephemeral data or cleanly truncate/seed data before assertions.
- **NEVER** drop or truncate production/development tables indiscriminately (e.g., running `DROP TABLE` across the DB) without explicitly informing the human developer and confirming the execution environment. Use caution when running raw DDL in containers like `delivery_postgres`.

## 7. Security & Authorization

- Authorization rules are distributed via **CASL**.
- Business logic evaluating permissions should use CASL ability instances within the application use cases to maintain a clean architecture.

## 8. Logging & Observability Standards

- All application logging MUST be structured JSON following ADR 0011 (`pino` for Node.js, `zap` for Go).
- **HTTP Controllers:** Do NOT add manual `logger.log` calls in controllers; request lifecycle and HTTP errors are automatically logged by `pino-http`.
- **Use Cases & Domain Logic:** Log key business events (`info`), domain warnings (`warn`), and unrecoverable integration failures (`error`).
- **Error Formatting:** Always pass the stack trace as the second argument: `this.logger.error(message, (error as Error).stack)`. Never log raw credentials, JWTs, or passwords.

By reading this `AGENTS.md` file, you acknowledge and agree to enforce these boundaries. Happy coding!
