import { render, screen, userEvent } from '@testing-library/react-native';
import { composeStories } from '@storybook/react';
import * as stories from './Toast.stories.native';

const { WithAction, WithDismiss } = composeStories(stories);

test('calls onAction when the action is pressed', async () => {
  const onAction = jest.fn();
  await render(<WithAction onAction={onAction} />);

  const user = userEvent.setup();
  await user.press(screen.getByText('Deshacer'));

  expect(onAction).toHaveBeenCalledTimes(1);
});

test('calls onDismiss when the dismiss button is pressed', async () => {
  const onDismiss = jest.fn();
  await render(<WithDismiss onDismiss={onDismiss} />);

  const user = userEvent.setup();
  await user.press(screen.getByLabelText('Cerrar'));

  expect(onDismiss).toHaveBeenCalledTimes(1);
});
