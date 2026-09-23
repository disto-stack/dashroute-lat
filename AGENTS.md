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

## 5. Adding a New UI Component (`packages/ui`)

When creating a new shared component in `packages/ui`, do not invent your own file layout — follow the existing sources of truth exactly:

- **Dual-file pattern:** Follow `docs/adr/0015-design-system-strategy.md` (web `.tsx` + CSS Modules, native `.native.tsx` + StyleSheet, shared `.types.ts`).
- **Stories checklist:** Follow `packages/ui/README.md` ("Adding stories to a new component") for which `.stories.tsx` / `.stories.native.tsx` files to create.
- **No native variant yet?** Components without a `.native.tsx` (e.g. `OrderStatusBadge`, `Sidebar`, `Select`, `DataTable`, `DetailPanel`) only need `.stories.tsx` — do not create a `.stories.native.tsx` for them.
- **Interaction tests (web):** If the component has real interaction (a click, a form change, a callback prop), add a `play` function to its **web** story (`Foo.stories.tsx`) using `storybook/test` (bundled in Storybook core). These run headlessly via `pnpm --filter @dashroute/ui test` — see `packages/ui/README.md` ("Testing") and `docs/adr/0018-storybook-documentation-strategy.md`.
- **Interaction tests (native):** Do NOT add a `play` function to `.stories.native.tsx` — `storybook/test`'s queries are DOM-based and do nothing on React Native. If the component has a `.native.tsx` and real interaction, add a `Foo.test.tsx` next to it using `composeStories` (`@storybook/react`) + `@testing-library/react-native`, run via `pnpm --filter @dashroute/ui test:native` (Jest). See `packages/ui/README.md` ("Testing") for the pattern. Remember `render()` from `@testing-library/react-native` is **async** — always `await` it.
- **Export:** Add the new component's export to `packages/ui/src/index.ts`.

## 6. Adding a Feature to a Client App (`apps/*`)

When adding a new feature (or a new client app) under `apps/*`, follow `docs/adr/0016-frontend-feature-sliced-architecture.md` — do not invent an ad hoc folder layout:

- **Dumb vs Smart boundary:** `packages/ui` components stay domain-agnostic (no business logic, no API calls, no DashRoute domain knowledge). All business logic, data fetching, and state live in the app under `features/`.
- **Feature-Sliced structure:** Organize by business domain, not by technical role:

  ```
  apps/[app-name]/src/
  ├── app/                  # Routing layer only (Next.js App Router / Expo Router) — binds features to URLs, no heavy logic
  ├── features/<domain>/    # e.g. orders/, auth/, geolocation/
  │   ├── components/       # Smart, domain-specific components
  │   ├── hooks/
  │   ├── services/         # API fetchers/mutators
  │   └── types/
  ├── lib/                  # Cross-feature utilities, HTTP clients, providers
  └── components/           # (Optional) app-specific generic components not generic enough for packages/ui
  ```

- **Routing files** (`page.tsx`, `screen.tsx`, etc.) must stay thin orchestrators: read route params, render the feature's smart components — no complex local state or heavy JSX inline.
- **New client app?** Also check `docs/adr/0013-driver-mobile-app-architecture.md` for the Expo/React Native baseline before scaffolding.

## 7. Data Contracts and Database Schema Evolution

If you make any changes to a database table structure, column type, or entity schema, you are **obligated** to synchronize all of the following layers to prevent silent contract breaks:

1. **Global DBML:** Update `/db/schema.dbml`.
2. **Official Migrations:** Update or create SQL files in `/db/migrations/` (e.g., `000004_create_orders_table.up.sql`).
3. **ORM Schema:** Update the corresponding Drizzle ORM schema (e.g., `src/infrastructure/database/schema.ts`).
4. **OpenAPI Spec:** Ensure the API contracts in `docs/api/dashroute-unified.openapi.yaml` accurately reflect the change.

## 8. Database Safety and Testing

- Integration tests must run against ephemeral data or cleanly truncate/seed data before assertions.
- **NEVER** drop or truncate production/development tables indiscriminately (e.g., running `DROP TABLE` across the DB) without explicitly informing the human developer and confirming the execution environment. Use caution when running raw DDL in containers like `delivery_postgres`.

## 9. Security & Authorization

- Authorization rules are distributed via **CASL**.
- Business logic evaluating permissions should use CASL ability instances within the application use cases to maintain a clean architecture.

## 10. Logging & Observability Standards

- All application logging MUST be structured JSON following ADR 0011 (`pino` for Node.js, `zap` for Go).
- **HTTP Controllers:** Do NOT add manual `logger.log` calls in controllers; request lifecycle and HTTP errors are automatically logged by `pino-http`.
- **Use Cases & Domain Logic:** Log key business events (`info`), domain warnings (`warn`), and unrecoverable integration failures (`error`).
- **Error Formatting:** Always pass the stack trace as the second argument: `this.logger.error(message, (error as Error).stack)`. Never log raw credentials, JWTs, or passwords.

## 11. Git Commit Attribution

- Do **NOT** add a `Co-Authored-By: Claude ...` (or any AI-attribution) trailer to git commit messages or pull request descriptions in this repository, regardless of default tooling behavior that suggests otherwise.

By reading this `AGENTS.md` file, you acknowledge and agree to enforce these boundaries. Happy coding!
