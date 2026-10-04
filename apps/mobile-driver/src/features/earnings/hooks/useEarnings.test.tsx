import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fetchDeliveredOrdersSince } from '../services/orders.service';
import { useEarnings } from './useEarnings';

jest.mock('../services/orders.service');

const fetchOrders = fetchDeliveredOrdersSince as jest.Mock;

function renderUseEarnings(courierId: string | undefined) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return renderHook(() => useEarnings(courierId), { wrapper });
}

beforeEach(() => jest.clearAllMocks());

test('summarizes the delivered orders of the current week', async () => {
  const now = new Date();
  fetchOrders.mockResolvedValue([
    {
      id: 'o-1',
      status: 'DELIVERED',
      totalAmount: '17500.00',
      currency: 'COP',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
  ]);

  const { result } = await renderUseEarnings('cur-1');

  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data?.today.total).toBe(17500);
  expect(result.current.data?.week.count).toBe(1);
  expect(fetchOrders).toHaveBeenCalledWith(expect.any(Date));
});

test('does not fetch without a courier id', async () => {
  const { result } = await renderUseEarnings(undefined);

  expect(result.current.fetchStatus).toBe('idle');
  expect(fetchOrders).not.toHaveBeenCalled();
});

test('reports an error when the request fails', async () => {
  fetchOrders.mockRejectedValue(new Error('network'));

  const { result } = await renderUseEarnings('cur-1');

  await waitFor(() => expect(result.current.isError).toBe(true));
});
