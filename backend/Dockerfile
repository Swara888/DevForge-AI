FROM node:22-bookworm-slim

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY tsconfig.json ./
COPY prisma.config.ts ./
COPY prisma ./prisma
COPY src ./src

RUN DATABASE_URL="postgresql://devforge:devforge_password@localhost:5433/devforge" SHADOW_DATABASE_URL="postgresql://devforge:devforge_password@localhost:5433/devforge" npx prisma generate

RUN npm run build

EXPOSE 5000

CMD ["node", "dist/server.js"]