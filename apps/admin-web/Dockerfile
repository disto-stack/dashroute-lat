# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable
WORKDIR /repo

FROM base AS deps
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/ui/package.json packages/ui/package.json
COPY packages/ui-tokens/package.json packages/ui-tokens/package.json
COPY packages/prettier-config/package.json packages/prettier-config/package.json
COPY apps/admin-web/package.json apps/admin-web/package.json
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile --filter admin-web...

FROM deps AS dev
COPY packages/ui packages/ui
COPY packages/ui-tokens packages/ui-tokens
COPY apps/admin-web apps/admin-web
ENV NODE_ENV=development
WORKDIR /repo/apps/admin-web
EXPOSE 3000 9233
CMD ["pnpm", "dev"]

FROM dev AS build
ENV NODE_ENV=production
RUN pnpm build

FROM node:22-alpine AS prod
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
WORKDIR /app
COPY --from=build --chown=node:node /repo/apps/admin-web/.next/standalone ./
COPY --from=build --chown=node:node /repo/apps/admin-web/.next/static ./apps/admin-web/.next/static
USER node
EXPOSE 3000
CMD ["node", "apps/admin-web/server.js"]
