import { Stack } from 'expo-router';

/** 온보딩 그룹 레이아웃 */
export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="location" />
      <Stack.Screen name="preference" />
      <Stack.Screen name="exclusion" />
    </Stack>
  );
}
