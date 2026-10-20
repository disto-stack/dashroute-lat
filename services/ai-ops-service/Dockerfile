# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
WORKDIR /repo

FROM base AS deps
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/prettier-config/package.json packages/prettier-config/package.json
COPY services/ai-ops-service/package.json services/ai-ops-service/package.json
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile --filter ai-ops-service...

FROM deps AS dev
COPY packages/prettier-config packages/prettier-config
COPY services/ai-ops-service services/ai-ops-service
ENV NODE_ENV=development
WORKDIR /repo/services/ai-ops-service
EXPOSE 4005 9233
CMD ["pnpm", "dev"]

FROM dev AS build
RUN pnpm build

FROM build AS pruned
WORKDIR /repo
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm --filter ai-ops-service deploy --prod /out

FROM node:22-alpine AS prod
ENV NODE_ENV=production
WORKDIR /app
COPY --from=pruned --chown=node:node /out/node_modules ./node_modules
COPY --from=build --chown=node:node /repo/services/ai-ops-service/dist ./dist
COPY --from=build --chown=node:node /repo/services/ai-ops-service/package.json ./package.json
USER node
EXPOSE 4005
CMD ["node", "--import", "./dist/instrumentation.js", "dist/main.js"]
