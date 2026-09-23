import { Text } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { BottomSheet } from './BottomSheet';
import { Button } from '../Button';

const meta = {
  title: 'Components/BottomSheet',
  component: BottomSheet,
  args: {
    title: 'Detalle del pedido',
  },
} satisfies Meta<typeof BottomSheet>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: <Text>Pedido #4821 — 2 productos, retiro en Café Andina.</Text>,
  },
};

export const WithAction: Story = {
  args: {
    title: 'Confirmar entrega',
    children: <Button>Confirmar entrega</Button>,
  },
};
