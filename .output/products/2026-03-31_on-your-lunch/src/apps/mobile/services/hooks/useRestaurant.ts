import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import type {
  ApiResponse,
  RestaurantDetailResponse,
  RestaurantMapResponse,
  RestaurantListItem,
  PaginatedData,
  PriceRange,
  RestaurantSort,
} from '@on-your-lunch/shared-types';

/**
 * 식당 관련 TanStack Query 훅
 */

/** 식당 상세 조회 */
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

/** 식당 목록 조회 (탐색 - 리스트 뷰) */
export function useRestaurantList(params: {
  categoryIds?: string[];
  priceRange?: PriceRange;
  walkMinutes?: number;
  sort?: RestaurantSort;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['restaurants', 'list', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.categoryIds?.length) {
        searchParams.set('categoryIds', params.categoryIds.join(','));
      }
      if (params.priceRange) searchParams.set('priceRange', params.priceRange);
      if (params.walkMinutes)
        searchParams.set('walkMinutes', String(params.walkMinutes));
      if (params.sort) searchParams.set('sort', params.sort);
      if (params.page) searchParams.set('page', String(params.page));
      if (params.limit) searchParams.set('limit', String(params.limit));

      const response = await api
        .get('restaurants', { searchParams })
        .json<ApiResponse<PaginatedData<RestaurantListItem>>>();
      return response.data;
    },
  });
}

/** 식당 지도 핀 조회 */
export function useRestaurantMap(params: {
  swLat: number;
  swLng: number;
  neLat: number;
  neLng: number;
  categoryIds?: string[];
  priceRange?: PriceRange;
  walkMinutes?: number;
}) {
  return useQuery({
    queryKey: ['restaurants', 'map', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      searchParams.set('swLat', String(params.swLat));
      searchParams.set('swLng', String(params.swLng));
      searchParams.set('neLat', String(params.neLat));
      searchParams.set('neLng', String(params.neLng));
      if (params.categoryIds?.length) {
        searchParams.set('categoryIds', params.categoryIds.join(','));
      }
      if (params.priceRange) searchParams.set('priceRange', params.priceRange);
      if (params.walkMinutes)
        searchParams.set('walkMinutes', String(params.walkMinutes));

      const response = await api
        .get('restaurants/map', { searchParams })
        .json<ApiResponse<RestaurantMapResponse>>();
      return response.data;
    },
    enabled:
      params.swLat !== undefined &&
      params.swLng !== undefined &&
      params.neLat !== undefined &&
      params.neLng !== undefined,
  });
}
