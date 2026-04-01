import { PriceRange, NotificationTime } from './enums';
import { CategorySummary, AllergyTypeSummary } from './restaurant';

// PUT /users/me/location 요청
export interface UpdateLocationRequest {
  latitude: number;
  longitude: number;
  address: string;
  buildingName?: string;
}

// PUT /users/me/location 응답
export interface UserLocationResponse {
  latitude: number;
  longitude: number;
  address: string;
  buildingName: string | null;
}

// PUT /users/me/preferences 요청
export interface UpdatePreferencesRequest {
  preferredCategoryIds: string[];
  excludedCategoryIds: string[];
  allergyTypeIds: string[];
  preferredPriceRange: PriceRange;
}

// PUT /users/me/preferences 응답
export interface UserPreferencesResponse {
  preferredCategories: CategorySummary[];
  excludedCategories: CategorySummary[];
  allergies: AllergyTypeSummary[];
  preferredPriceRange: PriceRange;
}

// POST /users/me/onboarding/complete 응답
export interface OnboardingCompleteResponse {
  isOnboardingCompleted: boolean;
}

// GET /users/me 응답
export interface UserMeResponse {
  id: string;
  email: string;
  nickname: string;
  profileImageUrl: string | null;
  location: UserLocationResponse | null;
  preferences: UserPreferencesResponse | null;
  notification: {
    enabled: boolean;
    time: NotificationTime;
  };
  marketingAgreed: boolean;
  isOnboardingCompleted: boolean;
  createdAt: string;
}

// PATCH /users/me/profile 요청
export interface UpdateProfileRequest {
  nickname?: string;
}

// PUT /users/me/notification 요청
export interface UpdateNotificationRequest {
  enabled: boolean;
  time: NotificationTime;
}

// PUT /users/me/push-token 요청
export interface UpdatePushTokenRequest {
  expoPushToken: string;
}
