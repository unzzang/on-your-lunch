// ─────────────────────────────────────────
// 이벤트 로그 API 타입 (API 스펙 10절)
// POST /events — 사용자 행동 추적용
// ─────────────────────────────────────────

export interface CreateEventRequest {
  eventName: string;                    // "recommendation_viewed" 등
  eventData: Record<string, unknown>;   // 이벤트별 상세 데이터 (JSON)
}
