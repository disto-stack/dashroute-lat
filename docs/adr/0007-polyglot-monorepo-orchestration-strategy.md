# ADR 0007: Polyglot Monorepo Workspace and Task Orchestration Strategy

## Status

Accepted

## Context

DashRoute operates as a polyglot microservices platform containing services and packages with distinct ecosystems:
- **TypeScript / Node.js:** `auth-service`, `orders-service`, `audit-service`, and shared packages (`packages/ts-*`).
- **Go 1.23:** High-performance workers and services (`dispatch-engine`, `geolocation-service` or auxiliary engines, and shared packages `packages/go-*`).

Managing dispersed repositories introduces synchronization overhead and fragmentation. Conversely, forcing all components into a single runtime or forcing Go into a JavaScript package manager creates brittle, non-idiomatic builds. Furthermore, naming shared libraries generically (e.g. `packages/event-contracts`) causes confusion regarding multi-language ownership.

## Decision

Adopt a **Polyglot Monorepo Structure** governed by tool-specific package managers, explicit package prefixing, and a unified task orchestrator:

1. **JavaScript/TypeScript Orchestration (pnpm Workspaces):**
   - Use `pnpm` with `pnpm-workspace.yaml` targeting `packages/ts-*` and `services/*`.
   - Explicitly exclude all Go modules (`!packages/go-*`, `!services/dispatch-engine`, etc.).
   - Share common TypeScript configs (`@dashroute/ts-config`) and event contracts (`@dashroute/ts-event-contracts`).

2. **Go Workspace Orchestration (Native `go.work`):**
   - Use Go 1.23 Workspaces (`go.work` at root) to seamlessly connect all internal Go modules without remote repository tagging.
   - Shared Go contracts and helpers reside in `packages/go-*` (e.g. `github.com/dashroute/go-contracts`).

3. **Explicit Package Prefixes in `packages/`:**
   - Prefix all shared libraries by their ecosystem: `packages/ts-<name>` for Node/TS and `packages/go-<name>` for Go.

4. **Universal Task Runner (Makefile):**
   - Maintain a top-level `Makefile` providing uniform developer commands across all stacks (`make dev`, `make test`, `make lint`, `make build`, `make infra-up`).

## Directory Structure

```text
dashroute/
├── pnpm-workspace.yaml          # Node / TS workspace boundary
├── go.work                      # Go workspace boundary
├── package.json                 # Root scripts & TypeScript 7.0.2
├── Makefile                     # Universal orchestrator
├── docker-compose.yml           # Local infrastructure
│
├── packages/
│   ├── ts-config/               # @dashroute/ts-config
│   ├── ts-event-contracts/      # @dashroute/ts-event-contracts (future)
│   └── go-contracts/            # github.com/dashroute/go-contracts
│
└── services/
    ├── auth-service/            (Node.js / TS)
    ├── orders-service/          (Node.js / TS)
    ├── audit-service/           (Node.js / TS)
    └── dispatch-engine/         (Go 1.23)
```

## Consequences

### Positive

- **Zero Tooling Friction:** TypeScript and Go maintain their standard toolchains and package managers independently.
- **Crystal Clear Ownership:** The `ts-*` and `go-*` prefixes make it immediately obvious which runtime each package targets.
- **Instant Local Resolution:** Both `pnpm` (via symlinks) and Go (via `go.work`) resolve internal packages locally without publishing steps.
- **Unified Developer Experience:** Developers run standardized `make` targets regardless of the underlying runtime.

### Negative

- **Cross-Language Synchronization:** Changes to shared message structures (like RabbitMQ event payloads) must be reflected across both `ts-*` and `go-*` contracts.
