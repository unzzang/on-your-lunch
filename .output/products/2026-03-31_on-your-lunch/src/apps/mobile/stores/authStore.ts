import { create } from 'zustand';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  userId: string | null;
  nickname: string | null;
  isOnboardingCompleted: boolean;

  setTokens: (access: string, refresh: string) => void;
  setUser: (userId: string, nickname: string, isOnboardingCompleted: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  userId: null,
  nickname: null,
  isOnboardingCompleted: false,

  setTokens: (access, refresh) =>
    set({ accessToken: access, refreshToken: refresh, isAuthenticated: true }),

  setUser: (userId, nickname, isOnboardingCompleted) =>
    set({ userId, nickname, isOnboardingCompleted }),

  logout: () =>
    set({
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      userId: null,
      nickname: null,
      isOnboardingCompleted: false,
    }),
}));
