import type { Meta, StoryObj } from '@storybook/react-native';
import { fn } from 'storybook/test';
import { Toast } from './Toast';

const meta = {
  title: 'Components/Toast',
  component: Toast,
  args: {
    tone: 'neutral',
    children: 'Conexión restablecida.',
  },
} satisfies Meta<typeof Toast>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Neutral: Story = {};

export const Success: Story = {
  args: { tone: 'success', children: 'Fila actualizada.' },
};

export const Danger: Story = {
  args: { tone: 'danger', children: 'No se pudo actualizar tu ubicación en segundo plano.' },
};

export const Warning: Story = {
  args: { tone: 'warning', children: 'La conexión es inestable.' },
};

export const WithAction: Story = {
  args: {
    children: '3 pedidos reasignados.',
    actionLabel: 'Deshacer',
    onAction: fn(),
  },
};

export const WithDismiss: Story = {
  args: {
    children: 'Sincronizando cambios…',
    onDismiss: fn(),
  },
};
