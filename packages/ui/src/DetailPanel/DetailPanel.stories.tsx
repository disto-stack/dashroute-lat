import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { DetailPanel } from './DetailPanel';
import { OrderTimeline } from '../OrderTimeline';
import { Button } from '../Button';

const meta = {
  title: 'Components/DetailPanel',
  component: DetailPanel,
  args: {
    title: 'Pedido #4821',
    subtitle: 'Camila Ríos · Los Leones 456',
    onClose: fn(),
  },
} satisfies Meta<typeof DetailPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Realistic composition: an OrderTimeline as content and a Button as footer action. */
export const WithTimelineAndFooter: Story = {
  args: {
    children: <OrderTimeline status="IN_TRANSIT" times={{ received: '10:32', assigned: '10:34' }} />,
    footer: <Button>Contactar cliente</Button>,
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Cerrar' }));
    await expect(args.onClose).toHaveBeenCalledOnce();
  },
};

export const Overlay: Story = {
  args: {
    ...WithTimelineAndFooter.args,
    overlay: true,
  },
};
