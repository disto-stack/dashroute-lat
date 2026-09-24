import { render, screen } from '@testing-library/react-native';
import { DestinationPin } from './DestinationPin';

test('shows the label while the leg is active and not yet arrived', async () => {
  await render(<DestinationPin type="pickup" label="Sucursal Chapinero" />);
  expect(screen.getByText('Sucursal Chapinero')).toBeTruthy();
});

test('hides the label once arrived, even if one is passed', async () => {
  await render(<DestinationPin type="pickup" arrived label="Sucursal Chapinero" />);
  expect(screen.queryByText('Sucursal Chapinero')).toBeNull();
});

test('renders for both pickup and delivery types', async () => {
  await render(<DestinationPin type="delivery" />);
  expect(screen.getByTestId('destination-pin')).toBeTruthy();
});
