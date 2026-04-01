import { PriceRange } from './enums';
import { RestaurantListItem } from './restaurant';

// 적용된 필터 정보
export interface FilterApplied {
  categoryIds: string[] | null;
  priceRange: PriceRange | null;
  walkMinutes: number;
}

// GET /recommendations/today 응답
export interface RecommendationTodayResponse {
  restaurants: RestaurantListItem[];
  refreshCount: number;
  maxRefreshCount: number;
  filterApplied: FilterApplied;
}

// POST /recommendations/today/refresh 요청
export interface RefreshRecommendationRequest {
  categoryIds?: string[];
  priceRange?: PriceRange;
  walkMinutes?: number;
}
