import type { Meta, StoryObj } from '@storybook/react-vite';
import { EarningsPill } from './EarningsPill';

const meta = {
  title: 'Components/EarningsPill',
  component: EarningsPill,
  args: {
    amount: '$ 84.500',
  },
} satisfies Meta<typeof EarningsPill>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithLabel: Story = {
  args: { label: 'Hoy', amount: '$ 12.300' },
};
