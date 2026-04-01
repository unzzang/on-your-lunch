// 공통 API 응답 래퍼
export interface ApiResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

// 페이지네이션 메타
export interface PaginationMeta {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
}

// 페이지네이션 응답
export interface PaginatedData<T> {
  items: T[];
  meta: PaginationMeta;
}

// 공통 에러 코드
export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  DUPLICATE = 'DUPLICATE',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  REFRESH_LIMIT_EXCEEDED = 'REFRESH_LIMIT_EXCEEDED',
}
