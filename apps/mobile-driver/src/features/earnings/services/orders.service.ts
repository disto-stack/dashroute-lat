import { api } from '@/lib/api';
import { DeliveredOrder, OrdersPage } from '../types';

const PAGE_SIZE = 50;
const MAX_PAGES = 5;

export async function fetchDeliveredOrdersSince(since: Date): Promise<DeliveredOrder[]> {
  const orders: DeliveredOrder[] = [];
  let cursor: string | undefined;

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const { data } = await api.get<OrdersPage>('/orders', {
      params: { status: 'DELIVERED', limit: PAGE_SIZE, cursor },
    });
    orders.push(...data.data);

    const oldest = data.data[data.data.length - 1];
    const reachedWindowStart = oldest !== undefined && new Date(oldest.createdAt) < since;
    if (!data.hasNextPage || !data.nextCursor || reachedWindowStart) break;
    cursor = data.nextCursor;
  }

  return orders;
}
