import { DeliveredOrder } from '../types';
import { summarizeEarnings, weekStart } from './summarizeEarnings';

// Wednesday, local time.
const NOW = new Date(2026, 8, 30, 15, 0, 0);

const order = (id: string, totalAmount: string, updatedAt: Date): DeliveredOrder => ({
  id,
  status: 'DELIVERED',
  totalAmount,
  currency: 'COP',
  createdAt: updatedAt.toISOString(),
  updatedAt: updatedAt.toISOString(),
});

test('splits the window in 7 local days ending today, oldest first', () => {
  const { week } = summarizeEarnings([], NOW);

  expect(week.days).toHaveLength(7);
  expect(week.days[0].date).toBe('2026-09-24');
  expect(week.days[6].date).toBe('2026-09-30');
  expect(week.days.map((d) => d.label).join('')).toBe('JVSDLMX');
});

test('sums today and keeps its entries newest first', () => {
  const summary = summarizeEarnings(
    [
      order('o-1', '17500.00', new Date(2026, 8, 30, 9, 0)),
      order('o-2', '16000.50', new Date(2026, 8, 30, 13, 30)),
    ],
    NOW
  );

  expect(summary.today.total).toBe(33500.5);
  expect(summary.today.count).toBe(2);
  expect(summary.today.entries.map((e) => e.orderId)).toEqual(['o-2', 'o-1']);
});

test('puts earlier days in the week but not in today', () => {
  const summary = summarizeEarnings(
    [
      order('today', '10000', new Date(2026, 8, 30, 8, 0)),
      order('yesterday', '5000', new Date(2026, 8, 29, 23, 59)),
      order('oldest-in-window', '2500', new Date(2026, 8, 24, 0, 0)),
    ],
    NOW
  );

  expect(summary.today.total).toBe(10000);
  expect(summary.week.total).toBe(17500);
  expect(summary.week.count).toBe(3);
  expect(summary.week.days[5].total).toBe(5000);
  expect(summary.week.days[0].total).toBe(2500);
});

test('ignores orders outside the 7-day window', () => {
  const summary = summarizeEarnings(
    [order('too-old', '9999', new Date(2026, 8, 23, 23, 59)), order('future', '1', new Date(2026, 9, 1, 0, 0))],
    NOW
  );

  expect(summary.week.total).toBe(0);
  expect(summary.week.count).toBe(0);
});

test('treats an unparsable amount as zero', () => {
  const summary = summarizeEarnings([order('bad', 'abc', new Date(2026, 8, 30, 8, 0))], NOW);

  expect(summary.today.total).toBe(0);
  expect(summary.today.count).toBe(1);
});

test('weekStart is local midnight six days before today', () => {
  const start = weekStart(NOW);

  expect(start.getFullYear()).toBe(2026);
  expect(start.getMonth()).toBe(8);
  expect(start.getDate()).toBe(24);
  expect(start.getHours()).toBe(0);
});
