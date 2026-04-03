import { create } from 'zustand';
import type { WalkMinutes } from '@on-your-lunch/shared-types';
import { PriceRange } from '@on-your-lunch/shared-types';

interface FilterState {
  selectedCategoryId: string | null;
  walkMinutes: WalkMinutes;
  priceRange: PriceRange | null;

  setCategory: (id: string | null) => void;
  setWalkMinutes: (minutes: WalkMinutes) => void;
  setPriceRange: (range: PriceRange | null) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  selectedCategoryId: null,
  walkMinutes: 10,
  priceRange: null,

  setCategory: (id) => set({ selectedCategoryId: id }),
  setWalkMinutes: (minutes) => set({ walkMinutes: minutes }),
  setPriceRange: (range) => set({ priceRange: range }),
  resetFilters: () =>
    set({ selectedCategoryId: null, walkMinutes: 10, priceRange: null }),
}));
