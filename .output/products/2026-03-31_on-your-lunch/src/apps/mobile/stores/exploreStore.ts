import { create } from 'zustand';
import type { RestaurantSort } from '@on-your-lunch/shared-types';

interface ExploreState {
  searchQuery: string;
  selectedCategoryId: string | null;
  sortBy: RestaurantSort;

  setSearchQuery: (query: string) => void;
  setCategory: (id: string | null) => void;
  setSortBy: (sort: RestaurantSort) => void;
  resetExplore: () => void;
}

export const useExploreStore = create<ExploreState>((set) => ({
  searchQuery: '',
  selectedCategoryId: null,
  sortBy: 'distance' as RestaurantSort,

  setSearchQuery: (query) => set({ searchQuery: query }),
  setCategory: (id) => set({ selectedCategoryId: id }),
  setSortBy: (sort) => set({ sortBy: sort }),
  resetExplore: () =>
    set({ searchQuery: '', selectedCategoryId: null, sortBy: 'distance' as RestaurantSort }),
}));
