import { processColor } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import { tokens } from '@dashroute/ui-tokens';
import { LocationPuck } from './LocationPuck';

test('shows no label in searching mode, even if one is passed', async () => {
  await render(<LocationPuck mode="searching" label="Tu ubicación" />);
  expect(screen.queryByText('Tu ubicación')).toBeNull();
});

test('shows the label only in tracking mode', async () => {
  await render(<LocationPuck mode="tracking" label="Tu ubicación" />);
  expect(screen.getByText('Tu ubicación')).toBeTruthy();
});

test('renders without a label in tracking mode when none is given', async () => {
  await render(<LocationPuck mode="tracking" />);
  expect(screen.getByTestId('location-puck')).toBeTruthy();
});

// react-native-svg turns color strings into native color values.
const dotFill = () => screen.getByTestId('puck-dot').props.fill.payload;

test('searching mode draws three pulsing rings plus the blue dot', async () => {
  await render(<LocationPuck mode="searching" />);

  expect(screen.getAllByTestId('puck-ring')).toHaveLength(3);
  expect(dotFill()).toBe(processColor(tokens.colors.blue));
});

test('inactive mode draws only a muted dot, with no rings to pulse', async () => {
  await render(<LocationPuck mode="inactive" />);

  expect(screen.queryAllByTestId('puck-ring')).toHaveLength(0);
  expect(dotFill()).toBe(processColor(tokens.colors.muted));
});

test('shows no label in inactive mode, even if one is passed', async () => {
  await render(<LocationPuck mode="inactive" label="Tu ubicación" />);

  expect(screen.queryByText('Tu ubicación')).toBeNull();
});
