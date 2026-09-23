import { render, screen, userEvent } from '@testing-library/react-native';
import { composeStories } from '@storybook/react';
import * as stories from './ProfileMenu.stories.native';

const { WithLogout } = composeStories(stories);

test('pressing a menu item calls its onClick', async () => {
  const onClick = jest.fn();
  await render(<WithLogout items={[{ icon: 'logout', label: 'Cerrar sesión', tone: 'danger', onClick }]} />);

  const user = userEvent.setup();
  await user.press(screen.getByText('Cerrar sesión'));

  expect(onClick).toHaveBeenCalledTimes(1);
});
