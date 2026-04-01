// POST /auth/google 요청
export interface GoogleLoginRequest {
  idToken: string;
  termsAgreed: boolean;
  marketingAgreed: boolean;
}

// POST /auth/google 응답 내 사용자 정보
export interface AuthUser {
  id: string;
  email: string;
  nickname: string;
  profileImageUrl: string | null;
  isOnboardingCompleted: boolean;
}

// POST /auth/google 응답
export interface GoogleLoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

// POST /auth/refresh 요청
export interface RefreshTokenRequest {
  refreshToken: string;
}

// POST /auth/refresh 응답
export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}
