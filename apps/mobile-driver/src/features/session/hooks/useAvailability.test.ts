import { renderHook, waitFor, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAvailability } from './useAvailability';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

beforeEach(async () => {
  await AsyncStorage.clear();
});

test('is available by default once nothing has been stored', async () => {
  const { result } = await renderHook(() => useAvailability('usr-1'));

  await waitFor(() => expect(result.current.loaded).toBe(true));
  expect(result.current.available).toBe(true);
});

test('restores a stored inactive state', async () => {
  await AsyncStorage.setItem('driver.available.usr-1', 'false');

  const { result } = await renderHook(() => useAvailability('usr-1'));

  await waitFor(() => expect(result.current.loaded).toBe(true));
  expect(result.current.available).toBe(false);
});

test('persists changes per user', async () => {
  const { result } = await renderHook(() => useAvailability('usr-1'));
  await waitFor(() => expect(result.current.loaded).toBe(true));

  await act(async () => {
    result.current.setAvailable(false);
  });

  expect(result.current.available).toBe(false);
  await waitFor(async () => expect(await AsyncStorage.getItem('driver.available.usr-1')).toBe('false'));
  expect(await AsyncStorage.getItem('driver.available.usr-2')).toBeNull();
});

test('stays unloaded without a user', async () => {
  const { result } = await renderHook(() => useAvailability(undefined));

  expect(result.current.loaded).toBe(false);
});
