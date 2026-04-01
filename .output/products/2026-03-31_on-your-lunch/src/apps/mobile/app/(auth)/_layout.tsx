import { Stack } from 'expo-router';

/** 인증 그룹 레이아웃 */
export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="terms" />
    </Stack>
  );
}
