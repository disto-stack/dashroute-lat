import React, { createContext, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useCurrentLocation } from '@/features/geolocation/hooks/useCurrentLocation';
import { useLocationSocket } from '@/features/geolocation/hooks/useLocationSocket';
import { Coordinate, LocationPermissionStatus } from '@/features/geolocation/types';
import { useDriverNotifications } from '@/features/missions/hooks/useDriverNotifications';
import { useAvailability } from '../hooks/useAvailability';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowList: true,
  }),
});

export type DriverSession = {
  coords: Coordinate | null;
  locationStatus: LocationPermissionStatus;
  available: boolean;
  canGoOnline: boolean;
  setAvailable: (next: boolean) => void;
};

export const DriverSessionContext = createContext<DriverSession | null>(null);

export function DriverSessionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { coords, status: locationStatus } = useCurrentLocation();
  const { available: preferred, loaded, setAvailable } = useAvailability(user?.id);

  const canGoOnline = user?.courierProfile?.isVerified !== false;
  const available = loaded && preferred && canGoOnline;

  useLocationSocket(coords, available ? 'IDLE' : 'OFFLINE');

  const handleMissionAssigned = useCallback(() => {
    Alert.alert('New Mission!', 'You have received a new assignment from the backend 🚀');
  }, []);

  useDriverNotifications(handleMissionAssigned);

  const value = useMemo<DriverSession>(
    () => ({ coords, locationStatus, available, canGoOnline, setAvailable }),
    [coords, locationStatus, available, canGoOnline, setAvailable]
  );

  return <DriverSessionContext.Provider value={value}>{children}</DriverSessionContext.Provider>;
}
