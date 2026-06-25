FROM node:22
ENV NODE_ENV=development

WORKDIR /usr/src/app

COPY shared/ ./shared/
COPY turbo.json  ./
COPY package.json ./
COPY pnpm-workspace.yaml ./
COPY tsconfig.json ./
COPY services/battle/package*.json ./services/battle/
COPY services/battle/jest.config.js ./services/battle/
COPY services/battle/tsconfig.json ./services/battle/
COPY services/battle/src ./services/battle/src/
COPY services/battle/prisma ./services/battle/prisma/
COPY services/battle/__tests__ ./services/battle/__tests__/
COPY services/battle/.env ./services/battle/.env

USER root

RUN apt-get clean && \
    mkdir -p /var/lib/apt/lists/partial && \
    apt-get update && \
    apt-get install -y netcat-openbsd

RUN corepack enable && pnpm install
RUN cd /usr/src/app/services/battle && npx prisma generate
RUN chown -R node:node /usr/src/app

USER node

EXPOSE 50051

CMD ["pnpm", "--filter", "battle", "start"]

HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
  CMD nc -z localhost 50051 || exit 1
