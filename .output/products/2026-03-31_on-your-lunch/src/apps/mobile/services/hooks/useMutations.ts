import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import type {
  ApiResponse,
  UserMeResponse,
  UpdateProfileRequest,
  UpdateLocationRequest,
  UpdateNotificationRequest,
  UpdateNotificationResponse,
  CreateEatingHistoryRequest,
  EatingHistoryResponse,
  ToggleFavoriteResponse,
} from '@on-your-lunch/shared-types';

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: UpdateProfileRequest) => {
      const response = await api
        .patch('users/me/profile', { json: body })
        .json<ApiResponse<UserMeResponse>>();
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
}

export function useUpdateLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: UpdateLocationRequest) => {
      const response = await api
        .put('users/me/location', { json: body })
        .json<ApiResponse<UserMeResponse>>();
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
}

export function useUpdateNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: UpdateNotificationRequest) => {
      const response = await api
        .patch('users/me/notification', { json: body })
        .json<ApiResponse<UpdateNotificationResponse>>();
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
}

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
      queryClient.invalidateQueries({ queryKey: ['restaurant', restaurantId] });
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    },
  });
}

export function useCreateEatingHistory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateEatingHistoryRequest) => {
      const response = await api
        .post('eating-histories', { json: body })
        .json<ApiResponse<EatingHistoryResponse>>();
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eatingHistories'] });
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    },
  });
}
