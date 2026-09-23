import { render, screen, userEvent } from '@testing-library/react-native';
import { composeStories } from '@storybook/react';
import * as stories from './Input.stories.native';

const { Default, Password } = composeStories(stories);

test('calls onChange as the user types', async () => {
  const onChange = jest.fn();
  await render(<Default onChange={onChange} />);

  const user = userEvent.setup();
  await user.type(screen.getByPlaceholderText('nombre@dashroute.com'), 'ana@dashroute.com');

  expect(onChange).toHaveBeenCalled();
});

test('shows the visibility toggle only once text is entered', async () => {
  await render(<Password />);

  const user = userEvent.setup();
  const input = screen.getByPlaceholderText('••••••••');
  expect(input.props.secureTextEntry).toBe(true);
  expect(screen.queryByLabelText('Mostrar contraseña')).toBeNull();

  await user.type(input, 'secreto123');
  expect(screen.getByLabelText('Mostrar contraseña')).toBeTruthy();

  await user.press(screen.getByLabelText('Mostrar contraseña'));
  expect(input.props.secureTextEntry).toBe(false);

  await user.press(screen.getByLabelText('Ocultar contraseña'));
  expect(input.props.secureTextEntry).toBe(true);
});
