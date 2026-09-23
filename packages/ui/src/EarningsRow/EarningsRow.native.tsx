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
    gap: tokens.spacing.space3,
    paddingVertical: tokens.spacing.space3,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.line,
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  route: {
    fontFamily: tokens.type.native.bodySemiBold,
    fontSize: tokens.type.textStyles.label.fontSize,
    color: tokens.colors.ink,
  },
  order: {
    marginTop: 2,
    fontFamily: tokens.type.native.bodyRegular,
    fontSize: 13,
    color: tokens.colors.muted,
  },
  amount: {
    flexShrink: 0,
    fontFamily: tokens.type.native.bodyBold,
    fontSize: 15,
    color: tokens.colors.ink,
  },
});
