import { StyleSheet, Text, View } from 'react-native';
import { tokens } from '@dashroute/ui-tokens';

export function PinLabel({ children }: { children: string }) {
  return (
    <View style={styles.wrap} pointerEvents="none">
      <View style={styles.pill}>
        <Text style={styles.text} numberOfLines={1}>
          {children}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    bottom: '100%',
    marginBottom: tokens.spacing.space1,
    alignItems: 'center',
    width: 160,
    left: -48,
  },
  pill: {
    paddingHorizontal: tokens.spacing.space3,
    paddingVertical: tokens.spacing.space1,
    borderRadius: tokens.radius.pill,
    backgroundColor: tokens.colors.ink,
  },
  text: {
    fontFamily: tokens.type.native.bodySemiBold,
    fontSize: tokens.type.textStyles.caption.fontSize,
    color: tokens.colors.card,
  },
});
