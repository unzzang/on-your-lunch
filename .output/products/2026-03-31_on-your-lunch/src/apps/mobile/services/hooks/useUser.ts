// ─────────────────────────────────────────
// 사용자 관련 TanStack Query 훅
//
// 내 정보 조회 + 프로필 수정 + 위치 수정 + 취향 수정 + 알림 설정.
// ─────────────────────────────────────────

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import type {
  ApiResponse,
  UserMeResponse,
  UpdateProfileRequest,
  UpdateLocationRequest,
  UpdatePreferencesRequest,
  UpdateNotificationRequest,
  UpdateNotificationResponse,
  LocationResponse,
  PreferencesResponse,
} from '@on-your-lunch/shared-types';

// 내 정보 조회
export function useMe() {
  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: async () => {
      const response = await api
        .get('users/me')
        .json<ApiResponse<UserMeResponse>>();
      return response.data;
    },
  });
}

// 프로필 수정
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: UpdateProfileRequest) => {
      const response = await api
        .patch('users/me/profile', { json: request })
        .json<ApiResponse<UserMeResponse>>();
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
    },
  });
}

// 회사 위치 수정
export function useUpdateLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: UpdateLocationRequest) => {
      const response = await api
        .put('users/me/location', { json: request })
        .json<ApiResponse<LocationResponse>>();
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
      // 위치 변경 시 추천과 식당 목록도 갱신
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    },
  });
}

// 취향 수정
export function useUpdatePreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: UpdatePreferencesRequest) => {
      const response = await api
        .put('users/me/preferences', { json: request })
        .json<ApiResponse<PreferencesResponse>>();
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    },
  });
}

// 알림 설정 수정
export function useUpdateNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: UpdateNotificationRequest) => {
      const response = await api
        .put('users/me/notification', { json: request })
        .json<ApiResponse<UpdateNotificationResponse>>();
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
    },
  });
}
