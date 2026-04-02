import { PriceRange } from './enums';
import { CategorySummary } from './common';
import { NotificationTime } from './constants';

// ─────────────────────────────────────────
// 사용자 API 타입
// 온보딩 (API 스펙 3절) + 사용자 정보 (API 스펙 8절)
// ─────────────────────────────────────────

// --- 회사 위치 ---

export interface UpdateLocationRequest {
  latitude: number;
  longitude: number;
  address: string;
  buildingName?: string;
}

export interface LocationResponse {
  latitude: number;
  longitude: number;
  address: string;
  buildingName: string | null;
}

// --- 취향 설정 ---

export interface UpdatePreferencesRequest {
  preferredCategoryIds: string[];
  excludedCategoryIds: string[];
  allergyTypeIds: string[];
  preferredPriceRange: PriceRange;
}

export interface PreferencesResponse {
  preferredCategories: CategorySummary[];
  excludedCategories: CategorySummary[];
  allergies: { id: string; name: string }[];
  preferredPriceRange: PriceRange;
}

// --- 온보딩 완료 ---

export interface OnboardingCompleteResponse {
  isOnboardingCompleted: boolean;
}

// --- 내 정보 조회 ---

export interface UserMeResponse {
  id: string;
  email: string;
  nickname: string;
  profileImageUrl: string | null;
  location: LocationResponse | null;
  preferences: PreferencesResponse;
  notification: {
    enabled: boolean;
    time: string;
  };
  marketingAgreed: boolean;
  isOnboardingCompleted: boolean;
  createdAt: string;
}

// --- 프로필 수정 ---

export interface UpdateProfileRequest {
  nickname?: string;
}

// --- 알림 설정 ---

export interface UpdateNotificationRequest {
  enabled: boolean;
  time: NotificationTime;
}

// --- 프로필 수정 응답 ---
// multipart/form-data로 사진 업로드 시에는 FormData를 사용하므로
// 요청 타입에 profileImage 필드는 포함하지 않음 (프론트에서 FormData로 처리)
export type UpdateProfileResponse = UserMeResponse;

// --- 알림 설정 응답 ---

export interface UpdateNotificationResponse {
  enabled: boolean;
  time: string;
}

// --- 푸시 토큰 등록 ---

export interface RegisterPushTokenRequest {
  expoPushToken: string;
}
