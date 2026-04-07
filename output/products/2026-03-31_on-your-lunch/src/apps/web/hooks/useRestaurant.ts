'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { ApiResponse, RestaurantDetail } from '@on-your-lunch/shared-types';

export function useRestaurant(id: string) {
  return useQuery({
    queryKey: ['restaurant', id],
    queryFn: async () => {
      const res = await api
        .get(`restaurants/${id}`)
        .json<ApiResponse<RestaurantDetail>>();
      return res.data;
    },
    enabled: !!id,
    retry: (failureCount, error) => {
      // 404 등 클라이언트 에러는 재시도하지 않음
      if (error instanceof Error && 'response' in error) {
        const status = (error as any).response?.status;
        if (status && status >= 400 && status < 500) return false;
      }
      return failureCount < 2;
    },
  });
}
