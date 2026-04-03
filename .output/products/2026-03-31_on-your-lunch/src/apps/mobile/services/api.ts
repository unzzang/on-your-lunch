// ─────────────────────────────────────────
// API 클라이언트
//
// ky 인스턴스 (fetch 래퍼).
// - base URL: http://localhost:3000/v1
// - Authorization 헤더 자동 주입
// - 401 응답 시 토큰 자동 갱신 후 재시도
// ─────────────────────────────────────────

import ky from 'ky';
import { useAuthStore } from '@/stores/authStore';
import type {
  ApiResponse,
  RefreshTokenResponse,
} from '@on-your-lunch/shared-types';

// 환경 변수에서 API URL을 읽되, 없으면 로컬 개발 서버 사용
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/v1';

// ky 인스턴스 생성
export const api = ky.create({
  prefixUrl: BASE_URL,
  timeout: 10000, // 10초
  hooks: {
    beforeRequest: [
      (request) => {
        // 저장된 accessToken을 Authorization 헤더에 자동 주입
        const { accessToken } = useAuthStore.getState();
        if (accessToken) {
          request.headers.set('Authorization', `Bearer ${accessToken}`);
        }
      },
    ],
    afterResponse: [
      async (request, options, response) => {
        // 401 Unauthorized → 토큰 갱신 시도
        if (response.status === 401) {
          const { refreshToken, setTokens, logout } =
            useAuthStore.getState();

          if (!refreshToken) {
            await logout();
            return response;
          }

          try {
            // 토큰 갱신 API 호출
            const refreshResponse = await ky
              .post(`${BASE_URL}/auth/refresh`, {
                json: { refreshToken },
              })
              .json<ApiResponse<RefreshTokenResponse>>();

            // 새 토큰 저장
            await setTokens(
              refreshResponse.data.accessToken,
              refreshResponse.data.refreshToken,
            );

            // 원래 요청을 새 토큰으로 재시도
            request.headers.set(
              'Authorization',
              `Bearer ${refreshResponse.data.accessToken}`,
            );
            return ky(request, options);
          } catch {
            // 갱신 실패 시 로그아웃
            await logout();
            return response;
          }
        }
        return response;
      },
    ],
  },
});
