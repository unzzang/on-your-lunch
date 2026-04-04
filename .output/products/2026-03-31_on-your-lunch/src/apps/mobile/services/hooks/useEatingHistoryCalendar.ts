import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import type {
  ApiResponse,
  EatingHistoryCalendarResponse,
} from '@on-your-lunch/shared-types';

export function useEatingHistoryCalendar(year: number, month: number) {
  return useQuery({
    queryKey: ['eatingHistories', 'calendar', year, month],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('year', String(year));
      params.set('month', String(month));

      const response = await api
        .get('eating-histories/calendar', { searchParams: params })
        .json<ApiResponse<EatingHistoryCalendarResponse>>();
      return response.data;
    },
  });
}
