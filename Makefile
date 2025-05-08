## Variables
APP_NAME = centralauth
BUILD_DIR = build
MAIN_PATH = ./cmd/api
GO_FILES = $(wildcard **/*.go)
# Database configuration with consistent credentials
DB_USER ?= satish
DB_PASSWORD ?= satish
DB_NAME ?= centralauthdb
DB_HOST ?= localhost
DB_PORT ?= 5432
DB_URL ?= postgresql://$(DB_USER):$(DB_PASSWORD)@$(DB_HOST):$(DB_PORT)/$(DB_NAME)?sslmode=disable
CLIENT_DIR = ./client
# Migration configuration
MIGRATION_DIR = ./internal/db/migrations

## Build commands
.PHONY: build-server
build-server:
	cd server && mkdir -p $(BUILD_DIR) && go build -o $(BUILD_DIR)/$(APP_NAME) $(MAIN_PATH)

.PHONY: clean
clean:
	rm -rf ./server/$(BUILD_DIR)/*

.PHONY: run-server
run-server: build-server
	./server/$(BUILD_DIR)/$(APP_NAME)

.PHONY: dev-server
dev-server:
	cd server && air

.PHONY: dev-client
dev-client:
	cd $(CLIENT_DIR) && pnpm run dev

## Client commands
.PHONY: build-client
build-client:
	cd $(CLIENT_DIR) && pnpm run build

.PHONY: install-client-deps
install-client-deps:
	cd $(CLIENT_DIR) && pnpm install

## Docker commands
.PHONY: docker-build
docker-build:
	docker build -t $(APP_NAME) ./server

.PHONY: docker-run
docker-run:
	docker run --name $(APP_NAME) -p 8080:8080 --env-file .env $(APP_NAME)

.PHONY: docker-stop
docker-stop:
	docker stop $(APP_NAME) && docker rm $(APP_NAME) || true

## Database commands
.PHONY: db-start
db-start:
	docker run --name postgres -e POSTGRES_USER=$(DB_USER) -e POSTGRES_PASSWORD=$(DB_PASSWORD) -e POSTGRES_DB=$(DB_NAME) -p $(DB_PORT):5432 -d postgres:14-alpine

.PHONY: db-stop
db-stop:
	docker stop postgres && docker rm postgres || true

.PHONY: db-create
db-create:
	PGPASSWORD=$(DB_PASSWORD) createdb --username=$(DB_USER) --host=$(DB_HOST) --port=$(DB_PORT) $(DB_NAME) || echo "Database already exists"

.PHONY: db-drop
db-drop:
	PGPASSWORD=$(DB_PASSWORD) dropdb --username=$(DB_USER) --host=$(DB_HOST) --port=$(DB_PORT) $(DB_NAME) || echo "Database does not exist"

## Migration commands
.PHONY: migrate-create
migrate-create:
	@read -p "Enter migration name: " name; \
	cd server && goose -dir $(MIGRATION_DIR) create $$(echo $$name | tr ' ' '_') sql -s

.PHONY: migrate-up
migrate-up:
	cd server && goose -dir $(MIGRATION_DIR) postgres "$(DB_URL)" up

.PHONY: migrate-down
migrate-down:
	cd server && goose -dir $(MIGRATION_DIR) postgres "$(DB_URL)" down

.PHONY: migrate-status
migrate-status:
	cd server && goose -dir $(MIGRATION_DIR) postgres "$(DB_URL)" status

.PHONY: migrate-reset
migrate-reset:
	cd server && goose -dir $(MIGRATION_DIR) postgres "$(DB_URL)" reset

## Code generation commands
.PHONY: sqlc-generate
sqlc-generate:
	cd server && sqlc generate

## Testing commands
.PHONY: test-server
test-server:
	cd server && go test ./... -v

.PHONY: test-client
test-client:
	cd $(CLIENT_DIR) && pnpm test

.PHONY: test-coverage
test-coverage:
	cd server && go test ./... -coverprofile=coverage.out && go tool cover -html=coverage.out

## Development setup
.PHONY: setup-server
setup-server: install-server-deps db-create sqlc-generate

.PHONY: install-server-deps
install-server-deps:
	cd server && go mod tidy

.PHONY: setup
setup: setup-server install-client-deps

.PHONY: air-init
air-init:
	cd server && air init

## Run both client and server in development mode
.PHONY: dev
dev:
	@echo "Starting both client and server..."
	@(trap 'kill 0' INT; \
	$(MAKE) dev-server & \
	sleep 2 && $(MAKE) dev-client & \
	wait)

## Help
.PHONY: help
help:
	@echo "CentralAuth Development Commands"
	@echo "================================"
	@echo
	@echo "Development:"
	@echo "  make setup            - Set up complete development environment"
	@echo "  make dev              - Run both client and server in development mode"
	@echo "  make dev-server       - Run the server with hot reload using Air"
	@echo "  make dev-client       - Run the client with Vite dev server"
	@echo "  make air-init         - Initialize Air configuration file"
	@echo
	@echo "Building:"
	@echo "  make build-server     - Build the server application"
	@echo "  make build-client     - Build the client application"
	@echo "  make clean            - Remove build artifacts"
	@echo "  make run-server       - Build and run the server application"
	@echo
	@echo "Docker:"
	@echo "  make docker-build     - Build server docker image"
	@echo "  make docker-run       - Run server in docker container"
	@echo "  make docker-stop      - Stop and remove server docker container"
	@echo
	@echo "Database:"
	@echo "  make db-create        - Create database"
	@echo "  make db-drop          - Drop database"
	@echo "  make db-start         - Start PostgreSQL in Docker"
	@echo "  make db-stop          - Stop PostgreSQL Docker container"
	@echo
	@echo "Migrations:"
	@echo "  make migrate-create   - Create a new migration file"
	@echo "  make migrate-up       - Apply all or N up migrations"
	@echo "  make migrate-down     - Roll back the most recent migration"
	@echo "  make migrate-status   - Show migration status"
	@echo "  make migrate-reset    - Roll back all migrations"
	@echo
	@echo "Code Generation:"
	@echo "  make sqlc-generate    - Generate Go code from SQL"
	@echo
	@echo "Testing:"
	@echo "  make test-server      - Run server tests"
	@echo "  make test-client      - Run client tests"
	@echo "  make test-coverage    - Run server tests with coverage"
	@echo
	@echo "Dependencies:"
	@echo "  make install-server-deps - Install server dependencies"
	@echo "  make install-client-deps - Install client dependencies"