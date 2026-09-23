import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Toast } from './Toast';

const meta = {
  title: 'Components/Toast',
  component: Toast,
  argTypes: {
    tone: { control: 'select', options: ['success', 'danger', 'warning', 'neutral'] },
  },
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
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText('Deshacer'));
    await expect(args.onAction).toHaveBeenCalledOnce();
  },
};

export const WithDismiss: Story = {
  args: {
    children: 'Sincronizando cambios…',
    onDismiss: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByLabelText('Cerrar'));
    await expect(args.onDismiss).toHaveBeenCalledOnce();
  },
};
