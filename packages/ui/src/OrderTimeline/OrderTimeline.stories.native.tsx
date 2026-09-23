import type { Meta, StoryObj } from '@storybook/react-native';
import { OrderTimeline } from './OrderTimeline';

const meta = {
  title: 'Components/OrderTimeline',
  component: OrderTimeline,
  args: {
    status: 'ASSIGNED',
    times: { received: '10:32', assigned: '10:34' },
  },
} satisfies Meta<typeof OrderTimeline>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Assigned: Story = {};

export const Delivered: Story = {
  args: {
    status: 'DELIVERED',
    times: { received: '10:32', assigned: '10:34', picked: '10:41', delivered: '10:58' },
  },
};

export const Cancelled: Story = {
  args: { status: 'CANCELLED', note: 'El cliente canceló el pedido' },
};
