import { Stack } from 'expo-router';

export default function MypageStack() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="edit-profile"
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="edit-location"
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="edit-preference"
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="notification"
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="withdraw"
        options={{ animation: 'slide_from_right' }}
      />
    </Stack>
  );
}
