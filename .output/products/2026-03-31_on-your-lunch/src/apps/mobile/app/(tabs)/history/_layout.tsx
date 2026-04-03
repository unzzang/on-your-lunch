import { Stack } from 'expo-router';

export default function HistoryStack() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="restaurant/[id]"
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="record/[restaurantId]"
        options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
      />
    </Stack>
  );
}
