FROM node:22-bookworm-slim

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY tsconfig.json ./
COPY prisma.config.ts ./
COPY prisma ./prisma
COPY scripts ./scripts
COPY src ./src

RUN npx prisma generate
RUN npm run build

EXPOSE 5000

CMD ["node", "dist/server.js"]