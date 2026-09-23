import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { DataTable } from './DataTable';
import { OrderStatusBadge } from '../OrderStatusBadge';
import { OrderStatus } from '../types/order';

interface OrderRow extends Record<string, unknown> {
  id: string;
  order: string;
  customer: string;
  status: OrderStatus;
  total: string;
}

const ROWS: OrderRow[] = [
  { id: '1', order: '#4821', customer: 'Camila Ríos', status: 'IN_TRANSIT', total: '$ 12.300' },
  { id: '2', order: '#4820', customer: 'Diego Fuentes', status: 'DELIVERED', total: '$ 8.900' },
  { id: '3', order: '#4819', customer: 'Valentina Soto', status: 'PENDING', total: '$ 15.750' },
  { id: '4', order: '#4818', customer: 'Martín Álvarez', status: 'CANCELLED', total: '$ 6.400' },
];

const meta = {
  title: 'Components/DataTable',
  component: DataTable<OrderRow>,
  args: {
    rowKey: 'id',
    columns: [
      { key: 'order', header: 'Pedido', strong: true },
      { key: 'customer', header: 'Cliente' },
      {
        key: 'status',
        header: 'Estado',
        render: (row: OrderRow) => <OrderStatusBadge status={row.status} />,
      },
      { key: 'total', header: 'Total', align: 'right' },
    ],
    rows: ROWS,
  },
} satisfies Meta<typeof DataTable<OrderRow>>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Dense: Story = {
  args: { dense: true },
};

export const WithSelection: Story = {
  args: { selectedKey: '1', onRowClick: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText('Diego Fuentes'));
    await expect(args.onRowClick).toHaveBeenCalledWith(expect.objectContaining({ id: '2' }));
  },
};
