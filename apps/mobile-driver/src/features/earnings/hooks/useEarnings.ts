import { useQuery } from '@tanstack/react-query';
import { fetchDeliveredOrdersSince } from '../services/orders.service';
import { summarizeEarnings, weekStart } from '../utils/summarizeEarnings';

const REFRESH_MS = 5 * 60 * 1000;

export function useEarnings(courierId: string | undefined) {
  return useQuery({
    queryKey: ['earnings', courierId],
    enabled: Boolean(courierId),
    staleTime: 60_000,
    refetchInterval: REFRESH_MS,
    queryFn: async () => {
      const now = new Date();
      return summarizeEarnings(await fetchDeliveredOrdersSince(weekStart(now)), now);
    },
  });
}
