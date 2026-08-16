# ADR 0002: Event-Driven Backbone and RabbitMQ Topology

## Status

Accepted

## Context

The order processing pipeline requires decoupled, asynchronous execution. When a customer submits an order, the ingestion HTTP handler must return immediately without waiting for courier geospatial calculations, audit logging, or third-party push notifications.

Direct synchronous HTTP (REST/gRPC) calls between internal services create tight coupling, cascade failures, and latency accumulation across dependent services.

## Decision

Implement an **Asynchronous Event-Driven Architecture (EDA)** backed by **RabbitMQ 4.0** utilizing the AMQP 0-9-1 protocol:

1. **Primary Exchange (`dashroute.events`):**

   * Configured as a durable `topic` exchange to route business domain events using dot-notation routing keys (`order.created`, `delivery.assigned`, `delivery.completed`).
2. **Consumer Queues:**
   * `dispatch.orders.q`: Dedicated queue bound to `order.created` for the Go-based Dispatch Engine.
   * `orders.assigned.q`: Dedicated queue bound to `delivery.assigned` for the Orders Service state updater.
   * `audit.events.q`: Dedicated queue bound to `#` (all events) for immutable audit logging.
3. **Dead Letter Exchange (`dashroute.dlx`):**
   * A `fanout` exchange paired with `dead.letter.q` to isolate poisoned or repeatedly failed messages (after 3 consecutive `NACK` attempts) without stalling active queues.

## Consequences

### Positive

* **Low Ingress Latency:** Orders Service confirms order intake (`201 Created`) in <20ms while offloading dispatch computations to background workers.
* **Fault Isolation:** A crash or slowdown in the Dispatch Engine or Audit Service does not impact order ingestion or API responsiveness.
* **Scalability:** Worker consumers can be scaled horizontally and independently based on queue depth metrics.

### Negative

* **Asynchronous Error Handling:** Failures occurring during dispatch must be handled via fallback compensation events rather than immediate HTTP error codes.
* **Message Delivery Semantics:** Consumers must be designed to be idempotent to handle potential at-least-once message deliveries.
