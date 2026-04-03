import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import { useFilterStore } from '../../stores/filterStore';
import type {
  ApiResponse,
  RecommendationTodayResponse,
  RefreshRecommendationRequest,
} from '@on-your-lunch/shared-types';

export function useRecommendations() {
  const { selectedCategoryId, walkMinutes, priceRange } = useFilterStore();

  return useQuery({
    queryKey: ['recommendations', selectedCategoryId, walkMinutes, priceRange],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategoryId) params.set('categoryIds', selectedCategoryId);
      if (priceRange) params.set('priceRange', priceRange);
      params.set('walkMinutes', String(walkMinutes));

      const response = await api
        .get('recommendations/today', { searchParams: params })
        .json<ApiResponse<RecommendationTodayResponse>>();
      return response.data;
    },
  });
}

export function useRefreshRecommendation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: RefreshRecommendationRequest) => {
      const response = await api
        .post('recommendations/today/refresh', { json: body })
        .json<ApiResponse<RecommendationTodayResponse>>();
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    },
  });
}
