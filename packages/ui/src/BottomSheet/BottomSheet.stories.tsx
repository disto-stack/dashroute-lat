import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { BottomSheet } from './BottomSheet';
import { Button } from '../Button';

const meta = {
  title: 'Components/BottomSheet',
  component: BottomSheet,
  args: {
    title: 'Detalle del pedido',
    onClose: fn(),
  },
} satisfies Meta<typeof BottomSheet>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: <p>Pedido #4821 — 2 productos, retiro en Café Andina.</p>,
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Cerrar' }));
    await expect(args.onClose).toHaveBeenCalledOnce();
  },
};

export const WithAction: Story = {
  args: {
    title: 'Confirmar entrega',
    children: (
      <>
        <p>¿Confirmás que entregaste el pedido en la dirección indicada?</p>
        <Button>Confirmar entrega</Button>
      </>
    ),
  },
};
