// ─────────────────────────────────────────
// TanStack Query 훅 통합 진입점
//
// 화면에서 이렇게 import:
// import { useRecommendations, useRestaurant, useMe } from '@/services/hooks';
// ─────────────────────────────────────────

export { useRecommendations, useRefreshRecommendations } from './useRecommendations';
export { useRestaurant, useRestaurantList, useRestaurantMapPins } from './useRestaurant';
export {
  useEatingHistoryCalendar,
  useCreateEatingHistory,
  useUpdateEatingHistory,
  useDeleteEatingHistory,
} from './useEatingHistory';
export {
  useMe,
  useUpdateProfile,
  useUpdateLocation,
  useUpdatePreferences,
  useUpdateNotification,
} from './useUser';
export { useCategories, useAllergyTypes } from './useCategories';
export { useFavoriteToggle } from './useFavorite';
