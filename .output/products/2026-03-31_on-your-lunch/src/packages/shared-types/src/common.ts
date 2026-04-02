import { ErrorCode } from './enums';

// ─────────────────────────────────────────
// API 공통 응답 형식 (API 스펙 1.3절)
//
// 모든 API 응답은 이 형태를 따른다.
// 프론트에서 API를 호출하면 항상 이 타입으로 받는다.
// ─────────────────────────────────────────

// 성공 응답: { success: true, data: T }
// T는 각 API마다 다른 데이터 타입 (제네릭)
export interface ApiResponse<T> {
  success: true;
  data: T;
}

// 에러 응답: { success: false, error: { code, message } }
export interface ApiError {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
  };
}

// ─────────────────────────────────────────
// 페이지네이션 (API 스펙 1.3절)
//
// 식당 리스트처럼 데이터가 많을 때 20개씩 나눠서 보내준다.
// meta에 "지금 몇 페이지야, 다음 페이지 있어?" 정보가 들어있다.
// ─────────────────────────────────────────

// 페이지네이션 메타 정보
export interface PaginationMeta {
  page: number;       // 현재 페이지 (1부터 시작)
  limit: number;      // 페이지당 건수 (기본 20)
  totalCount: number;  // 전체 데이터 수
  totalPages: number;  // 전체 페이지 수
  hasNext: boolean;    // 다음 페이지 있는지
}

// 페이지네이션 응답: items 배열 + meta
export interface PaginatedData<T> {
  items: T[];
  meta: PaginationMeta;
}

// ─────────────────────────────────────────
// 공통 하위 타입
//
// 여러 API 응답에서 반복되는 작은 타입들.
// 예: 식당 카드에도, 추천 카드에도, 먹은 이력에도
// "카테고리 정보"가 들어간다. 매번 정의하지 말고 여기서 한 번.
// ─────────────────────────────────────────

// 카테고리 요약 (id + name + 색상)
export interface CategorySummary {
  id: string;
  name: string;
  colorCode: string;
}

// 내 방문 이력 요약 (식당 카드에 표시)
export interface MyVisitSummary {
  rating: number;
  visitCount: number;
}

// ─────────────────────────────────────────
// 마스터 데이터 응답 타입
// GET /categories, GET /allergy-types
// ─────────────────────────────────────────

// 카테고리 목록 아이템 (CategorySummary + sortOrder)
export interface CategoryListItem {
  id: string;
  name: string;
  colorCode: string;
  sortOrder: number;
}

// 알레르기 목록 아이템
export interface AllergyTypeListItem {
  id: string;
  name: string;
  sortOrder: number;
}
