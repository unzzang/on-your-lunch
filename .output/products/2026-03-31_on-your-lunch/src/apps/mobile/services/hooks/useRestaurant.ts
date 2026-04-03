// ─────────────────────────────────────────
// 식당 관련 TanStack Query 훅
//
// 식당 상세 조회 + 식당 리스트 + 지도 핀 + 검색.
// ─────────────────────────────────────────

import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import type {
  ApiResponse,
  PaginatedData,
  RestaurantDetailResponse,
  RestaurantListItem,
  RestaurantMapResponse,
  PriceRange,
  RestaurantSort,
} from '@on-your-lunch/shared-types';
import type { WalkMinutes } from '@on-your-lunch/shared-types';

// 식당 상세 조회
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

// 식당 리스트 (무한 스크롤)
interface RestaurantListParams {
  categoryIds?: string;
  priceRange?: PriceRange;
  walkMinutes?: WalkMinutes;
  sort?: RestaurantSort;
}

export function useRestaurantList(params: RestaurantListParams = {}) {
  return useInfiniteQuery({
    queryKey: ['restaurants', params],
    queryFn: async ({ pageParam = 1 }) => {
      const searchParams = new URLSearchParams();
      searchParams.set('page', String(pageParam));
      searchParams.set('limit', '20');
      if (params.categoryIds) searchParams.set('categoryIds', params.categoryIds);
      if (params.priceRange) searchParams.set('priceRange', params.priceRange);
      if (params.walkMinutes)
        searchParams.set('walkMinutes', String(params.walkMinutes));
      if (params.sort) searchParams.set('sort', params.sort);

      const response = await api
        .get(`restaurants?${searchParams.toString()}`)
        .json<ApiResponse<PaginatedData<RestaurantListItem>>>();
      return response.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNext ? lastPage.meta.page + 1 : undefined,
  });
}

// 지도 핀 조회
interface MapPinParams {
  swLat: number;
  swLng: number;
  neLat: number;
  neLng: number;
  categoryIds?: string;
}

export function useRestaurantMapPins(params: MapPinParams) {
  return useQuery({
    queryKey: ['restaurants', 'map', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      searchParams.set('swLat', String(params.swLat));
      searchParams.set('swLng', String(params.swLng));
      searchParams.set('neLat', String(params.neLat));
      searchParams.set('neLng', String(params.neLng));
      if (params.categoryIds) searchParams.set('categoryIds', params.categoryIds);

      const response = await api
        .get(`restaurants/map?${searchParams.toString()}`)
        .json<ApiResponse<RestaurantMapResponse>>();
      return response.data;
    },
    enabled: !!(params.swLat && params.swLng && params.neLat && params.neLng),
  });
}
