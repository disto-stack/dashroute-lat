import type { Meta, StoryObj } from '@storybook/react-native';
import { Input } from './Input';

const meta = {
  title: 'Components/Input',
  component: Input,
  args: {
    label: 'Correo electrónico',
    placeholder: 'nombre@dashroute.com',
    type: 'email',
    size: 'default',
  },
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Compact: Story = {
  args: { size: 'compact' },
};

export const Password: Story = {
  args: { label: 'Contraseña', type: 'password', placeholder: '••••••••' },
};

export const WithValue: Story = {
  args: { defaultValue: 'camila.rios@dashroute.com' },
};
