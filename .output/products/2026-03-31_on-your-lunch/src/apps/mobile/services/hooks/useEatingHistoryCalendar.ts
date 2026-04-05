import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import { useAuthStore } from '../../stores/authStore';
import type {
  ApiResponse,
  EatingHistoryCalendarResponse,
} from '@on-your-lunch/shared-types';

export function useEatingHistoryCalendar(year: number, month: number) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: ['eatingHistories', 'calendar', year, month],
    queryFn: async () => {
      const response = await api
        .get('eating-histories/calendar', {
          searchParams: { year: String(year), month: String(month) },
        })
        .json<ApiResponse<EatingHistoryCalendarResponse>>();
      return response.data;
    },
    enabled: isAuthenticated,
    retry: 1,
  });
}
