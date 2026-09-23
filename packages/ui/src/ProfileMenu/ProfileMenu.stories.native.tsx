import type { Meta, StoryObj } from '@storybook/react-native';
import { fn } from 'storybook/test';
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
};
