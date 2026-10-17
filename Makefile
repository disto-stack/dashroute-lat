.PHONY: help install infra-up infra-down up up-backend up-web up-all up-prod down logs ps test lint lint-fix format format-check build

COMPOSE_DEV := docker compose -f docker-compose.yml -f docker-compose.dev.yml
INFRA := api_gateway postgres migrator cache broker swagger_ui jaeger loki prometheus otel-collector grafana
NO_ATTACH := $(foreach i,$(INFRA),--no-attach $(i))

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

infra-up:
	docker compose up -d

infra-down:
	docker compose down

up:
	@test -n "$(s)" || (echo "Usage: make up s=<service...>  (e.g. make up s=orders)" && exit 1)
	$(COMPOSE_DEV) up --build $(NO_ATTACH) $(s)

up-backend:
	$(COMPOSE_DEV) --profile backend up --build $(NO_ATTACH)

up-web:
	$(COMPOSE_DEV) --profile web up --build $(NO_ATTACH)

up-all:
	$(COMPOSE_DEV) --profile all up --build $(NO_ATTACH)

up-prod:
	@test -n "$(s)" || (echo "Usage: make up-prod s=<service...>" && exit 1)
	docker compose up --build $(s)

down:
	$(COMPOSE_DEV) --profile all down

logs:
	@test -n "$(s)" || (echo "Usage: make logs s=<service>" && exit 1)
	$(COMPOSE_DEV) logs -f --no-log-prefix $(s) | pnpm dlx pino-pretty

ps:
	$(COMPOSE_DEV) --profile all ps

install:
	pnpm install
	@if [ -f go.work ]; then go work sync; fi

test:
	pnpm test
	@if [ -f go.work ]; then (cd packages/go-contracts && go test ./...) && (cd services/dispatch-engine && go test ./...) && (cd services/geolocation-service && go test ./...); fi

lint:
	pnpm lint
	@if command -v golangci-lint >/dev/null 2>&1; then golangci-lint run; fi

lint-fix:
	pnpm lint:fix

format:
	pnpm format

format-check:

build:
	pnpm build
	@if [ -f services/dispatch-engine/cmd/dispatch/main.go ]; then go build -o bin/dispatch ./services/dispatch-engine/cmd/dispatch; fi
	@if [ -f services/geolocation-service/cmd/server/main.go ]; then go build -o bin/geolocation ./services/geolocation-service/cmd/server; fi
