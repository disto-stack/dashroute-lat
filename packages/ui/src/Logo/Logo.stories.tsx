import type { Meta, StoryObj } from '@storybook/react-vite';
import { Logo } from './Logo';

const meta = {
  title: 'Components/Logo',
  component: Logo,
  argTypes: {
    variant: { control: 'select', options: ['mark', 'lockup'] },
    tone: { control: 'select', options: ['default', 'inverse'] },
  },
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
  parameters: { backgrounds: { value: 'blue' } },
};
