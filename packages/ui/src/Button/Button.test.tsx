import { render, screen, userEvent } from '@testing-library/react-native';
import { composeStories } from '@storybook/react';
import * as stories from './Button.stories.native';

const { Primary, Disabled } = composeStories(stories);

test('calls onClick when pressed', async () => {
  const onClick = jest.fn();
  await render(<Primary onClick={onClick} />);

  const user = userEvent.setup();
  await user.press(screen.getByText('Continuar'));

  expect(onClick).toHaveBeenCalledTimes(1);
});

test('does not call onClick when disabled', async () => {
  const onClick = jest.fn();
  await render(<Disabled onClick={onClick} />);

  const user = userEvent.setup();
  await user.press(screen.getByText('Continuar'));

  expect(onClick).not.toHaveBeenCalled();
});
