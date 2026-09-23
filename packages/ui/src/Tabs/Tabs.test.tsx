import { render, screen, userEvent } from '@testing-library/react-native';
import { composeStories } from '@storybook/react';
import * as stories from './Tabs.stories.native';

const { Today } = composeStories(stories);

test('calls onChange with the pressed option value', async () => {
  const onChange = jest.fn();
  await render(<Today onChange={onChange} />);

  const user = userEvent.setup();
  await user.press(screen.getByText('Semana'));

  expect(onChange).toHaveBeenCalledWith('week');
});
