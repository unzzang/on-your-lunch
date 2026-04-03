// ─────────────────────────────────────────
// 즐겨찾기 관련 TanStack Query 훅
//
// 즐겨찾기 토글 (추가/해제).
// ─────────────────────────────────────────

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import type {
  ApiResponse,
  ToggleFavoriteResponse,
} from '@on-your-lunch/shared-types';

// 즐겨찾기 토글
export function useFavoriteToggle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (restaurantId: string) => {
      const response = await api
        .post('favorites/toggle', { json: { restaurantId } })
        .json<ApiResponse<ToggleFavoriteResponse>>();
      return response.data;
    },
    onSuccess: (_data, restaurantId) => {
      // 관련 쿼리 갱신 (식당 상세, 추천, 식당 목록)
      queryClient.invalidateQueries({ queryKey: ['restaurant', restaurantId] });
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    },
  });
}
