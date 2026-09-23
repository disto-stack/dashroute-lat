import type { Meta, StoryObj } from '@storybook/react-native';
import { Logo } from './Logo';

const meta = {
  title: 'Components/Logo',
  component: Logo,
  args: {
    variant: 'lockup',
    tone: 'default',
    size: 40,
  },
} satisfies Meta<typeof Logo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Lockup: Story = {};

export const Mark: Story = {
  args: { variant: 'mark' },
};

export const Inverse: Story = {
  args: { tone: 'inverse' },
};
