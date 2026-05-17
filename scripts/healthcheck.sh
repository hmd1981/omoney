#!/usr/bin/env sh
set -eu

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
ENV_FILE="${ENV_FILE:-.env.production}"

docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" ps
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T api wget -qO- http://localhost:4000/health
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T web wget -qO- http://localhost:3000/fa >/dev/null
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T admin wget -qO- http://localhost:3001 >/dev/null
