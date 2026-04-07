/** 성공 응답 래퍼 */
export interface ApiResponse<T> {
  success: true;
  data: T;
}

/** 에러 응답 래퍼 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

/** 페이지네이션 메타 */
export interface PaginationMeta {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
}

/** 페이지네이션 응답 */
export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

/** 알레르기 타입 */
export interface AllergyType {
  id: string;
  name: string;
}

/** 카테고리 요약 */
export interface CategorySummary {
  id: string;
  name: string;
  colorCode: string;
}

/** 내 방문 요약 */
export interface MyVisitSummary {
  rating: number;
  visitCount: number;
  lastDate?: string;
}

/** 에러 코드 상수 */
export const ErrorCode = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  DUPLICATE: 'DUPLICATE',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  REFRESH_LIMIT_EXCEEDED: 'REFRESH_LIMIT_EXCEEDED',
} as const;

export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode];

/** 이벤트 트래킹 요청 */
export interface CreateEventRequest {
  eventName: string;
  eventData?: Record<string, any>;
}

/** 이벤트 트래킹 응답 */
export interface CreateEventResponse {
  id: string;
  eventName: string;
}

/** 공유 링크 응답 */
export interface ShareLinkResponse {
  restaurantId: string;
  restaurantName: string;
  shareUrl: string;
  deepLink: string;
}
