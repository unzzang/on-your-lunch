'use client';

import { create } from 'zustand';

interface FilterState {
  selectedCategoryId: string | null; // null = '전체'
  walkMinutes: number | null; // null = 필터 없음
  priceRange: string | null; // null = 필터 없음
  setCategory: (id: string | null) => void;
  setWalkMinutes: (min: number | null) => void;
  setPriceRange: (range: string | null) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  selectedCategoryId: null,
  walkMinutes: 10,
  priceRange: null,

  setCategory: (id) => set({ selectedCategoryId: id }),
  setWalkMinutes: (min) => set({ walkMinutes: min }),
  setPriceRange: (range) => set({ priceRange: range }),
  resetFilters: () =>
    set({ selectedCategoryId: null, walkMinutes: 10, priceRange: null }),
}));
