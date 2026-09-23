import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
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
  args: {
    name: 'check',
    size: 24,
    strokeWidth: 2,
    color: '#1a1d21',
  },
} satisfies Meta<typeof Icon>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Single: Story = {};

export const AllIcons: Story = {
  render: (args) => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
      {NAMES.map((name) => (
        <Icon key={name} {...args} name={name} />
      ))}
    </View>
  ),
};
