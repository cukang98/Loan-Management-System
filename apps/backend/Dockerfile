# -----------------------------
  # 1. Base image
  # -----------------------------
  FROM node:20-alpine AS base
  WORKDIR /app
  RUN apk add --no-cache libc6-compat openssl
  
  # -----------------------------
  # 2. Prune monorepo (关键步骤)
  # -----------------------------
  FROM base AS pruner
  
  # 安装 turbo（轻量）
  RUN npm install -g turbo
  
  # copy 全 repo
  COPY . .
  
  # 只保留 backend 需要的依赖（🔥关键）
  RUN turbo prune --scope=@ck-loan/backend --docker
  
  # -----------------------------
  # 3. Install dependencies
  # -----------------------------
  FROM base AS installer
  
  # 只复制 prune 后的 package.json（不会包含 frontend）
  COPY --from=pruner /app/out/json/ ./
  
  # install 纯净依赖（不会有 next）
  RUN npm ci
  
  # -----------------------------
  # 4. Build
  # -----------------------------
  FROM base AS builder
  
  COPY --from=installer /app/node_modules ./node_modules
  COPY --from=pruner /app/out/full/ ./
  
  # prisma generate（很重要）
  RUN cd apps/backend && npx prisma generate
  
  # build backend only
  RUN npx turbo run build --filter=@ck-loan/backend
  
  # -----------------------------
  # 5. Production runner
  # -----------------------------
  FROM node:20-alpine AS runner
  
  WORKDIR /app
  ENV NODE_ENV=production
  
  RUN apk add --no-cache openssl
  
  # 只 copy runtime 需要的东西
  COPY --from=builder /app/node_modules ./node_modules
  COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
  COPY --from=builder /app/apps/backend/prisma ./apps/backend/prisma
  COPY --from=builder /app/packages ./packages
  
  EXPOSE 3001
  
  # 启动前跑 migration
  CMD ["sh", "-c", "cd apps/backend && npx prisma migrate deploy && node dist/main.js"]