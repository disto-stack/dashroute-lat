import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Button } from './Button';

const meta = {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'on-blue', 'secondary', 'on-blue-ghost'],
    },
    size: { control: 'select', options: ['default', 'compact'] },
  },
  args: {
    children: 'Continuar',
    variant: 'primary',
    size: 'default',
    disabled: false,
    onClick: fn(),
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Continuar' });
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

export const OnBlue: Story = {
  args: { variant: 'on-blue' },
  parameters: { backgrounds: { value: 'blue' } },
};

export const Secondary: Story = {
  args: { variant: 'secondary' },
};

export const Compact: Story = {
  args: { size: 'compact' },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Continuar' });
    await expect(button).toBeDisabled();
    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};
