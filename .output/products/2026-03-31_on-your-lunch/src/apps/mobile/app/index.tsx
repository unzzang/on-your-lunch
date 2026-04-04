import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuthStore } from '../stores/authStore';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export default function Index() {
  const { isAuthenticated, setTokens, setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function autoLogin() {
      // 이미 인증된 상태면 바로 진행
      if (isAuthenticated) {
        setIsLoading(false);
        return;
      }

      // 개발 환경에서만 dev-login 자동 호출
      if (__DEV__) {
        try {
          const response = await fetch(`${API_BASE_URL}/v1/auth/dev-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });

          if (response.ok) {
            const json = await response.json();
            const result = json.data; // API 응답 래퍼: { success, data: { ... } }
            setTokens(result.accessToken, result.refreshToken);

            if (result.user) {
              setUser(
                result.user.id,
                result.user.nickname ?? null,
                result.user.isOnboardingCompleted ?? false,
              );
            }
          } else {
            console.warn('[dev-login] 실패:', response.status);
          }
        } catch (error) {
          console.warn('[dev-login] 서버 연결 실패:', error);
        }
      }

      setIsLoading(false);
    }

    autoLogin();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Redirect href="/(tabs)/home" />;
}
