import {
  METERS_PER_MINUTE,
  ROAD_CORRECTION_FACTOR,
} from '@on-your-lunch/shared-types';

/**
 * 두 좌표 사이의 도보 시간(분)을 계산한다.
 * Haversine 공식으로 직선 거리를 구한 뒤, 도로 보정 계수를 적용한다.
 */
export function calcWalkMinutes(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round((distance * ROAD_CORRECTION_FACTOR) / METERS_PER_MINUTE);
}
