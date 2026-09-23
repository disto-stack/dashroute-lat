import type { Meta, StoryObj } from '@storybook/react-vite';
import { OrderStatusBadge } from './OrderStatusBadge';
import { OrderStatus } from '../types/order';

const STATUSES: OrderStatus[] = ['PENDING', 'ASSIGNED', 'ACCEPTED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'];

const meta = {
  title: 'Components/OrderStatusBadge',
  component: OrderStatusBadge,
  argTypes: {
    status: { control: 'select', options: STATUSES },
  },
  args: {
    status: 'IN_TRANSIT',
  },
} satisfies Meta<typeof OrderStatusBadge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Single: Story = {};

export const AllStatuses: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {STATUSES.map((status) => (
        <OrderStatusBadge key={status} status={status} />
      ))}
    </div>
  ),
};
