import { render, screen, userEvent } from '@testing-library/react-native';
import { composeStories } from '@storybook/react';
import * as stories from './Switch.stories.native';

const { On, Disabled } = composeStories(stories);

test('calls onClick when pressed', async () => {
  const onClick = jest.fn();
  await render(<On onClick={onClick} />);

  const user = userEvent.setup();
  await user.press(screen.getByLabelText('Activo'));

  expect(onClick).toHaveBeenCalledTimes(1);
});

test('does not call onClick when disabled', async () => {
  const onClick = jest.fn();
  await render(<Disabled onClick={onClick} />);

  const user = userEvent.setup();
  await user.press(screen.getByLabelText('Activo'));

  expect(onClick).not.toHaveBeenCalled();
});
