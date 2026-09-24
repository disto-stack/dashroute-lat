import { renderHook, waitFor } from '@testing-library/react-native';
import { getTokens } from '@/features/auth/services/token-storage';
import { LocationSocket } from '../services/location-socket';
import { useLocationSocket } from './useLocationSocket';

jest.mock('@/features/auth/services/token-storage');
jest.mock('../services/location-socket');

const MockLocationSocket = LocationSocket as jest.MockedClass<typeof LocationSocket>;

beforeEach(() => {
  jest.clearAllMocks();
  (getTokens as jest.Mock).mockResolvedValue({ accessToken: 'token-123' });
});

test('connects once an access token is available', async () => {
  renderHook(() => useLocationSocket(null, 'ONLINE'));

  await waitFor(() => expect(MockLocationSocket).toHaveBeenCalledWith(expect.any(String), 'token-123'));
  expect(MockLocationSocket.mock.instances[0].connect).toHaveBeenCalled();
});

test('sends a ping with the current coordinates and status on every update', async () => {
  const { rerender } = await renderHook(({ coords, status }: any) => useLocationSocket(coords, status), {
    initialProps: { coords: null, status: 'ONLINE' },
  });

  await waitFor(() => expect(MockLocationSocket).toHaveBeenCalled());
  const instance = MockLocationSocket.mock.instances[0];

  await rerender({ coords: { latitude: 4.71, longitude: -74.07 }, status: 'ONLINE' });

  await waitFor(() =>
    expect(instance.send).toHaveBeenCalledWith({ latitude: 4.71, longitude: -74.07, status: 'ONLINE' })
  );
});

test('closes the socket on unmount', async () => {
  const { unmount } = await renderHook(() => useLocationSocket(null, 'ONLINE'));

  await waitFor(() => expect(MockLocationSocket).toHaveBeenCalled());
  const instance = MockLocationSocket.mock.instances[0];

  await unmount();

  await waitFor(() => expect(instance.close).toHaveBeenCalled());
});
