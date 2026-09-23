import { render, screen, userEvent } from '@testing-library/react-native';
import { composeStories } from '@storybook/react';
import * as stories from './Input.stories.native';

const { Default } = composeStories(stories);

test('calls onChange as the user types', async () => {
  const onChange = jest.fn();
  await render(<Default onChange={onChange} />);

  const user = userEvent.setup();
  await user.type(screen.getByPlaceholderText('nombre@dashroute.com'), 'ana@dashroute.com');

  expect(onChange).toHaveBeenCalled();
});
