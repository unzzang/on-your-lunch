'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type {
  ApiResponse,
  PaginatedResponse,
  RestaurantListItem,
  RestaurantMapPin,
} from '@on-your-lunch/shared-types';

interface UseRestaurantsParams {
  categoryId?: string | null;
  walkMinutes?: number | null;
  priceRange?: string | null;
  sort?: 'distance' | 'rating';
  page?: number;
  limit?: number;
  favoriteOnly?: boolean;
}

export function useRestaurants(params: UseRestaurantsParams = {}) {
  return useQuery({
    queryKey: ['restaurants', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.categoryId) searchParams.set('categoryIds', params.categoryId);
      if (params.walkMinutes) searchParams.set('maxWalkMinutes', String(params.walkMinutes));
      if (params.priceRange) searchParams.set('priceRange', params.priceRange);
      if (params.sort) searchParams.set('sort', params.sort);
      if (params.page) searchParams.set('page', String(params.page));
      if (params.limit) searchParams.set('limit', String(params.limit));
      if (params.favoriteOnly) searchParams.set('favoritesOnly', 'true');

      const res = await api
        .get(`restaurants?${searchParams.toString()}`)
        .json<ApiResponse<PaginatedResponse<RestaurantListItem>>>();
      return res.data;
    },
  });
}

export function useRestaurantMapPins(params: {
  categoryId?: string | null;
  swLat?: number;
  swLng?: number;
  neLat?: number;
  neLng?: number;
} = {}) {
  return useQuery({
    queryKey: ['restaurants-map', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      // 기본값: 강남 주변 넓은 영역
      searchParams.set('swLat', String(params.swLat ?? 37.48));
      searchParams.set('swLng', String(params.swLng ?? 126.95));
      searchParams.set('neLat', String(params.neLat ?? 37.52));
      searchParams.set('neLng', String(params.neLng ?? 127.08));
      if (params.categoryId) searchParams.set('categoryIds', params.categoryId);

      const res = await api
        .get(`restaurants/map?${searchParams.toString()}`)
        .json<ApiResponse<{ pins: RestaurantMapPin[]; totalCount: number }>>();
      return res.data.pins;
    },
  });
}
