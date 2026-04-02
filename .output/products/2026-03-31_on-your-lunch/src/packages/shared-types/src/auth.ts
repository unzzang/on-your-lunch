// ─────────────────────────────────────────
// 인증 API 타입 (API 스펙 2절)
// POST /auth/google, /auth/refresh, /auth/logout
// ─────────────────────────────────────────

// --- Google 로그인 ---

export interface GoogleLoginRequest {
  idToken: string;          // Google ID Token
  termsAgreed: boolean;     // 필수 약관 동의
  marketingAgreed: boolean; // 마케팅 수신 동의 (선택)
}

export interface AuthUser {
  id: string;
  email: string;
  nickname: string;
  profileImageUrl: string | null;
  isOnboardingCompleted: boolean;
}

export interface GoogleLoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

// --- 토큰 갱신 ---

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}
