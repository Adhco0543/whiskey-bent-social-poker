# NestJS API for Render's Docker web service.
FROM node:22-bookworm-slim
WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

COPY . .
RUN npm ci
RUN npx prisma generate --schema packages/database/prisma/schema.prisma
RUN npm run build --workspace @whiskey-bent/database
RUN npm run build --workspace @whiskey-bent/api

ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "run", "start", "--workspace", "@whiskey-bent/api"]
