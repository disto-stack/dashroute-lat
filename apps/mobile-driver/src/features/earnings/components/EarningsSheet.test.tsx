import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { EarningsSummary } from '../types';
import { EarningsSheet } from './EarningsSheet';

const summary: EarningsSummary = {
  today: {
    total: 33500,
    count: 2,
    entries: [
      { orderId: 'ord_1a2b3c4d5e6f7g8h9i0j1k2l', amount: 16000, at: new Date(2026, 8, 30, 13, 30) },
      { orderId: 'ord_zzzzzzzzzzzzzzzzzzzzaaaa', amount: 17500, at: new Date(2026, 8, 30, 9, 0) },
    ],
  },
  week: {
    total: 412000,
    count: 27,
    days: ['J', 'V', 'S', 'D', 'L', 'M', 'X'].map((label, i) => ({
      date: `2026-09-${24 + i}`,
      label,
      total: i === 6 ? 33500 : 0,
      count: 0,
    })),
  },
};

const renderSheet = (props: Partial<React.ComponentProps<typeof EarningsSheet>> = {}) =>
  render(
    <EarningsSheet
      summary={summary}
      isLoading={false}
      isError={false}
      onRetry={jest.fn()}
      onClose={jest.fn()}
      {...props}
    />
  );

test('shows today by default: total, count and the latest deliveries', async () => {
  await renderSheet();

  expect(screen.getByText('$ 33.500')).toBeOnTheScreen();
  expect(screen.getByText('2 misiones completadas')).toBeOnTheScreen();
  expect(screen.getByText('Últimas entregas')).toBeOnTheScreen();
  expect(screen.getByText('$ 16.000')).toBeOnTheScreen();
  expect(screen.getByText('Orden #0J1K2L')).toBeOnTheScreen();
  expect(screen.queryAllByTestId('week-bar')).toHaveLength(0);
});

test('switches to the week with its bars', async () => {
  await renderSheet();

  await fireEvent.press(screen.getByText('Semana'));

  expect(screen.getByText('$ 412.000')).toBeOnTheScreen();
  expect(screen.getByText('27 misiones completadas')).toBeOnTheScreen();
  expect(screen.getByText('Últimos 7 días')).toBeOnTheScreen();
  expect(screen.getAllByTestId('week-bar')).toHaveLength(7);
  expect(screen.queryByText('Últimas entregas')).toBeNull();
});

test('uses the singular for a single mission', async () => {
  await renderSheet({
    summary: { ...summary, today: { ...summary.today, count: 1, entries: summary.today.entries.slice(0, 1) } },
  });

  expect(screen.getByText('1 misión completada')).toBeOnTheScreen();
});

test('shows an empty state when there are no deliveries today', async () => {
  await renderSheet({ summary: { ...summary, today: { total: 0, count: 0, entries: [] } } });

  expect(screen.getByText('$ 0')).toBeOnTheScreen();
  expect(screen.getByText('Aún no tienes entregas hoy.')).toBeOnTheScreen();
});

test('shows a loading placeholder instead of an amount', async () => {
  await renderSheet({ summary: undefined, isLoading: true });

  expect(screen.getByText('Cargando…')).toBeOnTheScreen();
});

test('offers a retry when loading failed', async () => {
  const onRetry = jest.fn();
  await renderSheet({ summary: undefined, isError: true, onRetry });

  expect(screen.getByText('No pudimos cargar tus ganancias.')).toBeOnTheScreen();
  await fireEvent.press(screen.getByText('Reintentar'));

  expect(onRetry).toHaveBeenCalledTimes(1);
});

test('closes from the sheet close button', async () => {
  const onClose = jest.fn();
  await renderSheet({ onClose });

  await fireEvent.press(screen.getByLabelText('Cerrar'));

  expect(onClose).toHaveBeenCalledTimes(1);
});
