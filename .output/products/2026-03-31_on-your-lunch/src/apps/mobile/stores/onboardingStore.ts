// ─────────────────────────────────────────
// 온보딩 스토어
//
// 온보딩 3단계 진행 상태 + 임시 입력값 관리.
// 온보딩 완료 후 초기화.
// ─────────────────────────────────────────

import { create } from 'zustand';
import type { PriceRange } from '@on-your-lunch/shared-types';

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  buildingName?: string;
}

interface OnboardingState {
  // 현재 단계 (1: 위치, 2: 취향, 3: 제외)
  currentStep: number;

  // Step 1: 회사 위치 임시 저장
  location: LocationData | null;

  // Step 2: 취향 임시 저장
  preferredCategoryIds: string[];
  preferredPriceRange: PriceRange | null;

  // Step 3: 제외 임시 저장
  excludedCategoryIds: string[];
  allergyTypeIds: string[];

  // 액션
  setStep: (step: number) => void;
  setLocation: (location: LocationData) => void;
  setPreferences: (categoryIds: string[], priceRange: PriceRange) => void;
  setExclusions: (categoryIds: string[], allergyTypeIds: string[]) => void;
  reset: () => void;
}

const initialState = {
  currentStep: 1,
  location: null,
  preferredCategoryIds: [],
  preferredPriceRange: null,
  excludedCategoryIds: [],
  allergyTypeIds: [],
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  ...initialState,

  setStep: (step) => set({ currentStep: step }),

  setLocation: (location) => set({ location }),

  setPreferences: (categoryIds, priceRange) =>
    set({ preferredCategoryIds: categoryIds, preferredPriceRange: priceRange }),

  setExclusions: (categoryIds, allergyTypeIds) =>
    set({ excludedCategoryIds: categoryIds, allergyTypeIds }),

  // 온보딩 완료 후 임시 데이터 초기화
  reset: () => set(initialState),
}));
