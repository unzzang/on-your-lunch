import { PriceRange } from './enums';

// 카테고리 요약 (여러 API에서 공통 사용)
export interface CategorySummary {
  id: string;
  name: string;
  colorCode?: string;
}

// 알레르기 타입 요약
export interface AllergyTypeSummary {
  id: string;
  name: string;
}

// GET /categories 응답 아이템
export interface CategoryItem {
  id: string;
  name: string;
  colorCode: string;
  sortOrder: number;
}

// GET /allergy-types 응답 아이템
export interface AllergyTypeItem {
  id: string;
  name: string;
  sortOrder: number;
}

// 방문 요약 (식당 목록/상세에서 사용)
export interface MyVisitSummary {
  rating: number;
  visitCount: number;
}

// 식당 목록 아이템 (탐색, 추천에서 사용)
export interface RestaurantListItem {
  id: string;
  name: string;
  category: CategorySummary & { colorCode: string };
  walkMinutes: number;
  priceRange: PriceRange | null;
  thumbnailUrl: string | null;
  description: string | null;
  isFavorite: boolean;
  myVisit: MyVisitSummary | null;
  isClosed?: boolean;
}

// 메뉴 아이템
export interface MenuItemResponse {
  id: string;
  name: string;
  price: number | null;
}

// 사진 아이템
export interface PhotoItemResponse {
  id: string;
  imageUrl: string;
  isThumbnail: boolean;
}

// GET /restaurants/{id} 응답
export interface RestaurantDetailResponse {
  id: string;
  name: string;
  category: CategorySummary & { colorCode: string };
  address: string;
  latitude: number;
  longitude: number;
  walkMinutes: number;
  phone: string | null;
  description: string | null;
  priceRange: PriceRange | null;
  businessHours: string | null;
  thumbnailUrl: string | null;
  photos: PhotoItemResponse[];
  menus: MenuItemResponse[];
  isFavorite: boolean;
  isClosed: boolean;
  myVisit: (MyVisitSummary & { lastDate: string }) | null;
}

// GET /restaurants/map 응답 핀 아이템
export interface MapPinItem {
  id: string;
  name: string;
  categoryColorCode: string;
  latitude: number;
  longitude: number;
  walkMinutes: number;
  priceRange: PriceRange | null;
  isFavorite: boolean;
}

// GET /restaurants/map 응답
export interface RestaurantMapResponse {
  pins: MapPinItem[];
  totalCount: number;
}
