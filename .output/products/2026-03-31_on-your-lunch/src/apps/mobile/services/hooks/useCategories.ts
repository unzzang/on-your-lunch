import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import type { ApiResponse, CategoryListItem } from '@on-your-lunch/shared-types';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('categories').json<ApiResponse<CategoryListItem[]>>();
      return response.data;
    },
    staleTime: 1000 * 60 * 60, // 1시간 (마스터 데이터)
  });
}
