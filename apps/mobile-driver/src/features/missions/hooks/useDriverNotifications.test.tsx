import { renderHook, waitFor } from '@testing-library/react-native';
import { AppState } from 'react-native';
import { useDriverNotifications } from './useDriverNotifications';
import { useAuth } from '@/context/AuthContext';
import { getTokens } from '@/features/auth/services/token-storage';
import { api } from '@/lib/api';
import * as Notifications from 'expo-notifications';
import { NotificationsSocket } from '../services/notifications-socket';

jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/features/auth/services/token-storage', () => ({
  getTokens: jest.fn(),
}));

jest.mock('@/lib/api', () => ({
  api: { post: jest.fn() },
  API_URL: 'https://api.dashroute.localhost/api/v1',
}));

jest.mock('expo-notifications', () => ({
  requestPermissionsAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn(),
}));

jest.mock('../services/notifications-socket');

describe('useDriverNotifications', () => {
  const mockOnNewMission = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useAuth as jest.Mock).mockReturnValue({ user: { id: 'driver-1' } });
    (getTokens as jest.Mock).mockResolvedValue({ accessToken: 'token-123' });
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({ data: 'ExponentPushToken[123]' });
    (api.post as jest.Mock).mockResolvedValue({ data: {} });
  });

  it('does nothing if user is not authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null });
    
    renderHook(() => useDriverNotifications(mockOnNewMission));
    
    expect(getTokens).not.toHaveBeenCalled();
    expect(NotificationsSocket).not.toHaveBeenCalled();
  });

  it('registers expo push token and connects socket when authenticated', async () => {
    renderHook(() => useDriverNotifications(mockOnNewMission));

    await waitFor(() => {
      expect(getTokens).toHaveBeenCalled();
      
      expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
      expect(Notifications.getExpoPushTokenAsync).toHaveBeenCalled();
      
      expect(api.post).toHaveBeenCalledWith('/devices/register-token', {
        expoPushToken: 'ExponentPushToken[123]',
      });

      expect(NotificationsSocket).toHaveBeenCalledWith(
        'https://api.dashroute.localhost',
        'token-123',
        expect.any(Function)
      );
      
      const socketInstance = (NotificationsSocket as jest.Mock).mock.instances[0];
      expect(socketInstance.connect).toHaveBeenCalled();
    });
  });

  it('calls onNewMission when AppState becomes active', async () => {
    const addEventListenerSpy = jest.spyOn(AppState, 'addEventListener').mockReturnValue({ remove: jest.fn() } as any);
    
    renderHook(() => useDriverNotifications(mockOnNewMission));
    
    await waitFor(() => {
      expect(addEventListenerSpy).toHaveBeenCalled();
    });
    
    const changeCallback = addEventListenerSpy.mock.calls[0][1];
    changeCallback('active');
    
    expect(mockOnNewMission).toHaveBeenCalledTimes(1);
    
    changeCallback('background');
    expect(mockOnNewMission).toHaveBeenCalledTimes(1);
    
    addEventListenerSpy.mockRestore();
  });
});
