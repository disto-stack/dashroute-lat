import { renderHook, waitFor } from '@testing-library/react-native';
import { getTokens } from '@/features/auth/services/token-storage';
import { LocationSocket } from '../services/location-socket';
import { useLocationSocket } from './useLocationSocket';

jest.mock('@/features/auth/services/token-storage');
jest.mock('../services/location-socket');

const MockLocationSocket = LocationSocket as jest.MockedClass<typeof LocationSocket>;
const sendMock = (instance: LocationSocket) => instance.send as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  (getTokens as jest.Mock).mockResolvedValue({ accessToken: 'token-123' });
});

test('connects with a provider that reads the current access token', async () => {
  await renderHook(() => useLocationSocket(null, 'IDLE'));

  await waitFor(() => expect(MockLocationSocket).toHaveBeenCalled());
  const [url, tokenProvider] = MockLocationSocket.mock.calls[0];
  expect(url).toEqual(expect.any(String));
  expect(MockLocationSocket.mock.instances[0].connect).toHaveBeenCalled();

  await expect(tokenProvider()).resolves.toBe('token-123');
  (getTokens as jest.Mock).mockResolvedValue({ accessToken: 'refreshed-token' });
  await expect(tokenProvider()).resolves.toBe('refreshed-token');
});

test('sends a ping with the current coordinates and status on every update', async () => {
  const { rerender } = await renderHook(({ coords, status }: any) => useLocationSocket(coords, status), {
    initialProps: { coords: null, status: 'IDLE' },
  });

  await waitFor(() => expect(MockLocationSocket).toHaveBeenCalled());
  const instance = MockLocationSocket.mock.instances[0];

  await rerender({ coords: { latitude: 4.71, longitude: -74.07 }, status: 'IDLE' });
  await waitFor(() =>
    expect(instance.send).toHaveBeenCalledWith({ latitude: 4.71, longitude: -74.07, status: 'IDLE' })
  );

  await rerender({ coords: { latitude: 4.71, longitude: -74.07 }, status: 'OFFLINE' });
  await waitFor(() =>
    expect(instance.send).toHaveBeenCalledWith({ latitude: 4.71, longitude: -74.07, status: 'OFFLINE' })
  );
});

test('re-sends the last ping periodically while the courier stands still', async () => {
  const { rerender } = await renderHook(
    ({ coords }: any) => useLocationSocket(coords, 'IDLE', 20),
    { initialProps: { coords: null } }
  );
  const instance = MockLocationSocket.mock.instances[0];

  await rerender({ coords: { latitude: 4.71, longitude: -74.07 } });
  await waitFor(() => expect(sendMock(instance).mock.calls.length).toBeGreaterThanOrEqual(3));

  for (const [ping] of sendMock(instance).mock.calls) {
    expect(ping).toEqual({ latitude: 4.71, longitude: -74.07, status: 'IDLE' });
  }
});

test('does not send heartbeats before the first position is known', async () => {
  await renderHook(() => useLocationSocket(null, 'IDLE', 20));
  const instance = MockLocationSocket.mock.instances[0];

  await new Promise((resolve) => setTimeout(resolve, 80));

  expect(instance.send).not.toHaveBeenCalled();
});

test('flushes the latest ping when the socket opens', async () => {
  await renderHook(() => useLocationSocket({ latitude: 4.71, longitude: -74.07 }, 'IDLE'));
  const instance = MockLocationSocket.mock.instances[0];
  const onOpen = MockLocationSocket.mock.calls[0][2]!;
  sendMock(instance).mockClear();

  onOpen();

  expect(instance.send).toHaveBeenCalledWith({ latitude: 4.71, longitude: -74.07, status: 'IDLE' });
});

test('closes the socket on unmount', async () => {
  const { unmount } = await renderHook(() => useLocationSocket(null, 'IDLE'));

  await waitFor(() => expect(MockLocationSocket).toHaveBeenCalled());
  const instance = MockLocationSocket.mock.instances[0];

  await unmount();

  await waitFor(() => expect(instance.close).toHaveBeenCalled());
});
