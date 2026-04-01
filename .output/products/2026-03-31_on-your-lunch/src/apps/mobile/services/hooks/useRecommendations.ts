import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import type {
  ApiResponse,
  RecommendationTodayResponse,
  RefreshRecommendationRequest,
} from '@on-your-lunch/shared-types';

/**
 * 오늘의 추천 관련 TanStack Query 훅
 */

const QUERY_KEY = ['recommendations', 'today'];

/** 오늘의 추천 3장 조회 */
export function useRecommendations() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const response = await api
        .get('recommendations/today')
        .json<ApiResponse<RecommendationTodayResponse>>();
      return response.data;
    },
  });
}

/** 추천 새로고침 (최대 5회) */
export function useRefreshRecommendations() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params?: RefreshRecommendationRequest) => {
      const response = await api
        .post('recommendations/today/refresh', { json: params ?? {} })
        .json<ApiResponse<RecommendationTodayResponse>>();
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEY, data);
    },
  });
}
