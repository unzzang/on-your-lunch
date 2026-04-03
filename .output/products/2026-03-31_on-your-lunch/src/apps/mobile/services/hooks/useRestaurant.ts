import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import type { ApiResponse, RestaurantDetailResponse } from '@on-your-lunch/shared-types';

export function useRestaurant(id: string) {
  return useQuery({
    queryKey: ['restaurant', id],
    queryFn: async () => {
      const response = await api
        .get(`restaurants/${id}`)
        .json<ApiResponse<RestaurantDetailResponse>>();
      return response.data;
    },
    enabled: !!id,
  });
}
