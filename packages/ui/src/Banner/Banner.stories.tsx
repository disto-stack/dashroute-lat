import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Banner } from './Banner';

const meta = {
  title: 'Components/Banner',
  component: Banner,
  argTypes: {
    tone: { control: 'select', options: ['danger', 'warning', 'success'] },
  },
  args: {
    tone: 'danger',
    children: 'Correo o contraseña incorrectos.',
  },
} satisfies Meta<typeof Banner>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Danger: Story = {};

export const WithRetry: Story = {
  args: {
    children: 'No pudimos conectar. Revisá tu internet.',
    onRetry: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText('Reintentar'));
    await expect(args.onRetry).toHaveBeenCalledOnce();
  },
};

export const Warning: Story = {
  args: { tone: 'warning', children: 'La ubicación está desactivada.' },
};

export const Success: Story = {
  args: { tone: 'success', icon: 'check', children: 'Cambios guardados.' },
};
