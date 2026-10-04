import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { NotificationsSocket } from '../services/notifications-socket';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { getTokens } from '@/features/auth/services/token-storage';
import { api, API_URL } from '@/lib/api';
import * as Notifications from 'expo-notifications';

export const useDriverNotifications = (onNewMission: () => void) => {
  const { user } = useAuth();
  const socketRef = useRef<NotificationsSocket | null>(null);
  const onNewMissionRef = useRef(onNewMission);

  useEffect(() => {
    onNewMissionRef.current = onNewMission;
  }, [onNewMission]);

  useEffect(() => {
    if (!user) return;

    const setupNotifications = async () => {
      try {
        const { accessToken } = await getTokens();
        if (!accessToken) return;

        const { status } = await Notifications.requestPermissionsAsync();
        if (status === 'granted') {
          try {
            const tokenData = await Notifications.getExpoPushTokenAsync();
            await api.post('/devices/register-token', { expoPushToken: tokenData.data });
          } catch (tokenErr) {
            console.warn('Can\'t get push token (Firebase missing). Continuing with WebSocket...', tokenErr);
          }
        }

        const wsUrl = API_URL.replace(/\/api\/v1\/?$/, '');
        socketRef.current = new NotificationsSocket(wsUrl, accessToken, () => {
          onNewMissionRef.current();
        });

        socketRef.current.connect();
      } catch (err) {
        console.warn('Failed to setup notifications:', err);
      }
    };

    setupNotifications();

    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        onNewMissionRef.current();
      }
    });

    return () => {
      socketRef.current?.close();
      socketRef.current = null;
      subscription.remove();
    };
  }, [user]);
};
