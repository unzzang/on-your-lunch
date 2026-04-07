'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { ApiResponse, CalendarResponse } from '@on-your-lunch/shared-types';

export function useEatingHistory(year: number, month: number) {
  return useQuery({
    queryKey: ['eating-history', year, month],
    queryFn: async () => {
      const res = await api
        .get(`eating-histories/calendar?year=${year}&month=${month}`)
        .json<ApiResponse<CalendarResponse>>();
      return res.data;
    },
  });
}
