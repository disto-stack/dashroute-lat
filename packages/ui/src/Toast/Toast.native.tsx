import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { tokens } from '@dashroute/ui-tokens';
import { Icon, IconName } from '../Icon';
import { ToastProps } from './Toast.types';

const TONE = {
  success: { background: tokens.colors.successTint, color: tokens.colors.success, iconColor: tokens.colors.success },
  danger: { background: tokens.colors.dangerTint, color: tokens.colors.danger, iconColor: tokens.colors.danger },
  warning: { background: tokens.colors.warningTint, color: tokens.colors.warning, iconColor: tokens.colors.warning },
  neutral: { background: tokens.colors.card, color: tokens.colors.ink, iconColor: tokens.colors.blue },
} as const;

const DEFAULT_ICON: Record<NonNullable<ToastProps['tone']>, IconName | null> = {
  success: 'check',
  danger: 'alert',
  warning: 'alert',
  neutral: null,
};

export const Toast = ({ children, tone = 'neutral', icon, actionLabel, onAction, onDismiss }: ToastProps) => {
  const resolvedIcon = icon === false ? null : icon ?? DEFAULT_ICON[tone];
  const toneStyle = TONE[tone];

  return (
    <View
      style={[styles.toast, { backgroundColor: toneStyle.background }]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      {resolvedIcon ? <Icon name={resolvedIcon} size={20} strokeWidth={2.2} color={toneStyle.iconColor} /> : null}
      <Text style={[styles.text, { color: toneStyle.color }]}>{children}</Text>
      {onAction ? (
        <Pressable
          style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
          onPress={(onAction as unknown as (() => void) | undefined) ?? undefined}
        >
          <Text style={[styles.action, { color: toneStyle.color }]}>{actionLabel}</Text>
        </Pressable>
      ) : null}
      {onDismiss ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cerrar"
          style={({ pressed }) => [styles.dismissButton, pressed && styles.pressed]}
          onPress={(onDismiss as unknown as (() => void) | undefined) ?? undefined}
        >
          <Icon name="close" size={16} color={toneStyle.color} />
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: tokens.radius.lg,
    shadowColor: '#1a1d21',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 30,
    elevation: 8,
  },
  text: {
    flex: 1,
    fontFamily: tokens.type.native.bodySemiBold,
    fontSize: tokens.type.textStyles.label.fontSize,
    lineHeight: 20,
  },
  actionButton: {
    flexShrink: 0,
  },
  dismissButton: {
    flexShrink: 0,
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.6,
  },
  action: {
    fontFamily: tokens.type.native.bodyBold,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
