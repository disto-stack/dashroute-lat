import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { EarningsRow } from './EarningsRow';

const meta = {
  title: 'Components/EarningsRow',
  component: EarningsRow,
  args: {
    from: 'Sucursal Suba',
    to: 'Hub Norte',
    order: '01F3B2',
    amount: '$ 17.500',
  },
} satisfies Meta<typeof EarningsRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const List: Story = {
  render: () => (
    <View style={{ width: 320 }}>
      <EarningsRow from="Sucursal Suba" to="Hub Norte" order="01F3B2" amount="$ 17.500" />
      <EarningsRow from="Sucursal Usaquén" to="Hub Norte" order="01590C" amount="$ 16.000" />
      <EarningsRow from="Sucursal Kennedy" to="Hub Norte" order="01D577" amount="$ 18.000" last />
    </View>
  ),
};
