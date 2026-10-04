import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { DriverSessionProvider } from '@/features/session/components/DriverSessionProvider';

export default function AppLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (!user) return <Redirect href="/login" />;

  return (
    <DriverSessionProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="home" />
      </Stack>
    </DriverSessionProvider>
  );
}
