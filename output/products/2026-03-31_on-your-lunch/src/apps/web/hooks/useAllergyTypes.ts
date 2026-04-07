'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { ApiResponse, AllergyType } from '@on-your-lunch/shared-types';

export function useAllergyTypes() {
  return useQuery({
    queryKey: ['allergyTypes'],
    queryFn: async () => {
      const res = await api
        .get('categories/allergies')
        .json<ApiResponse<AllergyType[]>>();
      return res.data;
    },
    staleTime: 1000 * 60 * 60,
  });
}
