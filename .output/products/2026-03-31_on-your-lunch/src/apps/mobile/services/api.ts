import ky from 'ky';
import { useAuthStore } from '@/stores/authStore';
import type {
  RefreshTokenRequest,
  RefreshTokenResponse,
  ApiResponse,
} from '@on-your-lunch/shared-types';

/**
 * API 클라이언트 (ky 인스턴스)
 *
 * - Base URL 설정
 * - Authorization 헤더 자동 주입
 * - 401 시 토큰 갱신 후 재요청
 */

// 환경별 API URL
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

// 토큰 갱신 중복 방지
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken, setTokens, logout } = useAuthStore.getState();

  if (!refreshToken) {
    await logout();
    return null;
  }

  try {
    const response = await ky
      .post(`${API_BASE_URL}/v1/auth/refresh`, {
        json: { refreshToken } satisfies RefreshTokenRequest,
      })
      .json<ApiResponse<RefreshTokenResponse>>();

    const { accessToken, refreshToken: newRefreshToken } = response.data;
    await setTokens(accessToken, newRefreshToken);
    return accessToken;
  } catch {
    await logout();
    return null;
  }
}

export const api = ky.create({
  prefixUrl: `${API_BASE_URL}/v1`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  hooks: {
    beforeRequest: [
      (request) => {
        const { accessToken } = useAuthStore.getState();
        if (accessToken) {
          request.headers.set('Authorization', `Bearer ${accessToken}`);
        }
      },
    ],
    afterResponse: [
      async (request, _options, response) => {
        // 401이면 토큰 갱신 후 재요청
        if (response.status === 401) {
          // 이미 갱신 중이면 기다림
          if (!refreshPromise) {
            refreshPromise = refreshAccessToken();
          }

          const newToken = await refreshPromise;
          refreshPromise = null;

          if (newToken) {
            request.headers.set('Authorization', `Bearer ${newToken}`);
            return ky(request);
          }
        }
        return response;
      },
    ],
  },
});
