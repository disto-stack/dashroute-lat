# syntax=docker/dockerfile:1.7

FROM golang:1.26-alpine AS base
ENV CGO_ENABLED=0 GOFLAGS=-buildvcs=false
WORKDIR /repo
FROM base AS deps
COPY go.work go.work.sum ./
COPY packages/go-contracts/go.mod packages/go-contracts/go.mod
COPY services/dispatch-engine/go.mod services/dispatch-engine/go.sum services/dispatch-engine/
COPY services/geolocation-service/go.mod services/geolocation-service/go.sum services/geolocation-service/
RUN go mod download

FROM deps AS dev
RUN go install github.com/air-verse/air@latest && go install github.com/go-delve/delve/cmd/dlv@latest
COPY packages/go-contracts packages/go-contracts
COPY services/dispatch-engine services/dispatch-engine
WORKDIR /repo/services/dispatch-engine
EXPOSE 2345
CMD ["air", "-c", ".air.docker.toml"]

FROM deps AS build
COPY packages/go-contracts packages/go-contracts
COPY services/dispatch-engine services/dispatch-engine
WORKDIR /repo/services/dispatch-engine
RUN --mount=type=cache,target=/root/.cache/go-build \
    go build -trimpath -ldflags="-s -w" -o /out/dispatch-engine ./cmd
FROM gcr.io/distroless/static-debian12:nonroot AS prod
COPY --from=build /out/dispatch-engine /app/dispatch-engine
USER nonroot
ENTRYPOINT ["/app/dispatch-engine"]
