import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import { useAuthStore } from '../../stores/authStore';
import type { ApiResponse, UserMeResponse } from '@on-your-lunch/shared-types';

export function useMe() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const response = await api.get('users/me').json<ApiResponse<UserMeResponse>>();
      return response.data;
    },
    enabled: isAuthenticated,
  });
}
