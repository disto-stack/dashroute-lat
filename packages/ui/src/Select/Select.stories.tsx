import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Select } from './Select';

const meta = {
  title: 'Components/Select',
  component: Select,
  argTypes: {
    size: { control: 'select', options: ['default', 'compact'] },
  },
  args: {
    label: 'Zona de reparto',
    placeholder: 'Selecciona una zona',
    options: [
      { value: 'centro', label: 'Centro' },
      { value: 'providencia', label: 'Providencia' },
      { value: 'las-condes', label: 'Las Condes' },
    ],
    size: 'default',
    onChange: fn(),
  },
} satisfies Meta<typeof Select>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const select = canvas.getByLabelText('Zona de reparto');
    await userEvent.selectOptions(select, 'las-condes');
    await expect(args.onChange).toHaveBeenCalledOnce();
    await expect(select).toHaveValue('las-condes');
  },
};

export const Compact: Story = {
  args: { size: 'compact' },
};

export const WithValue: Story = {
  args: { defaultValue: 'providencia' },
};
