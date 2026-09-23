import type { Meta, StoryObj } from '@storybook/react-native';
import { StopTimeline } from './StopTimeline';

const meta = {
  title: 'Components/StopTimeline',
  component: StopTimeline,
  args: {
    pickup: { name: 'Café Andina', addr: 'Av. Providencia 1234' },
    dropoff: { name: 'Camila Ríos', addr: 'Los Leones 456, depto 12' },
    tone: 'paper',
  },
} satisfies Meta<typeof StopTimeline>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Paper: Story = {};

export const OnBlue: Story = {
  args: { tone: 'blue' },
};
