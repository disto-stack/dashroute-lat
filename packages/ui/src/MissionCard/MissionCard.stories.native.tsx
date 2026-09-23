import type { Meta, StoryObj } from '@storybook/react-native';
import { fn } from 'storybook/test';
import { MissionCard } from './MissionCard';
import { StopTimeline } from '../StopTimeline';
import { Button } from '../Button';

export const onAccept = fn();
export const onReject = fn();

const meta = {
  title: 'Components/MissionCard',
  component: MissionCard,
  args: {
    tone: 'paper',
    order: '#4821',
  },
} satisfies Meta<typeof MissionCard>;

export default meta;

type Story = StoryObj<typeof meta>;

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
};

export const Offer: Story = {
  args: {
    ...WithStopsAndActions.args,
    offer: true,
  },
};
