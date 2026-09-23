import { render, screen, userEvent } from '@testing-library/react-native';
import { composeStories } from '@storybook/react';
import * as stories from './Banner.stories.native';

const { WithRetry } = composeStories(stories);

test('calls onRetry when pressed', async () => {
  const onRetry = jest.fn();
  await render(<WithRetry onRetry={onRetry} />);

  const user = userEvent.setup();
  await user.press(screen.getByText('Reintentar'));

  expect(onRetry).toHaveBeenCalledTimes(1);
});
