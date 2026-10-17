# ADR 0020: Dockerized Services and Docker Compose Deployment

## Status

Accepted

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
   - `prod`: small, non-root image built from the compiled output (`pnpm deploy --prod` for Node, a static binary for Go, Next.js `output: "standalone"` for web). The `prod` build does not depend on the `dev` stage, so development tooling never reaches the image.

   Go images use `golang:1.26-alpine` as build base (tools such as `air` and `dlv` require it; `go.mod` keeps `go 1.25.0` as the minimum). In `dev`, `air` rebuilds and runs the binary under Delve (`.air.docker.toml`); in `prod`, the binary runs on distroless (alpine when a healthcheck needs `wget`). Every Node service must declare the packages it imports in its own `package.json`: the container installs only that service's dependencies, so imports that used to resolve through root hoisting fail.

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

8. **Developer experience details:**
   - `make up*` rebuilds images (`--build`, cheap thanks to layer caching) and attaches only to application logs: infrastructure containers are passed to `--no-attach` and read with `make logs s=<name>`.
   - Dev containers get a higher memory limit than `prod` (the Go compiler is killed by the production limit).
   - Each service exposes a fixed debug port (Node inspector 9229-9233, Delve 2345-2346), documented in the README with matching VS Code attach configurations.
   - Caddy routes to the containers by default (`*_UPSTREAM` variables); a service running on the host is reached by setting `<SVC>_UPSTREAM=host.docker.internal:<port>` in `.env`.

9. **Healthchecks.** HTTP services (`orders`, `auth`, `notifications`, `geolocation`, `admin-web`) define a Compose `healthcheck` against a local endpoint (`/health`, or `/` where no dedicated endpoint exists). RabbitMQ consumers without an HTTP port (`audit`, `dispatch`) have none for now and rely on `restart: unless-stopped`.

10. **Production overlay (`docker-compose.prod.yml`)**, used on top of `docker-compose.yml`:
    - Only the gateway publishes ports (80/443). PostgreSQL, RabbitMQ, Redis, Loki, Prometheus, the OpenTelemetry Collector and Jaeger publish nothing and are reachable only through the Docker network. Grafana and `admin-web` listen on `127.0.0.1` and are reached through an SSH tunnel.
    - Grafana is the only observability UI; it queries Prometheus, Loki and Jaeger through the internal network. To debug queues, use `rabbitmqctl` through `docker compose exec broker`, or tunnel to the broker container's IP (port 15672) without publishing it.
    - `DB_PASSWORD`, `RABBITMQ_PASS` and `GRAFANA_ADMIN_PASSWORD` are required (no defaults), as are `JWT_SECRET` and `JWT_REFRESH_SECRET`. A service must not fall back to a development secret in production.
    - Application images come from `ghcr.io/<owner>/dashroute-<service>:<tag>`; every container uses `json-file` log rotation (10 MB x 3) so logs cannot fill the disk; Swagger UI is off unless the `docs` profile is enabled.

11. **Production deployment:** images are built in CI, published to a container registry (GitHub Container Registry) and deployed to the VPS with `docker compose pull && docker compose up -d`. Caddy (ADR 0012) remains the gateway and terminates HTTPS. Kubernetes is a possible future option and is not decided here. The CI pipeline, registry publishing and automatic deployment are not part of this decision and will be defined separately.

12. **Out of scope:** `mobile-driver` (Expo) is not containerized; its builds and distribution go through EAS and the app stores.

`orders-service` served as the pilot; the pattern is now applied to `auth`, `audit`, `notifications`, `dispatch-engine`, `geolocation-service` and `admin-web`. The pilot already paid off: the `prod` image exposed a NestJS provider imported as a type only (no `@Inject`), which `tsx` hides in development.

The `scripts` removed in item 7 are all gone: only `dev:mobile-driver` and `storybook:*` remain among the root `dev` scripts.

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
- **Workers without healthchecks:** `audit` and `dispatch` have no HTTP endpoint, so a hung (not crashed) process is not detected until they get one.
- **Root-owned files:** dev containers run as root, so tools such as `air` create root-owned files in bind-mounted directories; running the containers with the developer's UID/GID is a pending improvement.
- **Pending for deployment:** CI with a registry, PostgreSQL backups, a production domain with HTTPS and a Caddy route for `admin-web`, and a smaller observability footprint for small VPSs are not covered by this ADR.
- **Single point of failure:** a single VPS is not highly available. Process-level isolation between services helps, but database backups and monitoring remain necessary and are not addressed by this ADR.
