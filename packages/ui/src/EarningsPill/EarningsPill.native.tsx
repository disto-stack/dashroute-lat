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
    paddingHorizontal: 16,
    borderRadius: 26,
    backgroundColor: tokens.colors.card,
  },
  micro: {
    fontWeight: '600',
    fontSize: 11,
    color: tokens.colors.muted,
  },
  amount: {
    fontWeight: '800',
    fontSize: 17,
    letterSpacing: -0.17,
    color: tokens.colors.ink,
  },
});
