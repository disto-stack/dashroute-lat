import { render, screen, userEvent } from '@testing-library/react-native';
import { composeStories } from '@storybook/react';
import * as stories from './MissionCard.stories.native';

const { WithStopsAndActions } = composeStories(stories);

beforeEach(() => {
  stories.onAccept.mockClear();
  stories.onReject.mockClear();
});

test('pressing Aceptar calls onAccept and not onReject', async () => {
  await render(<WithStopsAndActions />);

  const user = userEvent.setup();
  await user.press(screen.getByText('Aceptar'));

  expect(stories.onAccept).toHaveBeenCalledTimes(1);
  expect(stories.onReject).not.toHaveBeenCalled();
});
