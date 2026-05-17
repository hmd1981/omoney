COMPOSE=docker compose --env-file .env.production -f docker-compose.prod.yml

up:
	$(COMPOSE) up -d --build

down:
	$(COMPOSE) down

logs:
	$(COMPOSE) logs -f --tail=200

migrate:
	$(COMPOSE) exec api pnpm prisma:migrate

seed:
	$(COMPOSE) exec api pnpm prisma:seed

backup:
	./scripts/backup.sh

restore:
	./scripts/restore.sh $(FILE)

health:
	./scripts/healthcheck.sh
