# ─────────────────────────────────────────
# 온유어런치 API — Multi-stage Dockerfile
# Railway 배포용 (NestJS + Prisma)
# ─────────────────────────────────────────

# ── Stage 1: Builder ──────────────────────
FROM node:22-slim AS builder

RUN corepack enable && corepack prepare pnpm@10.32.1 --activate

WORKDIR /app

# 워크스페이스 루트 파일 복사
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# 각 패키지의 package.json 복사 (의존성 캐시 활용)
COPY apps/api/package.json apps/api/
COPY packages/shared-types/package.json packages/shared-types/

# 의존성 설치 (전체 — devDependencies 포함, 빌드에 필요)
RUN pnpm install --frozen-lockfile

# 소스 복사
COPY apps/api/ apps/api/
COPY packages/shared-types/ packages/shared-types/

# Prisma Client 생성
RUN cd apps/api && npx prisma generate

# NestJS 빌드
RUN cd apps/api && npx nest build


# ── Stage 2: Runner ───────────────────────
FROM node:22-slim AS runner

RUN corepack enable && corepack prepare pnpm@10.32.1 --activate

# OpenSSL — Prisma가 런타임에 필요
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 워크스페이스 루트 파일 복사
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/api/package.json apps/api/
COPY packages/shared-types/package.json packages/shared-types/

# production 의존성만 설치
RUN pnpm install --frozen-lockfile --prod

# 빌드 산출물 복사
COPY --from=builder /app/apps/api/dist apps/api/dist
COPY --from=builder /app/apps/api/generated apps/api/generated
COPY --from=builder /app/apps/api/prisma apps/api/prisma
COPY --from=builder /app/apps/api/prisma.config.ts apps/api/prisma.config.ts
COPY --from=builder /app/packages/shared-types/ packages/shared-types/

# Prisma Client를 runner에서도 생성 (node_modules 경로가 다를 수 있으므로)
RUN cd apps/api && npx prisma generate

EXPOSE 3000

ENV NODE_ENV=production

# 마이그레이션 적용 후 서버 시작
CMD cd apps/api && npx prisma migrate deploy && node dist/main
