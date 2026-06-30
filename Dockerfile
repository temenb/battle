# ---------- BASE ----------
FROM node:22 AS base

WORKDIR /usr/src/app

COPY shared ./shared
COPY pnpm-lock.yaml ./
COPY turbo.json ./
COPY package.json ./
COPY pnpm-workspace.yaml ./
COPY tsconfig.base.json ./
COPY proto ./proto

COPY services/battle/package*.json ./services/battle/
COPY services/battle/jest.config.js ./services/battle/
COPY services/battle/tsconfig.json ./services/battle/
COPY services/battle/src ./services/battle/src/
COPY services/battle/__tests__ ./services/battle/__tests__/
COPY services/battle/prisma ./services/battle/prisma/

# ---------- BUILD ----------
FROM base AS build

ENV NODE_ENV=development

RUN apt-get update && apt-get install -y protobuf-compiler

RUN corepack enable
RUN pnpm install --frozen-lockfile
RUN mkdir ./services/battle/src/grpc/generated -p
RUN pnpm run --filter battle proto:generate
RUN pnpm --filter @shared/logger build
RUN pnpm --filter @shared/grpc-client-manager build
RUN pnpm --filter @shared/kafka-manager build
RUN pnpm --filter @shared/pg-boss-manager buld
RUN pnpm --filter battle build
RUN pnpm prune --prod

# ---------- DEV ----------
FROM build AS dev

ENV NODE_ENV=development

USER node

EXPOSE 50051

CMD ["pnpm", "--filter", "battle", "start"]

HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:9090/livez || exit 1

# ---------- PROD ----------
FROM node:22 AS prod

WORKDIR /usr/src/app

ENV NODE_ENV=production

#RUN pnpm deploy --filter battle /out

##COPY --from=build /usr/src/app /usr/src/app

COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/services/battle/node_modules ./services/battle/node_modules
COPY --from=build /usr/src/app/services/battle/dist ./services/battle/dist
COPY --from=build /usr/src/app/shared ./shared


USER node

EXPOSE 50051

CMD ["node", "./services/battle/dist/app.js"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:9090/livez || exit 1
