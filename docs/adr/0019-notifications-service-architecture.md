# ADR 0019: Notifications Service Architecture

## Status

Accepted

## Context

DashRoute needs a mechanism to notify the mobile driver app when a mission is assigned. We want to support multiple channels (Push Notifications via Expo, WebSocket, and potentially Email/SMS in the future). This service needs to act purely as an event consumer and dispatcher without heavy domain logic.

## Decision

We will introduce a dedicated `notifications-service` built with NestJS and TypeScript.

1. **Lightweight Worker / Pipe Pattern**: Following ADR 0005, this service will NOT use a strict Clean/Hexagonal Architecture (no `infrastructure/` boundaries). It will have a flat structure (e.g., `src/database`, `src/consumers`, `src/devices`) to avoid redundant boilerplate.
2. **Strategy Pattern for Channels**: The service uses the Strategy pattern for notification channels (`ExpoPushChannel`, `WebSocketChannel`, etc.) implementing a common `NotificationChannel` interface.
3. **Double WebSocket via Caddy**: The mobile driver app maintains a second WebSocket connection specifically for notifications multiplexed through the existing Caddy API gateway (ADR 0012).
4. **Resilience & Idempotency**: The service implements idempotency via a `notifications_processed_events` table and handles transient errors with exponential backoff.

## Consequences

### Positive

* **Simplicity**: No unnecessary layers for a simple pipe worker.
* **Extensibility**: Adding new channels requires adding a single new class.
* **Resilience**: A failure in one channel does not block delivery on another.

### Negative

* **Client Complexity**: Requires the mobile app to manage an additional WebSocket connection.
