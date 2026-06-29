# ---------- BASE ----------
FROM node:22 AS base

WORKDIR /usr/src/app

COPY shared ./shared
COPY pnpm-lock.yaml ./
COPY turbo.json ./
COPY package.json ./
COPY pnpm-workspace.yaml ./
COPY tsconfig.json ./

COPY services/battle/package*.json ./services/battle/
COPY services/battle/jest.config.js ./services/battle/
COPY services/battle/tsconfig.json ./services/battle/
COPY services/battle/src ./services/battle/src/
COPY services/battle/__tests__ ./services/battle/__tests__/
COPY services/battle/prisma ./services/battle/prisma/


# ---------- DEV ----------
FROM base AS dev
ENV NODE_ENV=development

USER root
RUN corepack enable && pnpm install
RUN chown -R node:node /usr/src/app

USER node

EXPOSE 50051

CMD ["pnpm", "--filter", "battle", "start"]

HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
  CMD nc -z localhost 50051 || exit 1


# ---------- PROD ----------
FROM base AS prod
ENV NODE_ENV=production

USER root
RUN corepack enable \
 && pnpm install --frozen-lockfile \
 && pnpm run --filter battle build \
 && pnpm prune --prod \
 && chown -R node:node /usr/src/app

USER node

EXPOSE 50051

CMD ["node", "services/battle/dist/app.js"]

HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
  CMD nc -z localhost 50051 || exit 1
