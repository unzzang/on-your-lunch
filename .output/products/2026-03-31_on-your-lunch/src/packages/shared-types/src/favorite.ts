// ─────────────────────────────────────────
// 즐겨찾기 API 타입 (API 스펙 7절)
// ─────────────────────────────────────────

// --- 즐겨찾기 토글 (POST /favorites/toggle) ---

export interface ToggleFavoriteRequest {
  restaurantId: string;
}

export interface ToggleFavoriteResponse {
  restaurantId: string;
  isFavorite: boolean; // true면 추가됨, false면 해제됨
}
