import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Tabs } from './Tabs';

const OPTIONS = [
  { value: 'today', label: 'Hoy' },
  { value: 'week', label: 'Semana' },
];

const meta = {
  title: 'Components/Tabs',
  component: Tabs,
  args: {
    options: OPTIONS,
    value: 'today',
    onChange: fn(),
  },
} satisfies Meta<typeof Tabs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Today: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText('Semana'));
    await expect(args.onChange).toHaveBeenCalledWith('week');
  },
};

export const Week: Story = {
  args: { value: 'week' },
};
