import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Sidebar } from './Sidebar';
import { SidebarItem } from './Sidebar.types';

const ITEMS: SidebarItem[] = [
  { id: 'orders', label: 'Pedidos', icon: 'box', badge: 5 },
  { id: 'map', label: 'Mapa', icon: 'pin' },
  { id: 'drivers', label: 'Repartidores', icon: 'user' },
  { id: 'settings', label: 'Ajustes', icon: 'sliders' },
];

const meta = {
  title: 'Components/Sidebar',
  component: Sidebar,
  args: {
    items: ITEMS,
    current: 'orders',
    brand: 'DashRoute',
    onSelect: fn(),
  },
} satisfies Meta<typeof Sidebar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Expanded: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText('Mapa'));
    await expect(args.onSelect).toHaveBeenCalledWith('map');
  },
};

export const Collapsed: Story = {
  args: { collapsed: true },
};
