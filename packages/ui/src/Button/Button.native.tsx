import React from 'react';
import { Pressable, Text, ActivityIndicator, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { tokens } from '@dashroute/ui-tokens';
import { Icon } from '../Icon';
import { ButtonProps } from './Button.types';

export const Button = ({
  variant = 'primary',
  icon,
  auto = false,
  size = 'default',
  disabled = false,
  loading = false,
  onClick,
  children,
}: ButtonProps) => {
  const compact = size === 'compact';

  const handlePress = () => {
    if (disabled || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    (onClick as unknown as (() => void) | undefined)?.();
  };

  const variantStyle = styles[variantKey(variant)];
  const textStyle = styles[variantTextKey(variant)];
  const iconColor = TEXT_COLOR[variant];

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      style={({ pressed }) => [
        styles.button,
        compact ? styles.compact : styles[sizeKey(variant)],
        variantStyle,
        compact && variant === 'secondary' && styles.compactSecondary,
        (auto || compact) && styles.auto,
        disabled && styles.disabled,
        pressed && !disabled && !loading && styles.pressed,
      ]}
    >
      <Text style={[styles.text, compact && styles.compactText, textStyle, loading && styles.textHidden]}>
        {children}
      </Text>
      {loading ? (
        <ActivityIndicator color={iconColor} style={styles.spinner} />
      ) : icon ? (
        <Icon name={icon} size={compact ? 18 : 20} strokeWidth={2.4} color={iconColor} />
      ) : null}
    </Pressable>
  );
};

function variantKey(variant: NonNullable<ButtonProps['variant']>) {
  return (
    {
      primary: 'primary',
      'on-blue': 'onBlue',
      secondary: 'secondary',
      'on-blue-ghost': 'onBlueGhost',
    } as const
  )[variant];
}

function variantTextKey(variant: NonNullable<ButtonProps['variant']>) {
  return (
    {
      primary: 'primaryText',
      'on-blue': 'onBlueText',
      secondary: 'secondaryText',
      'on-blue-ghost': 'onBlueGhostText',
    } as const
  )[variant];
}

function sizeKey(variant: NonNullable<ButtonProps['variant']>) {
  return variant === 'primary' ? 'primarySize' : 'secondarySize';
}

const TEXT_COLOR: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: tokens.colors.onBlue,
  'on-blue': tokens.colors.blue,
  secondary: tokens.colors.ink,
  'on-blue-ghost': tokens.colors.onBlue,
};

const styles = StyleSheet.create({
  button: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    paddingHorizontal: tokens.spacing.space6,
    borderRadius: tokens.radius.lg,
  },
  textHidden: {
    opacity: 0,
  },
  spinner: {
    position: 'absolute',
  },
  primarySize: {
    height: tokens.size.controlLg,
  },
  secondarySize: {
    height: tokens.size.control,
  },
  compact: {
    height: tokens.size.controlCompact,
    paddingHorizontal: tokens.spacing.space4,
    borderRadius: tokens.radius.xs,
    gap: tokens.spacing.space2,
  },
  compactSecondary: {
    height: tokens.size.controlCompact,
    backgroundColor: tokens.colors.card,
    borderWidth: 1.5,
    borderColor: tokens.colors.borderStrong,
  },
  auto: {
    width: 'auto',
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.8,
  },
  primary: {
    backgroundColor: tokens.colors.blue,
  },
  onBlue: {
    backgroundColor: tokens.colors.onBlue,
  },
  secondary: {
    backgroundColor: tokens.colors.wash,
  },
  onBlueGhost: {
    backgroundColor: tokens.colors.onBlueWash,
    borderRadius: tokens.radius.md,
  },
  text: {
    fontFamily: tokens.type.native.bodyBold,
    fontSize: tokens.type.textStyles.buttonLg.fontSize,
  },
  compactText: {
    fontSize: tokens.type.textStyles.button.fontSize,
  },
  primaryText: {
    color: tokens.colors.onBlue,
  },
  onBlueText: {
    color: tokens.colors.blue,
  },
  secondaryText: {
    color: tokens.colors.ink,
    fontSize: tokens.type.textStyles.buttonLg.fontSize,
  },
  onBlueGhostText: {
    color: tokens.colors.onBlue,
    fontSize: tokens.type.textStyles.buttonLg.fontSize,
  },
});
