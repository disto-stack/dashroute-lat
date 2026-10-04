import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { tokens } from '@dashroute/ui-tokens';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useDriverSession } from '@/features/session/hooks/useDriverSession';
import { useEarnings } from '@/features/earnings/hooks/useEarnings';
import { HomeScreen } from './HomeScreen';

jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);
jest.mock('@/features/auth/hooks/useAuth', () => ({ useAuth: jest.fn() }));
jest.mock('@/features/session/hooks/useDriverSession', () => ({ useDriverSession: jest.fn() }));
jest.mock('@/features/earnings/hooks/useEarnings', () => ({ useEarnings: jest.fn() }));
const mockDriverMap = jest.fn((_props: { mode?: string; bottomInset?: number }) => null);
jest.mock('@/features/geolocation/components/DriverMap', () => ({
  DriverMap: (props: { mode?: string; bottomInset?: number }) => mockDriverMap(props),
}));

const logout = jest.fn();
const setAvailable = jest.fn();
const refetch = jest.fn();

const summary = {
  today: { total: 84500, count: 5, entries: [] },
  week: { total: 412000, count: 27, days: [] },
};

function setup({
  session = {},
  earnings = { data: summary, isLoading: false, isError: false },
  user = { id: 'usr-1', fullName: 'Andrés Martínez', courierProfile: { id: 'cur-1', isVerified: true } },
}: { session?: object; earnings?: object; user?: object } = {}) {
  (useAuth as jest.Mock).mockReturnValue({ user, logout });
  (useDriverSession as jest.Mock).mockReturnValue({
    coords: null,
    locationStatus: 'granted',
    available: true,
    canGoOnline: true,
    setAvailable,
    ...session,
  });
  (useEarnings as jest.Mock).mockReturnValue({ refetch, ...earnings });
}

beforeEach(() => jest.clearAllMocks());

test('greets the courier with their real name and today\'s earnings', async () => {
  setup();
  await render(<HomeScreen />);

  expect(screen.getByText('Hola, Andrés')).toBeOnTheScreen();
  expect(screen.getByText('AM')).toBeOnTheScreen();
  expect(screen.getByText('$ 84.500')).toBeOnTheScreen();
  expect(screen.getByText('Buscando nuevas rutas…')).toBeOnTheScreen();
  expect(useEarnings).toHaveBeenCalledWith('cur-1');
});

test('shows a dash while earnings are not available', async () => {
  setup({ earnings: { data: undefined, isLoading: true, isError: false } });
  await render(<HomeScreen />);

  expect(screen.getByText('—')).toBeOnTheScreen();
});

test('the profile menu switches availability off', async () => {
  setup();
  await render(<HomeScreen />);

  await fireEvent.press(screen.getByText('Andrés'));
  expect(screen.getByText('DISPONIBILIDAD')).toBeOnTheScreen();
  await fireEvent.press(screen.getByRole('switch'));

  expect(setAvailable).toHaveBeenCalledWith(false);
});

test('the profile menu logs out', async () => {
  setup();
  await render(<HomeScreen />);

  await fireEvent.press(screen.getByText('Andrés'));
  await fireEvent.press(screen.getByText('Cerrar sesión'));

  expect(logout).toHaveBeenCalledTimes(1);
});

test('tapping outside closes the profile menu', async () => {
  setup();
  await render(<HomeScreen />);

  await fireEvent.press(screen.getByText('Andrés'));
  await fireEvent.press(screen.getByLabelText('Cerrar menú'));

  expect(screen.queryByText('DISPONIBILIDAD')).toBeNull();
});

test('an unverified courier cannot switch on from the menu and sees a warning', async () => {
  setup({
    session: { available: false, canGoOnline: false },
    user: { id: 'usr-1', fullName: 'Andrés Martínez', courierProfile: { id: 'cur-1', isVerified: false } },
  });
  await render(<HomeScreen />);

  expect(screen.getByText(/Tu cuenta aún no está verificada/)).toBeOnTheScreen();
  await fireEvent.press(screen.getByText('Andrés'));
  await fireEvent.press(screen.getByRole('switch'));

  expect(setAvailable).not.toHaveBeenCalled();
});

test('warns when the location permission was denied', async () => {
  setup({ session: { locationStatus: 'denied' } });
  await render(<HomeScreen />);

  expect(screen.getByText('Activa el permiso de ubicación para recibir misiones.')).toBeOnTheScreen();
});

test('the earnings pill opens the earnings sheet and it can be closed', async () => {
  setup();
  await render(<HomeScreen />);

  await fireEvent.press(screen.getByLabelText('Ver resumen de ganancias'));
  expect(screen.getByText('Ganancias')).toBeOnTheScreen();
  expect(screen.getByText('5 misiones completadas')).toBeOnTheScreen();

  await fireEvent.press(screen.getByLabelText('Cerrar'));
  expect(screen.queryByText('Ganancias')).toBeNull();
});

test('retrying a failed earnings load refetches', async () => {
  setup({ earnings: { data: undefined, isLoading: false, isError: true } });
  await render(<HomeScreen />);

  await fireEvent.press(screen.getByLabelText('Ver resumen de ganancias'));
  await fireEvent.press(screen.getByText('Reintentar'));

  expect(refetch).toHaveBeenCalledTimes(1);
});

test('the map puck searches while available and goes inactive otherwise', async () => {
  setup();
  const { unmount } = await render(<HomeScreen />);
  expect(mockDriverMap.mock.calls.at(-1)?.[0].mode).toBe('searching');
  await unmount();

  setup({ session: { available: false } });
  await render(<HomeScreen />);
  expect(mockDriverMap.mock.calls.at(-1)?.[0].mode).toBe('inactive');
});

test('keeps the map controls above the status card, whatever its height', async () => {
  setup();
  await render(<HomeScreen />);

  await fireEvent(screen.getByTestId('home-status-card'), 'layout', {
    nativeEvent: { layout: { x: 0, y: 0, width: 360, height: 180 } },
  });

  // card height + the gap the card keeps from the bottom edge (no insets in the mock).
  expect(mockDriverMap.mock.calls.at(-1)?.[0].bottomInset).toBe(180 + tokens.spacing.space4);

  await fireEvent(screen.getByTestId('home-status-card'), 'layout', {
    nativeEvent: { layout: { x: 0, y: 0, width: 360, height: 220 } },
  });

  expect(mockDriverMap.mock.calls.at(-1)?.[0].bottomInset).toBe(220 + tokens.spacing.space4);
});
