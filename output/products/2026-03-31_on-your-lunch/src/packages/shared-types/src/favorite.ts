import { CategorySummary } from './common';
import { PriceRange } from './enums';

export interface FavoriteToggleRequest {
  restaurantId: string;
}

export interface FavoriteToggleResponse {
  restaurantId: string;
  isFavorite: boolean;
}

export interface FavoriteListItem {
  id: string;
  createdAt: string;
  restaurant: {
    id: string;
    name: string;
    category: CategorySummary;
    thumbnailUrl: string | null;
    priceRange: PriceRange | null;
    isClosed: boolean;
  };
}

export interface FavoriteListResponse {
  items: FavoriteListItem[];
  totalCount: number;
}
