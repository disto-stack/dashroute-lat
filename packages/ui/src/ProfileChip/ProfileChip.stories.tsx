import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProfileChip } from './ProfileChip';

const meta = {
  title: 'Components/ProfileChip',
  component: ProfileChip,
  args: {
    name: 'Camila Ríos',
    initials: 'CR',
  },
} satisfies Meta<typeof ProfileChip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
