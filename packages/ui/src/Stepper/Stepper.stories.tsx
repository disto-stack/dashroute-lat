import type { Meta, StoryObj } from '@storybook/react-vite';
import { Stepper } from './Stepper';

const meta = {
  title: 'Components/Stepper',
  component: Stepper,
  argTypes: {
    current: { control: 'select', options: [1, 2, 3] },
  },
  args: {
    current: 1,
  },
} satisfies Meta<typeof Stepper>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Pickup: Story = {};

export const Dropoff: Story = {
  args: { current: 2 },
};

export const Done: Story = {
  args: { current: 3 },
};

export const CustomLabels: Story = {
  args: { current: 2, steps: ['Aceptar', 'Camino', 'Entregado'] },
};
