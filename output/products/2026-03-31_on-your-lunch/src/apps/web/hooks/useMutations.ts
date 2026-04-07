'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type {
  ApiResponse,
  CreateCustomEatingHistoryRequest,
  CreateEatingHistoryRequest,
  CreateEventRequest,
  CreateEventResponse,
  DevLoginResponse,
  EatingHistoryItem,
  FavoriteToggleResponse,
  NotificationSettingsResponse,
  TodayRecommendationResponse,
  UpdateLocationRequest,
  UpdateNotificationRequest,
  UpdatePreferencesRequest,
  UpdateProfileRequest,
} from '@on-your-lunch/shared-types';
import { useAuthStore } from '@/stores/authStore';

/** dev-login: 개발용 로그인 */
export function useDevLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: async () => {
      const res = await api
        .post('auth/dev-login')
        .json<ApiResponse<DevLoginResponse>>();
      return res.data;
    },
    onSuccess: (data) => {
      setAuth(
        { accessToken: data.accessToken, refreshToken: data.refreshToken },
        data.user,
      );
    },
  });
}

/** 즐겨찾기 토글 */
export function useToggleFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      restaurantId,
    }: {
      restaurantId: string;
      isFavorite?: boolean;
    }) => {
      const res = await api
        .post('favorites/toggle', { json: { restaurantId } })
        .json<ApiResponse<FavoriteToggleResponse>>();
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['restaurants'] });
      qc.invalidateQueries({ queryKey: ['restaurants-map'] });
      qc.invalidateQueries({ queryKey: ['restaurant'] });
      qc.invalidateQueries({ queryKey: ['recommendations'] });
    },
  });
}

/** 추천 새로고침 */
export function useRefreshRecommendation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params?: {
      categoryIds?: string[];
      priceRange?: string;
      walkMinutes?: number;
    }) => {
      const res = await api
        .post('recommendations/today/refresh', { json: params ?? {} })
        .json<ApiResponse<TodayRecommendationResponse>>();
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recommendations'] });
    },
  });
}

/** 위치 저장 */
export function useUpdateLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateLocationRequest) => {
      const res = await api
        .put('users/me/location', { json: data })
        .json<ApiResponse<unknown>>();
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['me'] });
    },
  });
}

/** 선호 설정 저장 */
export function useUpdatePreferences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdatePreferencesRequest) => {
      const res = await api
        .put('users/me/preferences', { json: data })
        .json<ApiResponse<unknown>>();
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['me'] });
    },
  });
}

/** 식사 기록 생성 */
export function useCreateEatingHistory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateEatingHistoryRequest) => {
      const res = await api
        .post('eating-histories', { json: body })
        .json<ApiResponse<EatingHistoryItem>>();
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['eating-history'] });
      qc.invalidateQueries({ queryKey: ['restaurant'] });
    },
  });
}

/** 식사 기록 수정 */
export function useUpdateEatingHistory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      rating,
      memo,
    }: {
      id: string;
      rating?: number;
      memo?: string;
    }) => {
      const res = await api
        .patch(`eating-histories/${id}`, { json: { rating, memo } })
        .json<ApiResponse<EatingHistoryItem>>();
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['eating-history'] });
      qc.invalidateQueries({ queryKey: ['restaurant'] });
    },
  });
}

/** 프로필 수정 */
export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: UpdateProfileRequest) => {
      const res = await api
        .patch('users/me/profile', { json: body })
        .json<ApiResponse<unknown>>();
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['me'] });
    },
  });
}

/** 알림 설정 변경 */
export function useUpdateNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: UpdateNotificationRequest) => {
      const res = await api
        .put('users/me/notification', { json: body })
        .json<ApiResponse<NotificationSettingsResponse>>();
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['me'] });
    },
  });
}

/** 온보딩 완료 */
export function useCompleteOnboarding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await api
        .post('users/me/onboarding/complete')
        .json<ApiResponse<{ isOnboardingCompleted: boolean }>>();
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['me'] });
    },
  });
}

/** 회원 탈퇴 */
export function useWithdraw() {
  return useMutation({
    mutationFn: async () => {
      await api.delete('users/me');
    },
  });
}

/** 직접 입력 식사 기록 생성 (POST /eating-histories/custom) */
export function useCreateCustomEatingHistory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateCustomEatingHistoryRequest) => {
      const res = await api
        .post('eating-histories/custom', { json: body })
        .json<ApiResponse<EatingHistoryItem>>();
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['eating-history'] });
    },
  });
}

/** 식사 기록 삭제 (DELETE /eating-histories/:id) */
export function useDeleteEatingHistory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api
        .delete(`eating-histories/${id}`)
        .json<ApiResponse<{ message: string }>>();
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['eating-history'] });
      qc.invalidateQueries({ queryKey: ['restaurant'] });
    },
  });
}

/** 이벤트 트래킹 (POST /events) */
export function useTrackEvent() {
  return useMutation({
    mutationFn: async (body: CreateEventRequest) => {
      const res = await api
        .post('events', { json: body })
        .json<ApiResponse<CreateEventResponse>>();
      return res.data;
    },
  });
}
