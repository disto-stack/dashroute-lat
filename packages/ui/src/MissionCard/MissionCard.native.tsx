import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { tokens } from '@dashroute/ui-tokens';
import { StatusPill } from '../StatusPill';
import { MissionCardProps } from './MissionCard.types';

export const MissionCard = ({
  tone = 'paper',
  badge,
  order,
  actions,
  actionsRow = false,
  children,
}: MissionCardProps) => {
  const blue = tone === 'blue';
  return (
    <View style={[styles.card, blue ? styles.blue : styles.paper]}>
      {badge || order ? (
        <View style={styles.head}>
          {badge ? (
            <StatusPill tone="on-blue" dot={false} icon="box">
              {badge}
            </StatusPill>
          ) : (
            <View />
          )}
          {order ? (
            <Text style={[styles.order, tone === 'paper' && styles.orderPaper]}>{order}</Text>
          ) : null}
        </View>
      ) : null}
      {children}
      {actions ? <View style={[styles.actions, actionsRow && styles.actionsRow]}>{actions}</View> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    gap: 14,
    padding: tokens.spacing.space5,
    paddingBottom: 22,
  },
  paper: {
    borderRadius: tokens.radius.xl,
    backgroundColor: tokens.colors.card,
    shadowColor: '#1a1d21',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 30,
    elevation: 8,
  },
  blue: {
    borderRadius: tokens.radius['2xl'],
    backgroundColor: tokens.colors.blue,
    shadowColor: '#1a1d21',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 30,
    elevation: 10,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacing.space2,
  },
  order: {
    fontFamily: tokens.type.native.bodySemiBold,
    fontSize: tokens.type.textStyles.label.fontSize,
    color: tokens.colors.onBlueSoft,
  },
  orderPaper: {
    color: tokens.colors.muted,
  },
  actions: {
    gap: tokens.spacing.space2,
  },
  actionsRow: {
    flexDirection: 'row',
  },
});
