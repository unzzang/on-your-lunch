import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import { useExploreStore } from '../../stores/exploreStore';
import { useAuthStore } from '../../stores/authStore';
import type {
  ApiResponse,
  PaginatedData,
  RestaurantListItem,
} from '@on-your-lunch/shared-types';

export function useRestaurants(page: number = 1, limit: number = 20) {
  const { selectedCategoryId, sortBy } = useExploreStore();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: ['restaurants', selectedCategoryId, sortBy, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      params.set('sort', sortBy);
      if (selectedCategoryId) params.set('categoryIds', selectedCategoryId);

      const response = await api
        .get('restaurants', { searchParams: params })
        .json<ApiResponse<PaginatedData<RestaurantListItem>>>();
      return response.data;
    },
    enabled: isAuthenticated,
  });
}
