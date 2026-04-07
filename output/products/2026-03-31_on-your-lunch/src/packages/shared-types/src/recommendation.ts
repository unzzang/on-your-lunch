import { RestaurantListItem } from './restaurant';
import { PriceRange } from './enums';

export interface TodayRecommendationResponse {
  restaurants: RestaurantListItem[];
  refreshCount: number;
  maxRefreshCount: number;
  filterApplied: {
    categoryIds: string[] | null;
    priceRange: PriceRange | null;
    walkMinutes: number;
  };
}

export interface RefreshRecommendationRequest {
  categoryIds?: string[];
  priceRange?: PriceRange;
  walkMinutes?: number;
}
