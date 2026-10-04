import { firstName, initials } from './initials';

test('uses the first letter of the first and last words', () => {
  expect(initials('Andrés Martínez')).toBe('AM');
  expect(initials('Camila Ríos Pérez')).toBe('CP');
});

test('uses a single letter for a one-word name', () => {
  expect(initials('Andrés')).toBe('A');
});

test('ignores extra whitespace and uppercases', () => {
  expect(initials('  juan   ocampo ')).toBe('JO');
});

test('falls back to ? for an empty name', () => {
  expect(initials('   ')).toBe('?');
});

test('firstName returns the first word', () => {
  expect(firstName('Andrés Martínez')).toBe('Andrés');
  expect(firstName('  Camila  ')).toBe('Camila');
  expect(firstName('')).toBe('');
});
