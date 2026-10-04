import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { DayEarnings } from '../types';
import { WeekBars } from './WeekBars';

const day = (date: string, label: string, total: number): DayEarnings => ({ date, label, total, count: total ? 1 : 0 });

const days = [
  day('2026-09-24', 'J', 0),
  day('2026-09-25', 'V', 25000),
  day('2026-09-26', 'S', 50000),
  day('2026-09-27', 'D', 0),
  day('2026-09-28', 'L', 0),
  day('2026-09-29', 'M', 0),
  day('2026-09-30', 'X', 100000),
];

test('renders one labelled bar per day', async () => {
  await render(<WeekBars days={days} />);

  expect(screen.getAllByTestId('week-bar')).toHaveLength(7);
  expect(screen.getByText('J')).toBeOnTheScreen();
  expect(screen.getByLabelText('X: $ 100.000')).toBeOnTheScreen();
});

test('scales bar heights to the best day and keeps a minimum for empty days', async () => {
  await render(<WeekBars days={days} />);

  const heights = screen.getAllByTestId('week-bar').map((bar) => {
    const style = Array.isArray(bar.props.style) ? Object.assign({}, ...bar.props.style.flat()) : bar.props.style;
    return style.height;
  });

  expect(heights[6]).toBe(96);
  expect(heights[2]).toBe(48);
  expect(heights[1]).toBe(24);
  expect(heights[0]).toBe(6);
});

test('does not crash when there is no income at all', async () => {
  await render(<WeekBars days={days.map((d) => ({ ...d, total: 0, count: 0 }))} />);

  expect(screen.getAllByTestId('week-bar')).toHaveLength(7);
});
