import type { Meta, StoryObj } from '@storybook/react-native';
import { Switch } from './Switch';

const meta = {
  title: 'Components/Switch',
  component: Switch,
  args: {
    checked: true,
    label: 'Activo',
  },
} satisfies Meta<typeof Switch>;

export default meta;

type Story = StoryObj<typeof meta>;

export const On: Story = {};

export const Off: Story = {
  args: { checked: false },
};

export const Disabled: Story = {
  args: { disabled: true },
};
