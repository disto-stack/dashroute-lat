import { DayEarnings, DeliveredOrder, EarningsEntry, EarningsSummary } from '../types';

const DAY_LABELS = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
const WEEK_DAYS = 7;

const pad = (n: number) => String(n).padStart(2, '0');
const dayKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

function parseAmount(totalAmount: string): number {
  const amount = parseFloat(totalAmount);
  return Number.isFinite(amount) ? amount : 0;
}

export function weekStart(now: Date = new Date()): Date {
  const start = startOfDay(now);
  start.setDate(start.getDate() - (WEEK_DAYS - 1));
  return start;
}

export function summarizeEarnings(orders: DeliveredOrder[], now: Date = new Date()): EarningsSummary {
  const start = weekStart(now);
  const days: DayEarnings[] = Array.from({ length: WEEK_DAYS }, (_, i) => {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    return { date: dayKey(date), label: DAY_LABELS[date.getDay()], total: 0, count: 0 };
  });
  const byDate = new Map(days.map((day) => [day.date, day]));
  const todayKey = dayKey(now);
  const entries: EarningsEntry[] = [];

  for (const order of orders) {
    const at = new Date(order.updatedAt);
    const bucket = byDate.get(dayKey(at));
    if (!bucket) continue;

    const amount = parseAmount(order.totalAmount);
    bucket.total += amount;
    bucket.count += 1;
    if (bucket.date === todayKey) entries.push({ orderId: order.id, amount, at });
  }

  entries.sort((a, b) => b.at.getTime() - a.at.getTime());
  const today = byDate.get(todayKey)!;

  return {
    today: { total: today.total, count: today.count, entries },
    week: {
      total: days.reduce((sum, day) => sum + day.total, 0),
      count: days.reduce((sum, day) => sum + day.count, 0),
      days,
    },
  };
}
