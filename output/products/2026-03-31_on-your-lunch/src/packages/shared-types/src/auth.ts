export interface GoogleLoginRequest {
  idToken: string;
  termsAgreed: boolean;
  marketingAgreed: boolean;
}

export interface GoogleLoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    nickname: string;
    profileImageUrl: string | null;
    isOnboardingCompleted: boolean;
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface DevLoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    nickname: string;
    profileImageUrl: string | null;
    isOnboardingCompleted: boolean;
  };
}
