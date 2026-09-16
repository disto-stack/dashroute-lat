# Audit Service

The **Audit Service** is a lightweight stream consumer for **DashRoute**, built according to **ADR 0005** (Lightweight Worker / Pipe Pattern) and **ADR 0002** (Event-Driven Backbone).

## Architectural Role

- Consumes all domain events published to RabbitMQ (`dashroute.events` exchange, `#` routing key).
- Parses and validates event payloads against the **Standard Event Envelope** (ADR 0004).
- Persists immutable event logs directly into the PostgreSQL `audit_logs` table for compliance and forensic auditing.
- Implements strict idempotency checking via `event_id` unique key constraint matching.
- Isolates malformed or failing messages using RabbitMQ Dead Letter Exchange (`dashroute.dlx`).

## Running Locally

To run the Audit Service in development mode:

```bash
pnpm run dev:audit
```
