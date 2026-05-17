FROM node:22-bookworm-slim AS base
WORKDIR /app
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && corepack enable

FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json apps/api/package.json
RUN pnpm install --filter @omoney/api... --frozen-lockfile

FROM deps AS build
ENV DATABASE_URL=postgresql://build:build@localhost:5432/build?schema=public
COPY apps/api apps/api
WORKDIR /app/apps/api
RUN pnpm prisma:generate && pnpm build

FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app/apps/api
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates dumb-init wget \
  && rm -rf /var/lib/apt/lists/* \
  && groupadd --system app \
  && useradd --system --gid app --create-home app \
  && mkdir -p /app/uploads /app/storage/logs \
  && chown -R app:app /app
COPY --from=build --chown=app:app /app/node_modules /app/node_modules
COPY --from=build --chown=app:app /app/apps/api/node_modules /app/apps/api/node_modules
COPY --from=build --chown=app:app /app/apps/api/dist dist
COPY --from=build --chown=app:app /app/apps/api/prisma prisma
COPY --from=build --chown=app:app /app/apps/api/prisma.config.ts prisma.config.ts
COPY --chown=app:app apps/api/package.json package.json
COPY --chown=app:app apps/api/docker-entrypoint.sh docker-entrypoint.sh
RUN chmod +x docker-entrypoint.sh
USER app
EXPOSE 4000
ENTRYPOINT ["dumb-init", "--"]
CMD ["./docker-entrypoint.sh"]
