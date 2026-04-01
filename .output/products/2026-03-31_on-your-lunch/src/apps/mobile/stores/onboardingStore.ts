import { create } from 'zustand';
import type { PriceRange } from '@on-your-lunch/shared-types';

/**
 * 온보딩 스토어
 * 온보딩 3단계(위치 → 취향 → 제외)의 임시 입력값을 관리한다.
 * 온보딩 완료 후 초기화한다.
 */

interface OnboardingState {
  // Step 1: 회사 위치
  location: {
    latitude: number | null;
    longitude: number | null;
    address: string;
    buildingName: string;
  };

  // Step 2: 취향 + 가격대
  preferredCategoryIds: string[];
  preferredPriceRange: PriceRange | null;

  // Step 3: 제외 설정
  excludedCategoryIds: string[];
  allergyTypeIds: string[];

  // 현재 단계
  currentStep: 1 | 2 | 3;

  // 액션
  setLocation: (location: OnboardingState['location']) => void;
  setPreferences: (categoryIds: string[], priceRange: PriceRange) => void;
  setExclusions: (categoryIds: string[], allergyIds: string[]) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

const initialState = {
  location: {
    latitude: null,
    longitude: null,
    address: '',
    buildingName: '',
  },
  preferredCategoryIds: [],
  preferredPriceRange: null,
  excludedCategoryIds: [],
  allergyTypeIds: [],
  currentStep: 1 as const,
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  ...initialState,

  setLocation: (location) => set({ location }),

  setPreferences: (preferredCategoryIds, preferredPriceRange) =>
    set({ preferredCategoryIds, preferredPriceRange }),

  setExclusions: (excludedCategoryIds, allergyTypeIds) =>
    set({ excludedCategoryIds, allergyTypeIds }),

  nextStep: () =>
    set((state) => ({
      currentStep: Math.min(state.currentStep + 1, 3) as 1 | 2 | 3,
    })),

  prevStep: () =>
    set((state) => ({
      currentStep: Math.max(state.currentStep - 1, 1) as 1 | 2 | 3,
    })),

  reset: () => set(initialState),
}));
