import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from './Icon';
import { IconName } from './Icon.types';

const NAMES: IconName[] = [
  'chevron',
  'pin',
  'box',
  'arrow',
  'check',
  'logout',
  'power',
  'nav',
  'close',
  'search',
  'plus',
  'list',
  'user',
  'sliders',
  'menu',
  'eye',
  'eye-off',
];

const meta = {
  title: 'Components/Icon',
  component: Icon,
  argTypes: {
    name: { control: 'select', options: NAMES },
  },
  args: {
    name: 'check',
    size: 24,
    strokeWidth: 2,
  },
} satisfies Meta<typeof Icon>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Single: Story = {};

export const AllIcons: Story = {
  render: (args) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
      {NAMES.map((name) => (
        <div key={name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <Icon {...args} name={name} />
          <span style={{ fontSize: 11, color: '#5b6270' }}>{name}</span>
        </div>
      ))}
    </div>
  ),
};
