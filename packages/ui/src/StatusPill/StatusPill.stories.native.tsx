import type { Meta, StoryObj } from '@storybook/react-native';
import { StatusPill } from './StatusPill';

const meta = {
  title: 'Components/StatusPill',
  component: StatusPill,
  args: {
    tone: 'success',
    dot: true,
    children: 'Disponible',
  },
} satisfies Meta<typeof StatusPill>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Success: Story = {};

export const Neutral: Story = {
  args: { tone: 'neutral', children: 'Inactivo' },
};

export const OnBlue: Story = {
  args: { tone: 'on-blue', children: 'En ruta' },
};

export const WithIcon: Story = {
  args: { icon: 'check', dot: false },
};
