import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { tokens } from '@dashroute/ui-tokens';
import { EarningsPillProps } from './EarningsPill.types';

export const EarningsPill = ({ label = 'Hoy', amount, onClick }: EarningsPillProps) => {
  return (
    <Pressable
      style={styles.pill}
      accessibilityRole="button"
      accessibilityLabel="Ver resumen de ganancias"
      onPress={(onClick as unknown as (() => void) | undefined) ?? undefined}
    >
      <Text style={styles.micro}>{label}</Text>
      <Text style={styles.amount}>{amount}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pill: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    height: tokens.size.pillHeight,
    paddingHorizontal: tokens.spacing.space4,
    borderRadius: tokens.radius.xl,
    backgroundColor: tokens.colors.card,
  },
  micro: {
    fontFamily: tokens.type.native.bodySemiBold,
    fontSize: tokens.type.textStyles.micro.fontSize,
    color: tokens.colors.muted,
  },
  amount: {
    fontFamily: tokens.type.native.displayExtraBold,
    fontSize: tokens.type.textStyles.displayPill.fontSize,
    letterSpacing: tokens.type.textStyles.displayPill.fontSize * -0.01,
    color: tokens.colors.ink,
  },
});
