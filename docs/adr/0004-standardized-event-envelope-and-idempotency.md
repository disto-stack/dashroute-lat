# ADR 0004: Standardized Event Envelope and Idempotency Strategy

## Status

Accepted

## Context

DashRoute is a polyglot microservices system built with Node.js/TypeScript and Go. Without a strictly enforced message envelope, message structures become inconsistent, complicating distributed tracing, auditing, debugging, and duplicate message detection.

Because message brokers guarantee *at-least-once* delivery, consumers must safely handle redelivered or out-of-order messages.

## Decision

Establish a mandatory **Standard Event Envelope** for all messages published to `dashroute.events`:

```json
{
  "event_id": "uuid-v4",
  "event_type": "string (e.g., order.created, delivery.assigned)",
  "occurred_at": "ISO-8601 UTC timestamp",
  "version": "semver string (e.g., 1.0)",
  "producer": "service-name",
  "payload": {}
}
