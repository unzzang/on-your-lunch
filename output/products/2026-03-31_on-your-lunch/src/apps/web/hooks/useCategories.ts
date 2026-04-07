'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { ApiResponse, CategorySummary } from '@on-your-lunch/shared-types';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api
        .get('categories')
        .json<ApiResponse<CategorySummary[]>>();
      return res.data;
    },
    staleTime: 1000 * 60 * 60,
  });
}
