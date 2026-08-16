.PHONY: help install infra-up infra-down test lint build dev-auth

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

infra-up:
	docker compose up -d

infra-down:
	docker compose down

install:
	pnpm install
	@if [ -f go.work ]; then go work sync; fi

test:
	pnpm -r --filter=!./services/dispatch-engine test
	@if [ -f go.work ]; then (cd packages/go-contracts && go test ./...) && (cd services/dispatch-engine && go test ./...); fi

lint:
	pnpm -r --filter=!./services/dispatch-engine lint
	@if command -v golangci-lint >/dev/null 2>&1; then (cd packages/go-contracts && golangci-lint run) && (cd services/dispatch-engine && golangci-lint run); fi

build:
	pnpm -r --filter=!./services/dispatch-engine build
	@if [ -f services/dispatch-engine/cmd/dispatch/main.go ]; then go build -o bin/dispatch ./services/dispatch-engine/cmd/dispatch; fi

dev-auth:
	pnpm --filter auth-service dev
