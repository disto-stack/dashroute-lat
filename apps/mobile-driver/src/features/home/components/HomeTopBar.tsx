import { StyleSheet, View } from 'react-native';
import { tokens } from '@dashroute/ui-tokens';
import { EarningsPill, ProfileChip } from '@dashroute/ui';

type HomeTopBarProps = {
  name: string;
  initials: string;
  earnings: string;
  onOpenProfile: () => void;
  onOpenEarnings: () => void;
};

export function HomeTopBar({ name, initials, earnings, onOpenProfile, onOpenEarnings }: HomeTopBarProps) {
  return (
    <View style={styles.bar} pointerEvents="box-none">
      <ProfileChip name={name} initials={initials} onClick={onOpenProfile} />
      <EarningsPill amount={earnings} onClick={onOpenEarnings} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.space2,
  },
});
