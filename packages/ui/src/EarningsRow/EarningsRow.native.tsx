import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { tokens } from '@dashroute/ui-tokens';
import { EarningsRowProps } from './EarningsRow.types';

export const EarningsRow = ({ from, to, order, amount, last = false }: EarningsRowProps) => {
  return (
    <View style={[styles.row, last && styles.noBorder]}>
      <View>
        <Text style={styles.route}>
          {from} → {to}
        </Text>
        <Text style={styles.order}>Orden {order}</Text>
      </View>
      <Text style={styles.amount}>{amount}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.line,
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  route: {
    fontWeight: '600',
    fontSize: 14,
    color: tokens.colors.ink,
  },
  order: {
    marginTop: 2,
    fontWeight: '400',
    fontSize: 13,
    color: tokens.colors.muted,
  },
  amount: {
    flexShrink: 0,
    fontWeight: '700',
    fontSize: 15,
    color: tokens.colors.ink,
  },
});
