import { PriceRange } from './enums';
import { CategorySummary, MyVisitSummary } from './common';
import { WalkMinutes } from './constants';

// ─────────────────────────────────────────
// 추천 API 타입 (API 스펙 4절)
// ─────────────────────────────────────────

// 추천 카드 1장에 들어가는 식당 정보
export interface RecommendedRestaurant {
  id: string;
  name: string;
  category: CategorySummary;
  walkMinutes: number;
  priceRange: PriceRange | null;
  thumbnailUrl: string | null;
  description: string | null;
  isFavorite: boolean;
  myVisit: MyVisitSummary | null;
}

// --- 오늘의 추천 조회 (GET /recommendations/today) ---

export interface RecommendationTodayResponse {
  restaurants: RecommendedRestaurant[];  // 최대 3개
  refreshCount: number;                  // 현재 새로고침 횟수 (0~5)
  maxRefreshCount: number;               // 최대 5
  filterApplied: {
    categoryIds: string[] | null;
    priceRange: PriceRange | null;
    walkMinutes: WalkMinutes;
  };
}

// --- 추천 새로고침 (POST /recommendations/today/refresh) ---

export interface RefreshRecommendationRequest {
  categoryIds?: string[];
  priceRange?: PriceRange;
  walkMinutes?: WalkMinutes;
}
// 응답은 RecommendationTodayResponse와 동일 (refreshCount가 1 증가)
