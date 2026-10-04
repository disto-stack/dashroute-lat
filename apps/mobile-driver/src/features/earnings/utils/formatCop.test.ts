import { formatCop } from './formatCop';

test('formats with a dot as thousands separator', () => {
  expect(formatCop(84500)).toBe('$ 84.500');
  expect(formatCop(1250000)).toBe('$ 1.250.000');
});

test('does not add separators below one thousand', () => {
  expect(formatCop(0)).toBe('$ 0');
  expect(formatCop(999)).toBe('$ 999');
});

test('rounds decimals', () => {
  expect(formatCop(17500.6)).toBe('$ 17.501');
});

test('handles negative and non-finite values', () => {
  expect(formatCop(-2500)).toBe('-$ 2.500');
  expect(formatCop(NaN)).toBe('$ 0');
});
