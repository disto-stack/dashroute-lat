import { api } from '@/lib/api';
import { fetchDeliveredOrdersSince } from './orders.service';

jest.mock('@/lib/api', () => ({ api: { get: jest.fn() } }));

const get = api.get as jest.Mock;
const since = new Date(2026, 8, 24);

const order = (id: string, createdAt: Date) => ({
  id,
  status: 'DELIVERED',
  totalAmount: '1000',
  currency: 'COP',
  createdAt: createdAt.toISOString(),
  updatedAt: createdAt.toISOString(),
});

beforeEach(() => jest.clearAllMocks());

test('requests delivered orders with the maximum page size', async () => {
  get.mockResolvedValue({ data: { data: [], nextCursor: null, hasNextPage: false } });

  await fetchDeliveredOrdersSince(since);

  expect(get).toHaveBeenCalledWith('/orders', {
    params: { status: 'DELIVERED', limit: 50, cursor: undefined },
  });
});

test('follows the cursor until a page reaches past the start of the window', async () => {
  get
    .mockResolvedValueOnce({
      data: { data: [order('a', new Date(2026, 8, 30))], nextCursor: 'c1', hasNextPage: true },
    })
    .mockResolvedValueOnce({
      data: { data: [order('b', new Date(2026, 8, 25))], nextCursor: 'c2', hasNextPage: true },
    })
    .mockResolvedValueOnce({
      data: { data: [order('c', new Date(2026, 8, 20))], nextCursor: 'c3', hasNextPage: true },
    });

  const orders = await fetchDeliveredOrdersSince(since);

  expect(orders.map((o) => o.id)).toEqual(['a', 'b', 'c']);
  expect(get).toHaveBeenCalledTimes(3);
  expect(get.mock.calls[1][1].params.cursor).toBe('c1');
  expect(get.mock.calls[2][1].params.cursor).toBe('c2');
});

test('stops when there are no more pages', async () => {
  get.mockResolvedValue({
    data: { data: [order('a', new Date(2026, 8, 30))], nextCursor: null, hasNextPage: false },
  });

  const orders = await fetchDeliveredOrdersSince(since);

  expect(orders).toHaveLength(1);
  expect(get).toHaveBeenCalledTimes(1);
});

test('is capped at five pages', async () => {
  get.mockResolvedValue({
    data: { data: [order('a', new Date(2026, 8, 30))], nextCursor: 'next', hasNextPage: true },
  });

  await fetchDeliveredOrdersSince(since);

  expect(get).toHaveBeenCalledTimes(5);
});
