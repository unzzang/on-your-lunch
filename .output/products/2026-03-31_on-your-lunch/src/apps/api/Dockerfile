# ─────────────────────────────────────────
# 온유어런치 API — Multi-stage Dockerfile
# Railway 배포용 (NestJS + Prisma + PostgreSQL)
# ─────────────────────────────────────────

# ── Stage 1: Build ──────────────────────
FROM node:22-slim AS builder

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@10.6.0 --activate

WORKDIR /app

# 워크스페이스 루트 설정
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/ ./packages/
COPY apps/api/package.json ./apps/api/

# 의존성 설치
RUN pnpm install --frozen-lockfile

# Prisma 스키마 복사 및 클라이언트 생성
COPY apps/api/prisma/ ./apps/api/prisma/
RUN pnpm --filter @on-your-lunch/api exec prisma generate

# 소스 복사 및 빌드
COPY apps/api/ ./apps/api/
RUN pnpm --filter @on-your-lunch/api run build

# ── Stage 2: Production ────────────────
FROM node:22-slim AS runner

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@10.6.0 --activate

WORKDIR /app

# 워크스페이스 루트 설정
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/ ./packages/
COPY apps/api/package.json ./apps/api/

# 프로덕션 의존성만 설치
RUN pnpm install --frozen-lockfile --prod

# Prisma 스키마 + 생성된 클라이언트 복사
COPY apps/api/prisma/ ./apps/api/prisma/
COPY --from=builder /app/apps/api/node_modules/.prisma ./apps/api/node_modules/.prisma
COPY --from=builder /app/node_modules/.pnpm/@prisma+client*/node_modules/@prisma/client/runtime ./node_modules/.pnpm/@prisma+client-runtime/

# 빌드 산출물 복사
COPY --from=builder /app/apps/api/dist ./apps/api/dist

# 환경 설정
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# 마이그레이션 적용 후 서버 시작
CMD ["sh", "-c", "cd apps/api && npx prisma migrate deploy && node dist/main"]
