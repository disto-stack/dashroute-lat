# ADR 0021: AI Ops Diagnostic Agent

## Status

Accepted

## Context

When the Dispatch Engine finds no available courier it fails fast: it publishes `order.dispatch_failed` carrying only a `reason` string, and the Orders Service definitively cancels the order (ADR 0003). The evidence needed to understand _why_ is scattered:

- Order data lives in PostgreSQL (`orders`).
- The order's event history lives in PostgreSQL (`audit_logs`, written by the Audit Service).
- Courier availability lives only in Redis (`couriers:locations`, `courier:status:<id>`, `courier:lock:<id>`) and is transient (ADR 0003).

Today an operator has to correlate these by hand. This is a good fit for an LLM agent with tool use: the investigation path depends on what each tool returns (no couriers nearby vs. couriers nearby but all locked vs. a burst of failures system-wide), so it cannot be a fixed query. It is also deliberately a _read-only_ use case: the agent explains, it never mutates state, and dispatching itself stays deterministic (an optimisation problem, not an LLM problem).

## Decision

We will introduce a dedicated `ai-ops-service` that diagnoses failed dispatches using an LLM with tool use.

1. **Lightweight Worker Pattern**: Following ADR 0005 and ADR 0019, a NestJS/TypeScript service with a flat structure (`src/consumers`, `src/agent`, `src/tools`, `src/mcp`, `src/database`), no Clean/Hexagonal layers. NestJS is chosen over a plain worker (as in `audit-service`) because the on-demand endpoint reuses the CASL guard pattern of ADR 0009.

2. **Triggers**:
   - **Event-driven**: consumes `order.dispatch_failed` from `dashroute.events` through its own queue (with the shared DLX), so it never sits on the order or dispatch critical path.
   - **On demand**: `POST /diagnoses { orderId }`, restricted to `ADMIN` via a CASL policy.

3. **Tools exposed through an MCP server**: the investigation tools are implemented once as an MCP server (`@modelcontextprotocol/sdk`). The agent loop consumes them as an MCP client over an in-memory transport, and the same server is mounted over stdio (`pnpm mcp:stdio`) so external MCP clients such as Claude Code or Claude Desktop can use the tools directly. Initial tools:
   - `get_order(orderId)`: whitelisted fields only.
   - `get_order_timeline(orderId)`: ordered `audit_logs` rows for the order.
   - `get_courier_snapshot(lat, lng, radiusKm)`: replays the dispatch discovery step read-only (`GEOSEARCH`, `HGET courier:status`, `EXISTS`/`TTL` on `courier:lock`).
   - `get_recent_dispatch_failures(windowMinutes)`: counts `order.dispatch_failed` in `audit_logs`, to separate an isolated failure from a systemic one.
   - `submit_diagnosis(...)`: terminal tool; its input is validated with Zod and is the only way the loop produces a result.

4. **Hand-written, provider-agnostic agent loop**: a bounded tool-use loop (about one file) that talks to the model only through a small `ModelClient` port (`generate(system, tools, messages) -> turn`) with provider-neutral message and tool-call types. `AnthropicModelClient` is the first and only adapter, and the only file that imports a provider SDK; unit tests use a scripted fake that implements the same port. Provider-specific features (prompt caching, thinking) stay inside the adapter. Hard limits per run: maximum turns, token budget and wall-clock timeout; exceeding any ends the run with a `failed` result rather than retrying. No forced `tool_choice`: the model is instructed to end by calling `submit_diagnosis`, and is nudged once if it stops without doing so.

5. **Read-only by construction** (defence in depth, ADR 0009):
   - PostgreSQL access through a dedicated `NOLOGIN` role `ai_ops_ro` with `SELECT` on `orders` and `audit_logs` only. The service connects with the shared DB user and issues `SET ROLE ai_ops_ro` on every pooled connection, so the shared credentials need no new secret.
   - Redis access through a wrapper that exposes an allowlist of read commands; no generic client leaks to tools.
   - No tool performs a write; remediation (re-dispatch, cancel, notify) is out of scope.

6. **Output as an event**: the result is published to `dashroute.events` as `ops.diagnosis_completed` (or `ops.diagnosis_failed`) using the standard envelope (ADR 0004). The Audit Service already binds `#`, so diagnoses are persisted with no new table. The payload includes model, turns, tool calls, token usage and latency.

7. **Best-effort and idempotent**: a diagnosis must never block or fail the order flow. Idempotency uses an `ai_ops_processed_events` table keyed by source `event_id` (same pattern as `notifications_processed_events`), checked before any model call so a redelivery does not spend tokens twice. Model or tool failures emit `ops.diagnosis_failed` and ack. A concurrency cap and rate limit bound spend during a failure storm.

8. **Untrusted data**: tool results are returned as data and the system prompt instructs the model to treat them as such. Tools return whitelisted fields, not raw payloads. Today `orders` has no free-text customer field, so the injection surface is small (`reason` and audit payload values), but an eval case covers it so the guarantee survives future schema changes.

9. **Observability** (ADR 0011): one OpenTelemetry span per model call and per tool call, plus metrics for tokens, estimated cost, latency and outcome. Logs follow AGENTS.md §10 and never include the API key.

10. **Testing**:
    - Unit tests (`tests/unit/`, 1:1 mirroring) drive the loop with a scripted fake model: limits, termination, tool errors, schema-invalid submissions.
    - Evals (`tests/evals/`) run seeded scenarios against a real model with fake tool backends and assert on the diagnosis category. They are a manual/nightly command, not part of default CI, because they cost money and are non-deterministic.

## Consequences

### Positive

- **Faster root cause**: one structured diagnosis per failed dispatch instead of manual correlation across Postgres, Redis and the audit trail.
- **Zero coupling to the critical path**: separate queue, best-effort semantics, read-only access.
- **Reusable tools**: the MCP server makes the same tools usable from other agents or clients without rewriting them.
- **Auditable**: every diagnosis, with its cost and tool trace, lands in the existing audit trail.

### Negative

- **External dependency and cost**: requires an LLM provider key and incurs per-run cost; needs spend limits and monitoring.
- **Non-determinism**: diagnoses can be wrong. Mitigated by a closed category set, evals, and presenting output as advice, never as automatic action.
- **Snapshot, not history**: courier state in Redis is read at diagnosis time, not at failure time, because `order.dispatch_failed` carries only `reason`. A future change should enrich the event emitted by the Dispatch Engine with the candidates it evaluated.
- **Schema coupling**: reading `orders` and `audit_logs` directly couples the service to those schemas (mitigated by `schema.dbml` and migrations being the shared contract, AGENTS.md §7). Going through Orders Service HTTP was rejected because it would need a service identity and a read-only role in CASL that do not exist yet.
- **Extra indirection**: running tools through MCP in-process adds a layer for the sake of reuse and interoperability.
