# ADR 0012: API Gateway with Caddy

## Status

Accepted

## Context

DashRoute is a polyglot microservices system. Our current architecture has each service exposing its own local port (e.g., `auth-service` on 4001, `geolocation-service` on 4003). There is a need for a unified API Gateway to handle ingress traffic, route requests to the appropriate internal services, handle cross-cutting concerns such as CORS and Rate Limiting, and provide automatic SSL/TLS termination for a production-like development environment.

We considered Nginx and Caddy. While Nginx is the industry standard, Caddy is written in Go (aligning with our ecosystem), offers automatic HTTPS even for local development domains (e.g., `api.dashroute.localhost`), and has a significantly simpler declarative configuration syntax (`Caddyfile`).

## Decision

We will use **Caddy** as the API Gateway and Reverse Proxy for DashRoute.

- The Caddy instance will be orchestrated via `docker-compose.yml`.
- A custom Dockerfile will be used to compile Caddy with the `github.com/mholt/caddy-ratelimit` plugin via `xcaddy` to support native rate limiting.
- Caddy will be responsible for routing `/api/v1/*` traffic to the corresponding microservices.
- Caddy will handle global CORS headers and preflight (`OPTIONS`) requests centrally.
- WebSockets (essential for `geolocation-service`) are supported transparently by default in Caddy.

## Consequences

### Positive

- **Automatic Local HTTPS:** Developers get a secure environment locally (`https://api.dashroute.localhost`) without managing `mkcert` manually.
- **Simplicity:** The `Caddyfile` is easy to read, maintain, and extend compared to Nginx configuration files.
- **Centralized Security:** CORS and Rate Limiting are handled before traffic hits the internal network, protecting microservices.
- **Native WebSockets:** No explicit `Upgrade` or `Connection` headers are required in the configuration for WebSockets to work.

### Negative

- **Custom Image Build:** Because standard Caddy does not include rate limiting out-of-the-box, we must maintain a lightweight custom Dockerfile to inject the `caddy-ratelimit` plugin.
- **Learning Curve:** Developers accustomed to Nginx will need to familiarize themselves with the `Caddyfile` directives.
