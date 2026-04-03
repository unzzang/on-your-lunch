import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import type { ApiResponse, UserMeResponse } from '@on-your-lunch/shared-types';

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const response = await api.get('users/me').json<ApiResponse<UserMeResponse>>();
      return response.data;
    },
  });
}
