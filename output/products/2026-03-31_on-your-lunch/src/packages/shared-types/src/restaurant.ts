import { CategorySummary, MyVisitSummary } from './common';
import { PriceRange } from './enums';

export interface RestaurantListItem {
  id: string;
  name: string;
  category: CategorySummary;
  latitude: number;
  longitude: number;
  walkMinutes: number;
  priceRange: PriceRange | null;
  thumbnailUrl: string | null;
  description: string | null;
  isFavorite: boolean;
  myVisit: MyVisitSummary | null;
  isClosed: boolean;
}

export interface RestaurantDetail {
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
  menus: RestaurantMenuItem[];
  isFavorite: boolean;
  isClosed: boolean;
  myVisit: (MyVisitSummary & { lastDate: string }) | null;
}

export interface RestaurantPhoto {
  id: string;
  imageUrl: string;
  isThumbnail: boolean;
}

export interface RestaurantMenuItem {
  id: string;
  name: string;
  price: number | null;
}

export interface RestaurantMapPin {
  id: string;
  name: string;
  categoryColorCode: string;
  categoryName: string;
  latitude: number;
  longitude: number;
  walkMinutes: number;
  priceRange: PriceRange | null;
  isFavorite: boolean;
}
