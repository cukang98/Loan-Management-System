# Build from monorepo root context
FROM node:20-alpine AS builder

WORKDIR /app

# Copy workspace config
COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY apps/backend/package*.json ./apps/backend/

# Install all workspace dependencies
RUN npm install --workspaces

# Copy source
COPY packages/shared/ ./packages/shared/
COPY apps/backend/ ./apps/backend/

# Build shared package first, then backend
RUN npm run build -w packages/shared
RUN npm run build -w apps/backend
RUN npx prisma generate --schema=./apps/backend/prisma/schema.prisma

# Production image
FROM node:20-alpine AS runner

WORKDIR /app

COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY apps/backend/package*.json ./apps/backend/

RUN npm install --workspaces --omit=dev

COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/node_modules/.prisma ./apps/backend/node_modules/.prisma
COPY apps/backend/prisma ./apps/backend/prisma

EXPOSE 3001

# Run migrations then start
CMD ["sh", "-c", "npx prisma migrate deploy --schema=./apps/backend/prisma/schema.prisma && node apps/backend/dist/main"]
