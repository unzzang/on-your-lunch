import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import type {
  ApiResponse,
  UserMeResponse,
  UpdateLocationRequest,
  UserLocationResponse,
  UpdatePreferencesRequest,
  UserPreferencesResponse,
  UpdateProfileRequest,
  UpdateNotificationRequest,
  OnboardingCompleteResponse,
  CategoryItem,
  AllergyTypeItem,
} from '@on-your-lunch/shared-types';

/**
 * 사용자/카테고리/알레르기 관련 TanStack Query 훅
 */

/** 내 정보 조회 */
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

/** 카테고리 목록 조회 */
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api
        .get('categories')
        .json<ApiResponse<CategoryItem[]>>();
      return response.data;
    },
    staleTime: Infinity, // 마스터 데이터 — 거의 변하지 않음
  });
}

/** 알레르기 타입 목록 조회 */
export function useAllergyTypes() {
  return useQuery({
    queryKey: ['allergyTypes'],
    queryFn: async () => {
      const response = await api
        .get('allergy-types')
        .json<ApiResponse<AllergyTypeItem[]>>();
      return response.data;
    },
    staleTime: Infinity,
  });
}

/** 회사 위치 업데이트 */
export function useUpdateLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: UpdateLocationRequest) => {
      const response = await api
        .put('users/me/location', { json: params })
        .json<ApiResponse<UserLocationResponse>>();
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
    },
  });
}

/** 취향 업데이트 */
export function useUpdatePreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: UpdatePreferencesRequest) => {
      const response = await api
        .put('users/me/preferences', { json: params })
        .json<ApiResponse<UserPreferencesResponse>>();
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
    },
  });
}

/** 프로필 업데이트 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: UpdateProfileRequest) => {
      const response = await api
        .patch('users/me/profile', { json: params })
        .json<ApiResponse<UserMeResponse>>();
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
    },
  });
}

/** 알림 설정 업데이트 */
export function useUpdateNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: UpdateNotificationRequest) => {
      const response = await api
        .put('users/me/notification', { json: params })
        .json<ApiResponse<UserMeResponse>>();
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
    },
  });
}

/** 푸시 토큰 등록 (앱 시작 시 매번 호출) */
export function useRegisterPushToken() {
  return useMutation({
    mutationFn: async (params: { expoPushToken: string }) => {
      const response = await api
        .put('users/me/push-token', { json: params })
        .json<ApiResponse<void>>();
      return response.data;
    },
  });
}

/** 온보딩 완료 */
export function useCompleteOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await api
        .post('users/me/onboarding/complete')
        .json<ApiResponse<OnboardingCompleteResponse>>();
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
    },
  });
}
