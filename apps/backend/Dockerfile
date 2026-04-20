FROM node:20-alpine AS builder
WORKDIR /app

# Ensure we have openssl for prisma
RUN apk add --no-cache openssl

COPY package*.json ./
COPY turbo.json ./
COPY apps/frontend/package*.json ./apps/frontend/
COPY apps/backend/package*.json ./apps/backend/
COPY packages/ ./packages/
RUN npm ci

COPY . .
RUN cd apps/backend && npx prisma generate
RUN npx turbo run build --filter=@ck-loan/backend

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache openssl

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/prisma ./apps/backend/prisma
COPY --from=builder /app/packages ./packages

EXPOSE 3001

# Migrate DB before start
CMD ["sh", "-c", "cd apps/backend && npx prisma migrate deploy && node dist/main.js"]
