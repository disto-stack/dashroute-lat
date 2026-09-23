import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ProfileMenu } from './ProfileMenu';

const meta = {
  title: 'Components/ProfileMenu',
  component: ProfileMenu,
  args: {
    available: true,
    onAvailableChange: fn(),
  },
} satisfies Meta<typeof ProfileMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

export const AvailabilityOnly: Story = {};

export const WithLogout: Story = {
  args: {
    items: [{ icon: 'logout', label: 'Cerrar sesión', tone: 'danger', onClick: fn() }],
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText('Cerrar sesión'));
    await expect(args.items![0].onClick).toHaveBeenCalledOnce();
  },
};
