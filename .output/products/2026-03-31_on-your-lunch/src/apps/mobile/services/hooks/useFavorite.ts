import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import type {
  ApiResponse,
  ToggleFavoriteRequest,
  ToggleFavoriteResponse,
} from '@on-your-lunch/shared-types';

/**
 * 즐겨찾기 토글 훅
 */

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: ToggleFavoriteRequest) => {
      const response = await api
        .post('favorites/toggle', { json: params })
        .json<ApiResponse<ToggleFavoriteResponse>>();
      return response.data;
    },
    onSuccess: () => {
      // 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
      queryClient.invalidateQueries({ queryKey: ['restaurant'] });
    },
  });
}
