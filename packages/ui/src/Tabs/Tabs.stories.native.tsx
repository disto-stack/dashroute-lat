import type { Meta, StoryObj } from '@storybook/react-native';
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
  },
} satisfies Meta<typeof Tabs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Today: Story = {};

export const Week: Story = {
  args: { value: 'week' },
};
