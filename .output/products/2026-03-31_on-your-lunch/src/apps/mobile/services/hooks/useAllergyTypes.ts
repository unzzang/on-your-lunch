import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import type { ApiResponse, AllergyTypeListItem } from '@on-your-lunch/shared-types';

export function useAllergyTypes() {
  return useQuery({
    queryKey: ['allergyTypes'],
    queryFn: async () => {
      const response = await api
        .get('allergy-types')
        .json<ApiResponse<AllergyTypeListItem[]>>();
      return response.data;
    },
    staleTime: 1000 * 60 * 60,
  });
}
