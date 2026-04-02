// ─────────────────────────────────────────
// Prisma schema의 enum과 동일한 값.
// Prisma가 DB의 source of truth이고,
// 이 파일은 프론트↔백엔드 API 계약의 source of truth.
// 값을 바꿀 때는 Prisma schema → 여기 → 양쪽 동시에.
// ─────────────────────────────────────────

// 가격대 — Prisma enum PriceRange와 동일
export enum PriceRange {
  UNDER_10K = 'UNDER_10K',
  BETWEEN_10K_20K = 'BETWEEN_10K_20K',
  OVER_20K = 'OVER_20K',
}

// 식당 데이터 출처 — Prisma enum DataSource와 동일
export enum DataSource {
  KAKAO = 'KAKAO',
  MANUAL = 'MANUAL',
  USER = 'USER',
}

// ─────────────────────────────────────────
// API에서만 쓰는 enum (DB 컬럼이 아님)
// ─────────────────────────────────────────

// 에러 코드 — API 스펙 1.5절
export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  DUPLICATE = 'DUPLICATE',
  REFRESH_LIMIT_EXCEEDED = 'REFRESH_LIMIT_EXCEEDED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

// 식당 리스트 정렬 — API 스펙 5.3절
export enum RestaurantSort {
  DISTANCE = 'distance',
  RATING = 'rating',
}
