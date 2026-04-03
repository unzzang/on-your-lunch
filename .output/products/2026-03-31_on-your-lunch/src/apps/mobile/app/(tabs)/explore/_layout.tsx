import { Stack } from 'expo-router';

export default function ExploreStack() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="restaurant/[id]"
        options={{ animation: 'slide_from_right' }}
      />
    </Stack>
  );
}
