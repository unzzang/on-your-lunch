// ─────────────────────────────────────────
// 카테고리/마스터 데이터 관련 TanStack Query 훅
//
// 카테고리 목록 + 알레르기 목록 조회.
// 이 데이터는 거의 변하지 않으므로 캐시를 길게 유지.
// ─────────────────────────────────────────

import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import type {
  ApiResponse,
  CategoryListItem,
  AllergyTypeListItem,
} from '@on-your-lunch/shared-types';

// 카테고리 목록 조회
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api
        .get('categories')
        .json<ApiResponse<CategoryListItem[]>>();
      return response.data;
    },
    // 마스터 데이터이므로 30분간 캐시 유지
    staleTime: 30 * 60 * 1000,
  });
}

// 알레르기 타입 목록 조회
export function useAllergyTypes() {
  return useQuery({
    queryKey: ['allergyTypes'],
    queryFn: async () => {
      const response = await api
        .get('allergy-types')
        .json<ApiResponse<AllergyTypeListItem[]>>();
      return response.data;
    },
    staleTime: 30 * 60 * 1000,
  });
}
