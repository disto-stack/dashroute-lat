import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { tokens } from '@dashroute/ui-tokens';
import { Icon } from '../Icon';
import { BannerProps } from './Banner.types';

const TONE = {
  danger: { background: tokens.colors.dangerTint, color: tokens.colors.danger },
  warning: { background: tokens.colors.warningTint, color: tokens.colors.warning },
  success: { background: tokens.colors.successTint, color: tokens.colors.success },
} as const;

export const Banner = ({ children, tone = 'danger', icon = 'alert', onRetry, retryLabel = 'Reintentar' }: BannerProps) => {
  const toneStyle = TONE[tone];
  return (
    <View style={[styles.banner, { backgroundColor: toneStyle.background }]} accessibilityRole="alert">
      <Icon name={icon} size={20} strokeWidth={2.2} color={toneStyle.color} />
      <Text style={[styles.text, { color: toneStyle.color }]}>{children}</Text>
      {onRetry ? (
        <Pressable
          style={({ pressed }) => [styles.retryButton, pressed && styles.retryPressed]}
          onPress={(onRetry as unknown as (() => void) | undefined) ?? undefined}
        >
          <Text style={[styles.retry, { color: toneStyle.color }]}>{retryLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    borderRadius: tokens.radius.lg,
  },
  text: {
    flex: 1,
    fontFamily: tokens.type.native.bodySemiBold,
    fontSize: tokens.type.textStyles.label.fontSize,
    lineHeight: 20,
  },
  retryButton: {
    flexShrink: 0,
  },
  retryPressed: {
    opacity: 0.6,
  },
  retry: {
    fontFamily: tokens.type.native.bodyBold,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
