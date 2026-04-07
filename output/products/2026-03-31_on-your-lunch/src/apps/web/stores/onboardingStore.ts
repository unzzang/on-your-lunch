'use client';

import { create } from 'zustand';

interface OnboardingState {
  // Step 1: Location
  latitude: number | null;
  longitude: number | null;
  address: string;
  buildingName: string;

  // Step 2: Preferences
  preferredCategoryIds: string[];
  preferredPriceRange: string; // PriceRange enum value

  // Step 3: Exclusions
  excludedCategoryIds: string[];
  allergyTypeIds: string[];

  // Actions
  setLocation: (data: {
    latitude: number;
    longitude: number;
    address: string;
    buildingName: string;
  }) => void;
  setPreferences: (categoryIds: string[], priceRange: string) => void;
  togglePreferredCategory: (id: string) => void;
  toggleExcludedCategory: (id: string) => void;
  toggleAllergy: (id: string) => void;
  setPriceRange: (range: string) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  latitude: null,
  longitude: null,
  address: '',
  buildingName: '',
  preferredCategoryIds: [],
  preferredPriceRange: 'BETWEEN_10K_20K',
  excludedCategoryIds: [],
  allergyTypeIds: [],

  setLocation: (data) =>
    set({
      latitude: data.latitude,
      longitude: data.longitude,
      address: data.address,
      buildingName: data.buildingName,
    }),

  setPreferences: (categoryIds, priceRange) =>
    set({ preferredCategoryIds: categoryIds, preferredPriceRange: priceRange }),

  togglePreferredCategory: (id) =>
    set((state) => ({
      preferredCategoryIds: state.preferredCategoryIds.includes(id)
        ? state.preferredCategoryIds.filter((cid) => cid !== id)
        : [...state.preferredCategoryIds, id],
    })),

  toggleExcludedCategory: (id) =>
    set((state) => ({
      excludedCategoryIds: state.excludedCategoryIds.includes(id)
        ? state.excludedCategoryIds.filter((cid) => cid !== id)
        : [...state.excludedCategoryIds, id],
    })),

  toggleAllergy: (id) =>
    set((state) => ({
      allergyTypeIds: state.allergyTypeIds.includes(id)
        ? state.allergyTypeIds.filter((aid) => aid !== id)
        : [...state.allergyTypeIds, id],
    })),

  setPriceRange: (range) => set({ preferredPriceRange: range }),

  reset: () =>
    set({
      latitude: null,
      longitude: null,
      address: '',
      buildingName: '',
      preferredCategoryIds: [],
      preferredPriceRange: 'BETWEEN_10K_20K',
      excludedCategoryIds: [],
      allergyTypeIds: [],
    }),
}));
