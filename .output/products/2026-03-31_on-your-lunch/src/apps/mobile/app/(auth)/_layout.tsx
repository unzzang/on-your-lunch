// -----------------------------------------
// 인증 그룹 레이아웃
//
// 로그인, 약관 동의 화면을 감싸는 레이아웃.
// 헤더 없이 전체 화면으로 표시.
// -----------------------------------------

import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    />
  );
}
