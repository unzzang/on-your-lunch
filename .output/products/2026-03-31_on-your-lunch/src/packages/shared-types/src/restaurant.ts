import { PriceRange } from './enums';
import { CategorySummary, MyVisitSummary } from './common';

// ─────────────────────────────────────────
// 식당 API 타입 (API 스펙 5절)
// ─────────────────────────────────────────

// --- 식당 상세 (GET /restaurants/{id}) ---

export interface RestaurantPhoto {
  id: string;
  imageUrl: string;
  isThumbnail: boolean;
}

export interface RestaurantMenu {
  id: string;
  name: string;
  price: number | null; // null이면 가격 미확인
}

export interface RestaurantDetailResponse {
  id: string;
  name: string;
  category: CategorySummary;
  address: string;
  latitude: number;
  longitude: number;
  walkMinutes: number;
  phone: string | null;
  description: string | null;
  priceRange: PriceRange | null;
  businessHours: string | null;
  thumbnailUrl: string | null;
  photos: RestaurantPhoto[];
  menus: RestaurantMenu[];
  isFavorite: boolean;
  isClosed: boolean;
  myVisit: (MyVisitSummary & { lastDate: string }) | null;
}

// --- 식당 리스트 아이템 (GET /restaurants) ---

export interface RestaurantListItem {
  id: string;
  name: string;
  category: CategorySummary;
  walkMinutes: number;
  priceRange: PriceRange | null;
  thumbnailUrl: string | null;
  description: string | null;
  isFavorite: boolean;
  myVisit: MyVisitSummary | null;
  isClosed: boolean;
}

// --- 지도 핀 (GET /restaurants/map) ---

export interface RestaurantMapPin {
  id: string;
  name: string;
  categoryColorCode: string;
  latitude: number;
  longitude: number;
  walkMinutes: number;
  priceRange: PriceRange | null;
  isFavorite: boolean;
}

export interface RestaurantMapResponse {
  pins: RestaurantMapPin[];
  totalCount: number;
}

// --- 식당 검색 (GET /restaurants/search) ---
// 응답은 식당 리스트와 동일한 형태 (페이지네이션 + RestaurantListItem)
// PaginatedData<RestaurantListItem>으로 사용
export type RestaurantSearchResponse = RestaurantListItem;
