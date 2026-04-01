import { CategorySummary } from './restaurant';

// POST /eating-histories 요청
export interface CreateEatingHistoryRequest {
  restaurantId: string;
  eatenDate: string; // YYYY-MM-DD
  rating: number; // 1~5
  memo?: string;
  isFromRecommendation: boolean;
}

// POST /eating-histories/custom 요청
export interface CreateCustomEatingHistoryRequest {
  restaurantName: string;
  categoryId: string;
  eatenDate: string;
  rating: number;
  memo?: string;
}

// PATCH /eating-histories/{id} 요청
export interface UpdateEatingHistoryRequest {
  rating?: number;
  memo?: string;
}

// 먹은 이력 응답 아이템
export interface EatingHistoryItem {
  id: string;
  restaurant: {
    id: string;
    name: string;
    category: { name: string };
  };
  eatenDate: string;
  rating: number;
  memo: string | null;
  isFromRecommendation: boolean;
  createdAt: string;
}

// 캘린더 일별 기록
export interface CalendarDayRecord {
  id: string;
  restaurant: { id: string; name: string };
  category: CategorySummary & { colorCode: string };
  rating: number;
  memo: string | null;
}

// GET /eating-histories/calendar 응답
export interface CalendarDay {
  date: string;
  records: CalendarDayRecord[];
}

export interface EatingHistoryCalendarResponse {
  year: number;
  month: number;
  days: CalendarDay[];
}
