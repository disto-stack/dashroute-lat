import type { Meta, StoryObj } from '@storybook/react-native';
import { fn } from 'storybook/test';
import { Banner } from './Banner';

const meta = {
  title: 'Components/Banner',
  component: Banner,
  args: {
    tone: 'danger',
    children: 'Correo o contraseña incorrectos.',
  },
} satisfies Meta<typeof Banner>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Danger: Story = {};

export const WithRetry: Story = {
  args: {
    children: 'No pudimos conectar. Revisá tu internet.',
    onRetry: fn(),
  },
};

export const Warning: Story = {
  args: { tone: 'warning', children: 'La ubicación está desactivada.' },
};

export const Success: Story = {
  args: { tone: 'success', icon: 'check', children: 'Cambios guardados.' },
};
