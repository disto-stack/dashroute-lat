import { render, screen } from '@testing-library/react-native';
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
