# ADR 0014: Addition of ACCEPTED Order Status and Explicit State Machine Transition Actors

## Status

Accepted

## Context

In DashRoute's order lifecycle, when the Dispatch Engine assigned a courier to an order, the status moved directly to `ASSIGNED`. Previously, the order would then move directly from `ASSIGNED` to `IN_TRANSIT` when picked up.

However, real-world courier workflows require an explicit acceptance step: once a courier receives an order assignment, they must actively accept the job before traveling to the pickup location and marking the order `IN_TRANSIT`.

Furthermore, there was a schema inconsistency between the relational database enum (`PICKED_UP`) and the TypeScript application/OpenAPI contracts (`IN_TRANSIT`). Additionally, state transition rules lacked explicit metadata clarifying which system actor (`SYSTEM`, `COURIER`, `ANY`) is authorized to initiate each state transition.

## Decision

1. **Introduce `ACCEPTED` Order Status:**
   - Modify the order state machine transition path to `PENDING` → `ASSIGNED` → `ACCEPTED` → `IN_TRANSIT` → `DELIVERED`.
   - Remove the direct transition from `ASSIGNED` to `IN_TRANSIT`, enforcing that couriers must accept the order first (`ASSIGNED` → `ACCEPTED`).

2. **Add Transition Actor Metadata to Domain State Machine:**
   - Define explicit actor metadata for each state in `order.entity.ts`:
     - `PENDING`: Actor `SYSTEM`
     - `ASSIGNED`: Actor `COURIER`
     - `ACCEPTED`: Actor `COURIER`
     - `IN_TRANSIT`: Actor `COURIER`
     - `DELIVERED`: Actor `ANY`
     - `CANCELLED`: Actor `ANY`
   - Expose `getActorForCurrentState()` on the `Order` entity.

3. **Reconcile Enum Schema Across All Layers:**
   - Create migration `000006_fix_picked_up_and_add_accepted_status` to recreate `order_status` PostgreSQL enum with values `('PENDING', 'ASSIGNED', 'ACCEPTED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED')`, atomically converting legacy `PICKED_UP` records to `IN_TRANSIT`.
   - Update `db/schema.dbml`, Drizzle ORM `schema.ts`, Zod DTOs, and OpenAPI specifications (`dashroute-unified.openapi.yaml` and `dev/orders-service.openapi.yaml`).

4. **Implement Courier Accept Endpoint and Use Case:**
   - Add `AcceptOrderUseCase` and HTTP endpoint `PATCH /orders/:id/accept`.
   - Require authentication & authorization via CASL (`can('update', 'Order')`) and verify that the requesting courier ID matches the order's assigned `courierId`.

## Consequences

### Positive

- **Clarity in Driver Workflow:** Couriers have explicit control to accept assigned deliveries before starting transit.
- **Unified Domain & Schema Types:** Eliminates `PICKED_UP` vs `IN_TRANSIT` discrepancies across database, ORM, OpenAPI, and NestJS code.
- **Expressive State Machine:** State machine transition rules explicitly declare valid target states and required actors.
- **Strict 4-Layer Synchronization:** Prevents silent schema/contract breaks between PostgreSQL, DBML, Drizzle, and OpenAPI.

### Negative

- **Breaking Transition Rule for API Consumers:** Direct transition from `ASSIGNED` to `IN_TRANSIT` is no longer permitted; clients must send `PATCH /orders/:id/accept` before proceeding to transit state.
