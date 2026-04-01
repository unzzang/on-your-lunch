// 가격대
export enum PriceRange {
  UNDER_10K = 'UNDER_10K',
  BETWEEN_10K_20K = 'BETWEEN_10K_20K',
  OVER_20K = 'OVER_20K',
}

// 식당 데이터 출처
export enum DataSource {
  KAKAO = 'KAKAO',
  MANUAL = 'MANUAL',
  USER = 'USER',
}

// 알림 허용 시간 (30분 단위)
export const NOTIFICATION_TIMES = [
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '12:00',
  '12:30',
  '13:00',
] as const;

export type NotificationTime = (typeof NOTIFICATION_TIMES)[number];

// 식당 탐색 정렬 기준
export enum RestaurantSort {
  DISTANCE = 'distance',
  RATING = 'rating',
}

// 도보 거리 필터 허용값 (분)
export const WALK_MINUTES_OPTIONS = [5, 10, 15] as const;
export type WalkMinutes = (typeof WALK_MINUTES_OPTIONS)[number];

// 추천 새로고침 최대 횟수
export const MAX_REFRESH_COUNT = 5;

// 별점 범위
export const RATING_MIN = 1;
export const RATING_MAX = 5;

// 메모 최대 길이
export const MEMO_MAX_LENGTH = 300;

// 닉네임 길이 범위
export const NICKNAME_MIN_LENGTH = 2;
export const NICKNAME_MAX_LENGTH = 10;
