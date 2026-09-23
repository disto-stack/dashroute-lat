import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Input } from './Input';

const meta = {
  title: 'Components/Input',
  component: Input,
  argTypes: {
    size: { control: 'select', options: ['default', 'compact'] },
    type: { control: 'select', options: ['text', 'email', 'password'] },
  },
  args: {
    label: 'Correo electrónico',
    placeholder: 'nombre@dashroute.com',
    type: 'email',
    size: 'default',
    onChange: fn(),
  },
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Correo electrónico');
    await userEvent.type(input, 'ana@dashroute.com');
    await expect(args.onChange).toHaveBeenCalled();
    await expect(input).toHaveValue('ana@dashroute.com');
  },
};

export const Compact: Story = {
  args: { size: 'compact' },
};

export const Password: Story = {
  args: { label: 'Contraseña', type: 'password', placeholder: '••••••••' },
};

export const WithValue: Story = {
  args: { defaultValue: 'camila.rios@dashroute.com' },
};

export const WithError: Story = {
  args: { value: 'no-es-un-correo', error: 'Este correo no es válido.' },
};
