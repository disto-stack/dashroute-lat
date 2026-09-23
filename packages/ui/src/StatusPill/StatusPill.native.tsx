import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { tokens } from '@dashroute/ui-tokens';
import { Icon } from '../Icon';
import { StatusPillProps } from './StatusPill.types';

const TONE = {
  success: { background: tokens.colors.successTint, color: tokens.colors.success },
  neutral: { background: tokens.colors.wash, color: tokens.colors.muted },
  'on-blue': { background: tokens.colors.onBlueWash, color: tokens.colors.onBlue },
} as const;

export const StatusPill = ({ tone = 'success', dot = true, icon, children }: StatusPillProps) => {
  const toneStyle = TONE[tone];
  return (
    <View style={[styles.pill, tone === 'on-blue' && styles.onBlue, { backgroundColor: toneStyle.background }]}>
      {dot ? <View style={[styles.dot, { backgroundColor: toneStyle.color }]} /> : null}
      {icon ? <Icon name={icon} size={16} strokeWidth={2.2} color={toneStyle.color} /> : null}
      <Text style={[styles.text, { color: toneStyle.color }]}>{children}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.space2,
    height: 32,
    paddingHorizontal: 12,
    borderRadius: tokens.radius.pill,
  },
  onBlue: {
    paddingHorizontal: 14,
    height: 34,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  text: {
    fontWeight: '700',
    fontSize: 13,
  },
});
