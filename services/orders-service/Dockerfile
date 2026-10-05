# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
WORKDIR /repo

FROM base AS deps
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/ts-config/package.json packages/ts-config/package.json
COPY packages/eslint-config/package.json packages/eslint-config/package.json
COPY packages/prettier-config/package.json packages/prettier-config/package.json
COPY services/orders-service/package.json services/orders-service/package.json
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile --filter orders-service...

FROM deps AS dev
COPY packages/ts-config packages/ts-config
COPY packages/eslint-config packages/eslint-config
COPY packages/prettier-config packages/prettier-config
COPY services/orders-service services/orders-service
ENV NODE_ENV=development
WORKDIR /repo/services/orders-service
EXPOSE 4002 9229
CMD ["pnpm", "dev"]

FROM dev AS build
RUN pnpm build

FROM build AS pruned
WORKDIR /repo
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm --filter orders-service deploy --prod /out

FROM node:22-alpine AS prod
ENV NODE_ENV=production
WORKDIR /app
COPY --from=pruned --chown=node:node /out/node_modules ./node_modules
COPY --from=build --chown=node:node /repo/services/orders-service/dist ./dist
COPY --from=build --chown=node:node /repo/services/orders-service/package.json ./package.json
USER node
EXPOSE 4002
CMD ["node", "--import", "./dist/instrumentation.js", "dist/main.js"]
