import ky from 'ky';
import { useAuthStore } from '../stores/authStore';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/v1';

export const api = ky.create({
  prefixUrl: API_BASE_URL,
  timeout: 10000,
  hooks: {
    beforeRequest: [
      (request) => {
        const token = useAuthStore.getState().accessToken;
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`);
        }
      },
    ],
    afterResponse: [
      async (_request, _options, response) => {
        if (response.status === 401) {
          // 토큰 만료 시 로그아웃 처리
          useAuthStore.getState().logout();
        }
      },
    ],
  },
});
