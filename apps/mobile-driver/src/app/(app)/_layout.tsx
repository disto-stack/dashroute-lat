import { Stack } from 'expo-router';
import { TrackingProvider } from '@/context/TrackingContext';

export default function AppLayout() {
  return (
    <TrackingProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="dashboard" />
      </Stack>
    </TrackingProvider>
  );
}
