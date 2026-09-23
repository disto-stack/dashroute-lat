import type { Meta, StoryObj } from '@storybook/react-native';
import { Button } from './Button';

const meta = {
  title: 'Components/Button',
  component: Button,
  args: {
    children: 'Continuar',
    variant: 'primary',
    size: 'default',
    disabled: false,
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const OnBlue: Story = {
  args: { variant: 'on-blue' },
};

export const Secondary: Story = {
  args: { variant: 'secondary' },
};

export const Compact: Story = {
  args: { size: 'compact' },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const Loading: Story = {
  args: { loading: true },
};
