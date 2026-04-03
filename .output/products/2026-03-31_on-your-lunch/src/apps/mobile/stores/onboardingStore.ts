import { create } from 'zustand';
import type { PriceRange } from '@on-your-lunch/shared-types';

interface OnboardingState {
  step: number;
  location: {
    latitude: number;
    longitude: number;
    address: string;
    buildingName?: string;
  } | null;
  preferredCategoryIds: string[];
  excludedCategoryIds: string[];
  allergyTypeIds: string[];
  preferredPriceRange: PriceRange | null;

  setStep: (step: number) => void;
  setLocation: (location: OnboardingState['location']) => void;
  setPreferredCategories: (ids: string[]) => void;
  setExcludedCategories: (ids: string[]) => void;
  setAllergyTypes: (ids: string[]) => void;
  setPriceRange: (range: PriceRange | null) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  step: 0,
  location: null,
  preferredCategoryIds: [],
  excludedCategoryIds: [],
  allergyTypeIds: [],
  preferredPriceRange: null,

  setStep: (step) => set({ step }),
  setLocation: (location) => set({ location }),
  setPreferredCategories: (ids) => set({ preferredCategoryIds: ids }),
  setExcludedCategories: (ids) => set({ excludedCategoryIds: ids }),
  setAllergyTypes: (ids) => set({ allergyTypeIds: ids }),
  setPriceRange: (range) => set({ preferredPriceRange: range }),
  reset: () =>
    set({
      step: 0,
      location: null,
      preferredCategoryIds: [],
      excludedCategoryIds: [],
      allergyTypeIds: [],
      preferredPriceRange: null,
    }),
}));
