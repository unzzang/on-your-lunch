import { CategorySummary } from './common';

// ─────────────────────────────────────────
// 먹은 이력 API 타입 (API 스펙 6절)
// ─────────────────────────────────────────

// --- 먹었어요 기록 (POST /eating-histories) ---

export interface CreateEatingHistoryRequest {
  restaurantId: string;
  eatenDate: string;           // "2026-03-30" (YYYY-MM-DD)
  rating: number;              // 1~5
  memo?: string;               // 최대 300자
  isFromRecommendation: boolean;
}

// --- 직접 입력 식당 기록 (POST /eating-histories/custom) ---

export interface CreateCustomEatingHistoryRequest {
  restaurantName: string;
  categoryId: string;
  eatenDate: string;
  rating: number;
  memo?: string;
}

// --- 먹은 이력 응답 (공통) ---

export interface EatingHistoryResponse {
  id: string;
  restaurant: {
    id: string;
    name: string;
    category: CategorySummary;
  };
  eatenDate: string;
  rating: number;
  memo: string | null;
  isFromRecommendation: boolean;
  createdAt: string;
}

// --- 이력 수정 (PATCH /eating-histories/{id}) ---

export interface UpdateEatingHistoryRequest {
  rating?: number;
  memo?: string;
}

// --- 캘린더 조회 (GET /eating-histories/calendar) ---

export interface CalendarDayRecord {
  id: string;
  restaurant: { id: string; name: string };
  category: CategorySummary;
  rating: number;
  memo: string | null;
}

export interface CalendarDay {
  date: string;                 // "2026-03-28"
  records: CalendarDayRecord[];
}

export interface EatingHistoryCalendarResponse {
  year: number;
  month: number;
  days: CalendarDay[];          // 기록이 있는 날짜만 포함
}
