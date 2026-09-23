import { renderHook, waitFor } from '@testing-library/react-native';
import * as Location from 'expo-location';
import { useCurrentLocation } from './useCurrentLocation';

jest.mock('expo-location', () => ({
  Accuracy: { High: 4 },
  requestForegroundPermissionsAsync: jest.fn(),
  watchPositionAsync: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

test('reports "denied" without watching position when permission is refused', async () => {
  (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });

  const { result } = await renderHook(() => useCurrentLocation());

  await waitFor(() => expect(result.current.status).toBe('denied'));
  expect(Location.watchPositionAsync).not.toHaveBeenCalled();
  expect(result.current.coords).toBeNull();
});

test('streams coordinates once permission is granted', async () => {
  (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
  const remove = jest.fn();
  let emit: (position: { coords: { latitude: number; longitude: number } }) => void = () => {};
  (Location.watchPositionAsync as jest.Mock).mockImplementation((_options, callback) => {
    emit = callback;
    return Promise.resolve({ remove });
  });

  const { result, unmount } = await renderHook(() => useCurrentLocation());

  await waitFor(() => expect(result.current.status).toBe('granted'));

  emit({ coords: { latitude: 4.71, longitude: -74.07 } });

  await waitFor(() => expect(result.current.coords).toEqual({ latitude: 4.71, longitude: -74.07 }));

  await unmount();
  await waitFor(() => expect(remove).toHaveBeenCalled());
});
