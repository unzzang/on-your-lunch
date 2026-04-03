// ─────────────────────────────────────────
// 루트 레이아웃
//
// 앱 전체를 감싸는 최상위 레이아웃.
// QueryClientProvider(서버 상태), GestureHandler(제스처) 등을 여기서 설정.
// ─────────────────────────────────────────

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StyleSheet } from 'react-native';

// TanStack Query 클라이언트 (서버 상태 캐싱 관리)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 5분간 캐시 유지
      staleTime: 5 * 60 * 1000,
      // 네트워크 에러 시 3회 재시도
      retry: 3,
    },
  },
});

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          {/* 인증 그룹 */}
          <Stack.Screen name="(auth)" />
          {/* 온보딩 그룹 */}
          <Stack.Screen name="(onboarding)" />
          {/* 메인 탭 그룹 */}
          <Stack.Screen name="(tabs)" />
          {/* 식당 상세 */}
          <Stack.Screen
            name="restaurant/[id]"
            options={{ animation: 'slide_from_right' }}
          />
          {/* 먹었어요 기록 */}
          <Stack.Screen
            name="record/[restaurantId]"
            options={{ animation: 'slide_from_bottom' }}
          />
        </Stack>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
