export interface CreateEatingHistoryRequest {
  restaurantId: string;
  eatenDate: string;
  rating: number;
  memo?: string;
  isFromRecommendation: boolean;
}

export interface CreateCustomEatingHistoryRequest {
  restaurantName: string;
  categoryId: string;
  eatenDate: string;
  rating: number;
  memo?: string;
}

export interface UpdateEatingHistoryRequest {
  rating?: number;
  memo?: string;
}

export interface EatingHistoryItem {
  id: string;
  restaurant: {
    id: string | null;
    name: string;
    category: { name: string; colorCode: string };
  } | null;
  eatenDate: string;
  rating: number;
  memo: string | null;
  isFromRecommendation: boolean;
  createdAt: string;
}

export interface CalendarDay {
  date: string;
  records: CalendarRecord[];
}

export interface CalendarRecord {
  id: string;
  restaurant: { id: string | null; name: string; thumbnailUrl: string | null };
  category: { name: string; colorCode: string };
  rating: number;
  memo: string | null;
}

export interface CalendarResponse {
  year: number;
  month: number;
  days: CalendarDay[];
}
