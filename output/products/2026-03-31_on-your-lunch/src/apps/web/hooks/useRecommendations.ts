'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type {
  ApiResponse,
  TodayRecommendationResponse,
} from '@on-your-lunch/shared-types';

interface RecommendationParams {
  categoryId?: string | null;
  walkMinutes?: number | null;
  priceRange?: string | null;
}

export function useRecommendations(params?: RecommendationParams) {
  return useQuery({
    queryKey: ['recommendations', params?.categoryId, params?.walkMinutes, params?.priceRange],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.categoryId) searchParams.set('categoryIds', params.categoryId);
      if (params?.walkMinutes) searchParams.set('walkMinutes', String(params.walkMinutes));
      if (params?.priceRange) searchParams.set('priceRange', params.priceRange);

      const qs = searchParams.toString();
      const path = `recommendations/today${qs ? `?${qs}` : ''}`;

      const res = await api.get(path).json<ApiResponse<TodayRecommendationResponse>>();
      return res.data;
    },
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
}
