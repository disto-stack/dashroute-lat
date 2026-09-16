# ADR 0011: Observability and Logging Strategy

## Status

Accepted

## Context

DashRoute is a polyglot microservices system composed of Node.js/NestJS and Go services, communicating asynchronously via RabbitMQ and synchronously via HTTP/gRPC.

Without a standardized logging and observability strategy:

- Logs are unformatted text or inconsistent console statements across languages, hindering automated parsing and centralized ingestion.
- Cross-service transactions lack distributed correlation IDs (`traceId`), making root-cause debugging across service boundaries extremely difficult.
- Metrics collection varies per service, preventing centralized system health monitoring.

While ADR 0002 and ADR 0005 define the `Audit Service` for storing immutable business events in PostgreSQL, an application-level telemetry and structured logging standard is required.

## Decision

We adopt OpenTelemetry (OTel) as the universal CNCF standard for distributed tracing, metrics, and log context propagation, paired with high-performance language-native structured loggers.

1. **Structured JSON Logging:**
   - **Node.js/NestJS Services:** Use `pino` and `nestjs-pino` for asynchronous JSON logging.
   - **Go Services:** Use `zap` (Uber) configured for structured JSON output.
   - **Required Log Schema:** Every log record MUST include at minimum: `timestamp`, `level`, `serviceName`, `msg`, `environment`, and `traceId` (if inside an active request/context).

2. **Distributed Tracing & Context Propagation:**
   - Use **OpenTelemetry SDKs** in all microservices.
   - **HTTP Headers:** Standard W3C Trace Context headers (`traceparent`, `tracestate`) MUST be passed on all outbound HTTP calls.
   - **RabbitMQ Messages:** `traceparent` MUST be injected into the message headers upon publishing (via standard event envelope defined in ADR 0004) and extracted by consumers.

3. **Rejection of Canonical Logs for Core Application Telemetry:**
   - We explicitly choose **Standard Structured Logging** (emitting logs throughout the request lifecycle) rather than single Canonical Logs, ensuring error visibility in crash scenarios (e.g., OOM) and real-time streaming capabilities.

4. **Local & Production Stack (LGTM):**
   - **Local Development:** Developers can launch an ephemeral telemetry stack via Docker Compose (`Grafana`, `Loki`, `Prometheus`, `Tempo`/`Jaeger`).
   - **Vendor Independence:** Telemetry exporters will push data via standard OTLP (OpenTelemetry Protocol), allowing seamless switching between local Docker containers and managed cloud backends (e.g., Datadog, Grafana Cloud) via environment variables.

## Consequences

### Positive

- **Polyglot Uniformity:** Consistent JSON log format and trace context across Node.js and Go services.
- **Vendor Agnostic:** Decouples code from specific monitoring vendors via OpenTelemetry.
- **High Performance:** Pino and Zap minimize CPU and memory overhead compared to standard console logging.
- **End-to-End Tracing:** Trace IDs allow tracing requests across HTTP and RabbitMQ asynchronously.

### Negative

- **Slight Footprint Increase:** Small overhead from OpenTelemetry SDK instrumentation and context propagation.
- **Developer Discipline:** Requires developers to use the standardized logger module instead of primitive `console.log` or `fmt.Println`.
