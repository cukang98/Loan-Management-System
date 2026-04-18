.PHONY: run stop restart build logs ps db-migrate db-seed install clean help

## Start database only (Docker), then run backend + frontend locally
run:
	@echo "Clearing ports 3000 and 3001..."
	@lsof -ti :3000 | xargs kill -9 2>/dev/null || true
	@lsof -ti :3001 | xargs kill -9 2>/dev/null || true
	docker compose up -d postgres
	@echo "Waiting for postgres to be ready..."
	@until docker compose exec postgres pg_isready -U postgres > /dev/null 2>&1; do sleep 1; done
	@echo "Postgres ready. Starting backend and frontend..."
	@(cd apps/backend && yarn dev) & (cd apps/frontend && yarn dev) & wait

## Stop database container
stop:
	docker compose down
	@pkill -f "nest start" 2>/dev/null || true
	@pkill -f "next dev" 2>/dev/null || true

## Stop and remove volumes (resets database)
stop-clean:
	docker compose down -v

## Docker-based full stack (slower, requires build)
run-docker:
	docker compose up --build

## Build all Docker images
build:
	docker compose build

## Show running containers
ps:
	docker compose ps

## Tail logs for all services
logs:
	docker compose logs -f

## Tail logs for a specific service: make logs-s service=backend
logs-s:
	docker compose logs -f $(service)

## Run Prisma migrations inside backend container
db-migrate:
	docker compose exec backend npx prisma migrate deploy

## Open Prisma Studio (database GUI)
db-studio:
	docker compose exec backend npx prisma studio

## Open a psql shell in the database container
db-shell:
	docker compose exec postgres psql -U postgres -d loandb

## Install dependencies (host)
install:
	yarn install

## Remove node_modules and build artifacts
clean:
	rm -rf node_modules apps/backend/node_modules apps/frontend/node_modules apps/frontend/.next apps/backend/dist

help:
	@echo ""
	@echo "Usage: make <target>"
	@echo ""
	@grep -E '^##' Makefile | sed 's/## /  /'
	@echo ""
