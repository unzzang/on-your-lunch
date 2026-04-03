// -----------------------------------------
// 온보딩 그룹 레이아웃
//
// 온보딩 3단계(위치/취향/제외) 화면을 감싸는 레이아웃.
// 뒤로가기 없이 순차 진행.
// -----------------------------------------

import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: false,
      }}
    />
  );
}
