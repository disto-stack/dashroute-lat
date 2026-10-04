/* eslint-disable @typescript-eslint/no-require-imports */
import { Text } from 'react-native';
import { render, waitFor, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useCurrentLocation } from '@/features/geolocation/hooks/useCurrentLocation';
import { useLocationSocket } from '@/features/geolocation/hooks/useLocationSocket';
import { useDriverNotifications } from '@/features/missions/hooks/useDriverNotifications';
import { DriverSessionProvider, DriverSession } from './DriverSessionProvider';
import { useDriverSession } from '../hooks/useDriverSession';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
jest.mock('expo-notifications', () => ({ setNotificationHandler: jest.fn() }));
jest.mock('@/features/auth/hooks/useAuth', () => ({ useAuth: jest.fn() }));
jest.mock('@/features/geolocation/hooks/useCurrentLocation', () => ({ useCurrentLocation: jest.fn() }));
jest.mock('@/features/geolocation/hooks/useLocationSocket', () => ({ useLocationSocket: jest.fn() }));
jest.mock('@/features/missions/hooks/useDriverNotifications', () => ({ useDriverNotifications: jest.fn() }));

const coords = { latitude: 4.71, longitude: -74.07 };
let session: DriverSession;

function Probe() {
  // eslint-disable-next-line react-hooks/globals
  session = useDriverSession();
  return <Text>probe</Text>;
}

const renderProvider = () =>
  render(
    <DriverSessionProvider>
      <Probe />
    </DriverSessionProvider>
  );

const lastStatus = () => {
  const calls = (useLocationSocket as jest.Mock).mock.calls;
  return calls[calls.length - 1][1];
};

beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();
  (useAuth as jest.Mock).mockReturnValue({
    user: { id: 'usr-1', fullName: 'Andrés Martínez', courierProfile: { id: 'cur-1', isVerified: true } },
  });
  (useCurrentLocation as jest.Mock).mockReturnValue({ coords, status: 'granted', error: null });
});

test('reports OFFLINE until the stored preference loads, then IDLE', async () => {
  await renderProvider();

  expect((useLocationSocket as jest.Mock).mock.calls[0]).toEqual([coords, 'OFFLINE']);
  await waitFor(() => expect(lastStatus()).toBe('IDLE'));
  expect(session.available).toBe(true);
});

test('stays OFFLINE when the courier left the switch off', async () => {
  await AsyncStorage.setItem('driver.available.usr-1', 'false');

  await renderProvider();

  await waitFor(() => expect(session.available).toBe(false));
  expect(lastStatus()).toBe('OFFLINE');
});

test('switching availability off and on changes the reported status', async () => {
  await renderProvider();
  await waitFor(() => expect(lastStatus()).toBe('IDLE'));

  await act(async () => session.setAvailable(false));
  expect(lastStatus()).toBe('OFFLINE');
  expect(await AsyncStorage.getItem('driver.available.usr-1')).toBe('false');

  await act(async () => session.setAvailable(true));
  expect(lastStatus()).toBe('IDLE');
});

test('an unverified courier can never go online', async () => {
  (useAuth as jest.Mock).mockReturnValue({
    user: { id: 'usr-1', fullName: 'Andrés', courierProfile: { id: 'cur-1', isVerified: false } },
  });

  await renderProvider();

  await waitFor(() => expect(session.canGoOnline).toBe(false));
  expect(session.available).toBe(false);
  expect(lastStatus()).toBe('OFFLINE');
});

test('exposes the location and wires the notifications hook once', async () => {
  await renderProvider();

  expect(session.coords).toEqual(coords);
  expect(session.locationStatus).toBe('granted');
  expect(useDriverNotifications).toHaveBeenCalledWith(expect.any(Function));
});

test('useDriverSession throws outside of the provider', async () => {
  const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
  const Orphan = () => {
    useDriverSession();
    return null;
  };

  await expect(render(<Orphan />)).rejects.toThrow(
    'useDriverSession must be used within a DriverSessionProvider'
  );
  spy.mockRestore();
});
