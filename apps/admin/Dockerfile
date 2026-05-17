FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable

FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/admin/package.json apps/admin/package.json
RUN pnpm install --filter @omoney/admin... --frozen-lockfile

FROM deps AS build
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
COPY apps/admin apps/admin
WORKDIR /app/apps/admin
RUN pnpm build

FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app/apps/admin
RUN apk add --no-cache dumb-init wget \
  && addgroup -S app \
  && adduser -S app -G app \
  && chown -R app:app /app
COPY --from=build --chown=app:app /app/apps/admin/.next/standalone ./
COPY --from=build --chown=app:app /app/apps/admin/.next/static ./apps/admin/.next/static
COPY --from=build --chown=app:app /app/apps/admin/public ./apps/admin/public
USER app
EXPOSE 3001
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "apps/admin/server.js"]
