.PHONY: help install infra-up infra-down test lint lint-fix format format-check build dev-auth

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

infra-up: ## Start local infrastructure containers (Postgres, Redis, RabbitMQ, Swagger)
	docker compose up -d

infra-down: ## Stop all local infrastructure containers
	docker compose down

install: ## Install dependencies across all workspaces
	pnpm install
	@if [ -f go.work ]; then go work sync; fi

test: ## Run test suites across all services
	pnpm -r --filter=!./services/dispatch-engine test
	@if [ -f go.work ]; then (cd packages/go-contracts && go test ./...) && (cd services/dispatch-engine && go test ./...); fi

lint: ## Run linting on TypeScript and Go services
	pnpm -r --filter=!./services/dispatch-engine lint
	@if command -v golangci-lint >/dev/null 2>&1; then golangci-lint run; fi

lint-fix: ## Auto-fix lint issues on TypeScript services
	pnpm -r --filter=!./services/dispatch-engine lint:fix

format: ## Format codebase with Prettier
	pnpm format

format-check: ## Check formatting with Prettier
	pnpm format:check

build:
	pnpm -r --filter=!./services/dispatch-engine build
	@if [ -f services/dispatch-engine/cmd/dispatch/main.go ]; then go build -o bin/dispatch ./services/dispatch-engine/cmd/dispatch; fi

dev-auth:
	pnpm --filter auth-service dev
