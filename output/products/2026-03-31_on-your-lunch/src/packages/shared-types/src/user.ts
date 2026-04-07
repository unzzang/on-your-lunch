import { CategorySummary } from './common';
import { PriceRange } from './enums';

export interface UserProfile {
  id: string;
  email: string;
  nickname: string;
  profileImageUrl: string | null;
  location: UserLocation | null;
  preferences: UserPreferences;
  notification: NotificationSettings;
  marketingAgreed: boolean;
  isOnboardingCompleted: boolean;
  createdAt: string;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  address: string;
  buildingName: string | null;
}

export interface UserPreferences {
  preferredCategories: CategorySummary[];
  excludedCategories: CategorySummary[];
  allergies: { id: string; name: string }[];
  preferredPriceRange: PriceRange;
}

export interface NotificationSettings {
  enabled: boolean;
  time: string;
}

export interface UpdateLocationRequest {
  latitude: number;
  longitude: number;
  address: string;
  buildingName?: string;
}

export interface UpdatePreferencesRequest {
  preferredCategoryIds: string[];
  excludedCategoryIds: string[];
  allergyTypeIds: string[];
  preferredPriceRange: PriceRange;
}

export interface UpdateProfileRequest {
  nickname?: string;
  profileImageUrl?: string | null;
}

export interface UpdateNotificationRequest {
  enabled: boolean;
  time: string;
}

export interface UpdatePushTokenRequest {
  expoPushToken: string;
}
