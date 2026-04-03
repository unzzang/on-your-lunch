// ─────────────────────────────────────────
// 먹은 이력 관련 TanStack Query 훅
//
// 캘린더 조회 + 이력 기록 + 수정 + 삭제.
// ─────────────────────────────────────────

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import type {
  ApiResponse,
  EatingHistoryCalendarResponse,
  EatingHistoryResponse,
  CreateEatingHistoryRequest,
  UpdateEatingHistoryRequest,
} from '@on-your-lunch/shared-types';

// 캘린더 월별 조회
export function useEatingHistoryCalendar(year: number, month: number) {
  return useQuery({
    queryKey: ['eatingHistory', 'calendar', year, month],
    queryFn: async () => {
      const response = await api
        .get(`eating-histories/calendar?year=${year}&month=${month}`)
        .json<ApiResponse<EatingHistoryCalendarResponse>>();
      return response.data;
    },
  });
}

// 먹었어요 기록 생성
export function useCreateEatingHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateEatingHistoryRequest) => {
      const response = await api
        .post('eating-histories', { json: request })
        .json<ApiResponse<EatingHistoryResponse>>();
      return response.data;
    },
    onSuccess: () => {
      // 캘린더와 추천 데이터를 갱신
      queryClient.invalidateQueries({ queryKey: ['eatingHistory'] });
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    },
  });
}

// 먹은 이력 수정
export function useUpdateEatingHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...request
    }: UpdateEatingHistoryRequest & { id: string }) => {
      const response = await api
        .patch(`eating-histories/${id}`, { json: request })
        .json<ApiResponse<EatingHistoryResponse>>();
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eatingHistory'] });
    },
  });
}

// 먹은 이력 삭제
export function useDeleteEatingHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`eating-histories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eatingHistory'] });
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    },
  });
}
