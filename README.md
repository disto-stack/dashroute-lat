# dashroute-lat

## Running the stack with Docker (ADR 0020)

Infrastructure (PostgreSQL, RabbitMQ, observability, gateway) and application services run in Docker.

| Command                       | What it does                                                                |
| ----------------------------- | --------------------------------------------------------------------------- |
| `make infra-up`               | Infrastructure only                                                         |
| `make up s=orders`            | Full-dev: given service(s) and their dependencies, with hot reload + debug  |
| `make up-backend` / `up-web`  | Full-dev: every backend / every web app                                     |
| `make up-all`                 | Full-dev: everything                                                        |
| `make up-prod s=orders`       | Prod-like: builds and runs the `prod` image (run this before deploying)     |
| `make logs s=orders`          | Follow readable logs of a service                                           |
| `make down`                   | Stop all containers                                                         |

Debugging: services expose a debug port in full-dev (`orders-service`: 9229). Use the matching `Attach: ...` configuration in VS Code.

Manual fallback (service on the host): run `make infra-up`, then `pnpm --filter <service> dev`, and set `ORDERS_UPSTREAM=host.docker.internal:4002` (or the equivalent) in `.env` so the gateway routes to the host.

Only `orders-service` is containerized so far; the remaining services still use their `pnpm dev:*` scripts.
