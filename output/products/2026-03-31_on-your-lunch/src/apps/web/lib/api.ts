import ky from 'ky';
import type { ApiResponse } from '@on-your-lunch/shared-types';

/**
 * API 클라이언트 (ky 기반)
 *
 * - baseURL: /api (next.config.js rewrites로 localhost:3000/v1 프록시)
 * - 토큰 자동 주입: authStore에서 accessToken 읽어 Authorization 헤더 추가
 * - 401 시 refreshToken으로 재발급 시도
 */

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('oyl-auth');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.accessToken ?? null;
  } catch {
    return null;
  }
}

function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('oyl-auth');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.refreshToken ?? null;
  } catch {
    return null;
  }
}

function setTokensInStorage(accessToken: string, refreshToken: string) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem('oyl-auth');
    if (!raw) return;
    const parsed = JSON.parse(raw);
    parsed.state.accessToken = accessToken;
    parsed.state.refreshToken = refreshToken;
    localStorage.setItem('oyl-auth', JSON.stringify(parsed));
  } catch {
    // ignore
  }
}

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  if (isRefreshing && refreshPromise) return refreshPromise;

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) return false;

      const res = await ky
        .post('/api/auth/refresh', {
          json: { refreshToken },
        })
        .json<ApiResponse<{ accessToken: string; refreshToken: string }>>();

      if (res.success) {
        setTokensInStorage(res.data.accessToken, res.data.refreshToken);
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

const api = ky.create({
  prefixUrl: '/api',
  timeout: 15000,
  hooks: {
    beforeRequest: [
      (request) => {
        const token = getToken();
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`);
        }
      },
    ],
    afterResponse: [
      async (request, _options, response) => {
        if (response.status === 401) {
          const refreshed = await refreshAccessToken();
          if (refreshed) {
            const newToken = getToken();
            if (newToken) {
              request.headers.set('Authorization', `Bearer ${newToken}`);
              return ky(request);
            }
          }
          // refresh 실패 시 로그아웃 처리
          if (typeof window !== 'undefined') {
            localStorage.removeItem('oyl-auth');
            window.location.href = '/login';
          }
        }
        return response;
      },
    ],
  },
});

export default api;

/**
 * API 응답에서 data 필드를 추출하는 헬퍼
 * { success: true, data: T } -> T
 */
export async function fetchData<T>(
  promise: Promise<ApiResponse<T>>,
): Promise<T> {
  const result = await promise;
  return result.data;
}
