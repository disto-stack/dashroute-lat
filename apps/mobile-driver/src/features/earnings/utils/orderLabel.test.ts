import { orderLabel } from './orderLabel';

test('uses the last six characters, uppercased', () => {
  expect(orderLabel('ord_1a2b3c4d5e6f7g8h9i0j1k2l')).toBe('#0J1K2L');
});

test('keeps short ids whole', () => {
  expect(orderLabel('ab1')).toBe('#AB1');
});
