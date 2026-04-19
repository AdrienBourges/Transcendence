FROM node:20-bookworm-slim

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY prisma ./prisma
COPY prisma.config.ts ./
COPY tsconfig.json ./
COPY src ./src
COPY uploads ./uploads

EXPOSE 3000

CMD ["node", "--import", "tsx", "src/server.ts"]
