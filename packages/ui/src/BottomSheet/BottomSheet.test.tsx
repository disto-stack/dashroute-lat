import { render, screen, userEvent } from '@testing-library/react-native';
import { composeStories } from '@storybook/react';
import * as stories from './BottomSheet.stories.native';

const { Default } = composeStories(stories);

test('calls onClose when the close button is pressed', async () => {
  const onClose = jest.fn();
  await render(<Default onClose={onClose} />);

  const user = userEvent.setup();
  await user.press(screen.getByLabelText('Cerrar'));

  expect(onClose).toHaveBeenCalledTimes(1);
});
