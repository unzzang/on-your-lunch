'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { ApiResponse, UserProfile } from '@on-your-lunch/shared-types';

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await api.get('users/me').json<ApiResponse<UserProfile>>();
      return res.data;
    },
  });
}
