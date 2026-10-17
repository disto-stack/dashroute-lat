# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
WORKDIR /repo

FROM base AS deps
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/prettier-config/package.json packages/prettier-config/package.json
COPY services/notifications-service/package.json services/notifications-service/package.json
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile --filter notifications-service...

FROM deps AS dev
COPY packages/prettier-config packages/prettier-config
COPY services/notifications-service services/notifications-service
ENV NODE_ENV=development
WORKDIR /repo/services/notifications-service
EXPOSE 4004 9232
CMD ["pnpm", "dev"]

FROM dev AS build
RUN pnpm build

FROM build AS pruned
WORKDIR /repo
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm --filter notifications-service deploy --prod /out

FROM node:22-alpine AS prod
ENV NODE_ENV=production
WORKDIR /app
COPY --from=pruned --chown=node:node /out/node_modules ./node_modules
COPY --from=build --chown=node:node /repo/services/notifications-service/dist ./dist
COPY --from=build --chown=node:node /repo/services/notifications-service/package.json ./package.json
USER node
EXPOSE 4004
CMD ["node", "--import", "./dist/instrumentation.js", "dist/main.js"]
