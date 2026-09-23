import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { MissionCard } from './MissionCard';
import { StopTimeline } from '../StopTimeline';
import { Button } from '../Button';

const onAccept = fn();
const onReject = fn();

const meta = {
  title: 'Components/MissionCard',
  component: MissionCard,
  argTypes: {
    tone: { control: 'select', options: ['paper', 'blue'] },
  },
  args: {
    tone: 'paper',
    order: '#4821',
  },
} satisfies Meta<typeof MissionCard>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The realistic composition: a StopTimeline as content plus Button actions — this is how MissionCard is actually used in the driver app. */
export const WithStopsAndActions: Story = {
  args: {
    badge: 'Nueva misión asignada',
    tone: 'blue',
    actionsRow: true,
    children: (
      <StopTimeline
        tone="blue"
        pickup={{ name: 'Café Andina', addr: 'Av. Providencia 1234' }}
        dropoff={{ name: 'Camila Ríos', addr: 'Los Leones 456, depto 12' }}
      />
    ),
    actions: (
      <>
        <Button variant="on-blue-ghost" size="compact" onClick={onReject}>
          Rechazar
        </Button>
        <Button variant="on-blue" size="compact" onClick={onAccept}>
          Aceptar
        </Button>
      </>
    ),
  },
  parameters: { backgrounds: { value: 'blue' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Aceptar' }));
    await expect(onAccept).toHaveBeenCalledOnce();
    await expect(onReject).not.toHaveBeenCalled();
  },
};

export const Offer: Story = {
  args: {
    ...WithStopsAndActions.args,
    offer: true,
  },
  parameters: { backgrounds: { value: 'blue' } },
};

export const Empty: Story = {
  args: { tone: 'paper', order: undefined, badge: undefined },
};
