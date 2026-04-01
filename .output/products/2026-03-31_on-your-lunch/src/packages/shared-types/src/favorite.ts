// POST /favorites/toggle 요청
export interface ToggleFavoriteRequest {
  restaurantId: string;
}

// POST /favorites/toggle 응답
export interface ToggleFavoriteResponse {
  restaurantId: string;
  isFavorite: boolean;
}
