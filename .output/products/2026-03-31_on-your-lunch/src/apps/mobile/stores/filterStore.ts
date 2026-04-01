import { create } from 'zustand';
import type { PriceRange, WalkMinutes } from '@on-your-lunch/shared-types';

/**
 * 필터 스토어
 * 추천 + 탐색에서 공유하는 필터 상태를 관리한다.
 */

interface FilterState {
  // 필터 값
  categoryIds: string[];
  priceRange: PriceRange | null;
  walkMinutes: WalkMinutes;

  // 액션
  setCategoryIds: (ids: string[]) => void;
  toggleCategory: (id: string) => void;
  setPriceRange: (range: PriceRange | null) => void;
  setWalkMinutes: (minutes: WalkMinutes) => void;
  resetFilters: () => void;
}

const initialFilters = {
  categoryIds: [],
  priceRange: null,
  walkMinutes: 10 as WalkMinutes,
};

export const useFilterStore = create<FilterState>((set) => ({
  ...initialFilters,

  setCategoryIds: (categoryIds) => set({ categoryIds }),

  toggleCategory: (id) =>
    set((state) => {
      const exists = state.categoryIds.includes(id);
      return {
        categoryIds: exists
          ? state.categoryIds.filter((cid) => cid !== id)
          : [...state.categoryIds, id],
      };
    }),

  setPriceRange: (priceRange) => set({ priceRange }),

  setWalkMinutes: (walkMinutes) => set({ walkMinutes }),

  resetFilters: () => set(initialFilters),
}));
