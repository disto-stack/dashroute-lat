# ADR 0020: Dockerized Services and Docker Compose Deployment

## Status

Draft

## Context

Today only the infrastructure of DashRoute (PostgreSQL, Redis, RabbitMQ, Caddy, the observability stack and the `delivery_migrator`) runs in Docker (ADR 0006, 0011, 0012). The services and apps run directly on the developer's host and reach that infrastructure through `localhost`, while Caddy reaches them through `host.docker.internal`.

This creates two problems:

- **Dev/prod divergence:** the code that is exercised during development is not what will run on the server. Hostnames, environment variables, ports, runtime versions and the build output can differ, so failures only show up at deployment time.
- **No selective, reproducible startup:** `pnpm dev:services` starts every service through `concurrently`, and there is no way to start the real stack for just the pieces being worked on.

The team is small, traffic is low, and the first production target is a single VPS. Kubernetes would add manifests, ingress, secrets and cluster maintenance that solve problems DashRoute does not have yet. The mobile driver app (Expo) is distributed through EAS and the app stores and needs an emulator or a physical device, so it gains nothing from running in a container.

## Decision

Every backend service (NestJS and Go) and every Next.js web app is containerized, and the same Compose definition is used for local development and for the VPS.

1. **Multi-stage Dockerfile per service/app** with at least two targets:
   - `dev`: runs the service's own development command (`pnpm --filter <svc> dev`, or `air` for Go) with an inspector/debugger port exposed. Source code is bind-mounted, so no image rebuild is needed for code changes.
   - `prod`: small, non-root image built from the compiled output (`pnpm deploy --prod` for Node, a static binary for Go, Next.js `output: "standalone"` for web).

2. **Three ways to run the stack:**
   - **Full-dev (primary):** `docker-compose.yml` + `docker-compose.dev.yml`, target `dev`, bind mounts, watch mode and one debug port per service. This is the default for daily development.
   - **Prod-like:** `docker-compose.yml` alone with target `prod`, used before deploying and later in CI to catch build/packaging problems that the `dev` target cannot reveal.
   - **Manual host fallback:** running a single service with `pnpm --filter <svc> dev` (or `air`) against `make infra-up`, for the cases where a container misbehaves.

3. **Selective startup with Compose profiles.** Infrastructure services have no profile and are always available. Application services declare the groups they belong to (`backend`, `web`, `all`). A developer can start one service by name (`make up s=orders`), several (`make up s="orders auth"`), a group (`make up-backend`, `make up-web`) or everything (`make up-all`).

4. **Configuration only through environment variables.** No service may hard-code hosts. In containers the variables point to Compose service names (`DB_HOST=postgres`, `RABBITMQ_HOST=broker`, `OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4317`). Secrets such as `JWT_SECRET` are required and must not have a production fallback.

5. **Caddy upstreams are parameterized** (e.g. `{$ORDERS_UPSTREAM:host.docker.internal:4002}`), so the same `Caddyfile` works with services on the host and with services in containers.

6. **Responsibilities of each tool:**

   | Layer                                                          | Owner                                                                                  |
   | -------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
   | Command that starts the process inside a service               | The service's `package.json` (`dev`, `start`) or `air` for Go. Single source of truth. |
   | Which containers run, with which env, ports, volumes, profiles | Docker Compose                                                                         |
   | Developer-facing interface                                     | `Makefile` (`up`, `down`, `logs`, `ps`, `up-prod`), consistent with ADR 0007           |
   | Validating code (`build`, `lint`, `test`) and caching          | Turborepo + pnpm (ADR 0007), unchanged                                                 |

7. **Scripts replaced by this strategy are removed**, service by service as each one is migrated: the root `dev:<svc>` scripts, `dev:services` and the matching `dev-*` Makefile targets. The `dev` script inside each service's `package.json` stays, since the `dev` Docker target runs it.

8. **Production:** images are built in CI, published to a container registry (GitHub Container Registry) and deployed to the VPS with `docker compose pull && docker compose up -d`. Caddy (ADR 0012) remains the gateway and terminates HTTPS. Kubernetes is a possible future option and is not decided here.

9. **Out of scope:** `mobile-driver` (Expo) is not containerized; its builds and distribution go through EAS and the app stores.

Rollout starts with `orders-service` as a pilot to validate the Dockerfile, Compose profiles, hot reload, debugging and logging before replicating the pattern to the remaining services and apps.

## Consequences

### Positive

- **Dev/prod parity:** hostnames, env vars, network and runtime issues surface on the developer machine instead of on the server.
- **Selective startup:** only the services needed for the current task are started, individually or by group.
- **Same debugging experience:** bind mounts plus watch mode keep hot reload, and each service exposes its own debug port for attach-style debugging.
- **Unchanged observability:** logs, traces and metrics keep flowing to Loki, Jaeger and Prometheus through the OpenTelemetry Collector (ADR 0011); only the collector endpoint changes through an environment variable.
- **Simple deployment:** a single Compose definition for development and the VPS, with Docker images as the unit of deployment.
- **Portable images:** moving to another orchestrator later means migrating the orchestration, not rewriting the images.

### Negative

- **Higher resource usage:** running services in containers uses more memory than running them on the host; profiles and per-service startup mitigate this.
- **More files to maintain:** each service and app needs its own Dockerfile and Compose entries.
- **The `dev` target does not prove the `prod` image:** problems such as runtime dependencies listed as `devDependencies` or files missing from the image only appear in prod-like runs, which must be done before deploying.
- **Initial debugger setup:** each service needs a one-time attach configuration.
- **Single point of failure:** a single VPS is not highly available. Process-level isolation between services helps, but database backups and monitoring remain necessary and are not addressed by this ADR.
