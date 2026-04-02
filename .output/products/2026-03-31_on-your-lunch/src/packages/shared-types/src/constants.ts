// ─────────────────────────────────────────
// 공용 상수
// 숫자/문자열을 하드코딩하지 않고 여기서 관리.
// 백엔드와 프론트가 같은 상수를 쓰면
// "백엔드는 5회인데 프론트는 3회로 되어있어" 같은 버그를 막을 수 있다.
// ─────────────────────────────────────────

// 추천 새로고침 최대 횟수 (기능 명세 01, API 스펙 4.2절)
export const MAX_REFRESH_COUNT = 5;

// 별점 범위 (기능 명세 03)
export const RATING_MIN = 1;
export const RATING_MAX = 5;

// 메모 최대 길이 (기능 명세 03)
export const MEMO_MAX_LENGTH = 300;

// 닉네임 길이 (기능 명세 02)
export const NICKNAME_MIN_LENGTH = 2;
export const NICKNAME_MAX_LENGTH = 10;

// 도보 거리 필터 옵션 (API 스펙 4.1절)
// as const로 선언하면 타입이 number[]가 아닌 [5, 10, 15]가 된다.
// 이 3개 값만 허용하는 타입을 만들 수 있다.
export const WALK_MINUTES_OPTIONS = [5, 10, 15] as const;
export type WalkMinutes = (typeof WALK_MINUTES_OPTIONS)[number]; // 5 | 10 | 15

// 알림 시간 옵션 (API 스펙 8.3절)
export const NOTIFICATION_TIMES = [
  '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00',
] as const;
export type NotificationTime = (typeof NOTIFICATION_TIMES)[number];
// '10:00' | '10:30' | '11:00' | '11:30' | '12:00' | '12:30' | '13:00'
