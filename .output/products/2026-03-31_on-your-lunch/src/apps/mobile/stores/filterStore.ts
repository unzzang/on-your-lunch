// ─────────────────────────────────────────
// 필터 스토어
//
// 추천 + 탐색에서 공유하는 필터 상태.
// 카테고리, 가격대, 도보 거리를 관리.
// ─────────────────────────────────────────

import { create } from 'zustand';
import type { PriceRange, WalkMinutes } from '@on-your-lunch/shared-types';

interface FilterState {
  // 선택된 카테고리 ID 목록 (빈 배열 = 전체)
  categoryIds: string[];
  // 선택된 가격대 (null = 전체)
  priceRange: PriceRange | null;
  // 도보 거리 (기본값 15분 = 최대)
  walkMinutes: WalkMinutes;

  // 액션
  setCategoryIds: (ids: string[]) => void;
  toggleCategory: (id: string) => void;
  setPriceRange: (range: PriceRange | null) => void;
  setWalkMinutes: (minutes: WalkMinutes) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  categoryIds: [],
  priceRange: null,
  walkMinutes: 15,

  setCategoryIds: (ids) => set({ categoryIds: ids }),

  // 카테고리 토글 (선택/해제)
  toggleCategory: (id) =>
    set((state) => ({
      categoryIds: state.categoryIds.includes(id)
        ? state.categoryIds.filter((cid) => cid !== id)
        : [...state.categoryIds, id],
    })),

  setPriceRange: (range) => set({ priceRange: range }),

  setWalkMinutes: (minutes) => set({ walkMinutes: minutes }),

  // 필터 초기화
  resetFilters: () =>
    set({ categoryIds: [], priceRange: null, walkMinutes: 15 }),
}));
