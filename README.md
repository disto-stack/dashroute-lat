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

Services: `auth`, `orders`, `audit`, `notifications`, `dispatch`, `geolocation` (profile `backend`) and `admin-web` (profile `web`, http://localhost:3001; set `ADMIN_WEB_PORT` to change it, 3000 is used by Grafana). `mobile-driver` (Expo) is not containerized: run it with `pnpm dev:mobile-driver`.

Debugging: each service exposes a debug port in full-dev. Use the matching `Attach: ...` configuration in VS Code.

| Service       | Debug port   |
| ------------- | ------------ |
| orders        | 9229         |
| auth          | 9230         |
| audit         | 9231         |
| notifications | 9232         |
| admin-web     | 9233         |
| dispatch      | 2345 (Delve) |
| geolocation   | 2346 (Delve) |

Manual fallback (service on the host): run `make infra-up`, then `pnpm --filter <service> dev` (or `air` for Go), and set the matching `AUTH_UPSTREAM` / `ORDERS_UPSTREAM` / `GEO_UPSTREAM` / `NOTIFICATIONS_UPSTREAM=host.docker.internal:<port>` in `.env` so the gateway routes to the host.

Secrets: `make up-prod` requires `JWT_SECRET` and `JWT_REFRESH_SECRET` in `.env`; full-dev falls back to dev-only values.
