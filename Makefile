.PHONY: help install infra-up infra-down test lint lint-fix format format-check build dev-auth dev-orders dev-audit dev-dispatch dev-geolocation dev-services

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

dev-auth:
	pnpm dev:auth

dev-orders:
	pnpm dev:orders

dev-audit:
	pnpm dev:audit

dev-dispatch:
	pnpm dev:dispatch

dev-geolocation:
	pnpm dev:geolocation

dev-services:
	pnpm dev:services


