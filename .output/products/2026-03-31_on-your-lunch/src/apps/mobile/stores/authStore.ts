// ─────────────────────────────────────────
// 인증 스토어
//
// JWT 토큰, 로그인 상태, 사용자 기본 정보를 관리.
// 토큰은 SecureStore에 영속화.
// 서버 데이터(상세 프로필 등)는 TanStack Query가 관리하므로 여기에 복제하지 않음.
// ─────────────────────────────────────────

import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import type { AuthUser } from '@on-your-lunch/shared-types';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

interface AuthState {
  // 상태
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean; // 토큰 복원 중 여부

  // 액션
  setTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  setUser: (user: AuthUser) => void;
  logout: () => Promise<void>;
  restoreTokens: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,

  // 로그인 성공 시 토큰 저장
  setTokens: async (accessToken, refreshToken) => {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    set({ accessToken, refreshToken, isAuthenticated: true });
  },

  // 사용자 정보 설정
  setUser: (user) => {
    set({ user });
  },

  // 로그아웃 시 토큰 삭제
  logout: async () => {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    set({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
    });
  },

  // 앱 시작 시 저장된 토큰 복원
  restoreTokens: async () => {
    try {
      const accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
      const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      if (accessToken && refreshToken) {
        set({ accessToken, refreshToken, isAuthenticated: true });
      }
    } finally {
      set({ isLoading: false });
    }
  },
}));
