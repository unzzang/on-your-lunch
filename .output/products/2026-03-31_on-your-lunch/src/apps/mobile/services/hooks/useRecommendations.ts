// ─────────────────────────────────────────
// 추천 관련 TanStack Query 훅
//
// 오늘의 추천 조회 + 새로고침.
// ─────────────────────────────────────────

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import type {
  ApiResponse,
  RecommendationTodayResponse,
  RefreshRecommendationRequest,
} from '@on-your-lunch/shared-types';

// 오늘의 추천 조회
export function useRecommendations() {
  return useQuery({
    queryKey: ['recommendations', 'today'],
    queryFn: async () => {
      const response = await api
        .get('recommendations/today')
        .json<ApiResponse<RecommendationTodayResponse>>();
      return response.data;
    },
  });
}

// 추천 새로고침
export function useRefreshRecommendations() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: RefreshRecommendationRequest) => {
      const response = await api
        .post('recommendations/today/refresh', { json: request })
        .json<ApiResponse<RecommendationTodayResponse>>();
      return response.data;
    },
    onSuccess: (data) => {
      // 새로고침 결과로 캐시 업데이트
      queryClient.setQueryData(['recommendations', 'today'], data);
    },
  });
}
