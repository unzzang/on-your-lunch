import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import type {
  ApiResponse,
  EatingHistoryCalendarResponse,
  CreateEatingHistoryRequest,
  EatingHistoryItem,
} from '@on-your-lunch/shared-types';

/**
 * 먹은 이력 관련 TanStack Query 훅
 */

/** 캘린더 월별 이력 조회 */
export function useEatingHistoryCalendar(year: number, month: number) {
  return useQuery({
    queryKey: ['eatingHistory', 'calendar', year, month],
    queryFn: async () => {
      const response = await api
        .get('eating-histories/calendar', {
          searchParams: { year: String(year), month: String(month) },
        })
        .json<ApiResponse<EatingHistoryCalendarResponse>>();
      return response.data;
    },
  });
}

/** 먹었어요 기록 생성 */
export function useCreateEatingHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateEatingHistoryRequest) => {
      const response = await api
        .post('eating-histories', { json: params })
        .json<ApiResponse<EatingHistoryItem>>();
      return response.data;
    },
    onSuccess: () => {
      // 캘린더 & 추천 데이터 무효화
      queryClient.invalidateQueries({ queryKey: ['eatingHistory'] });
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    },
  });
}
