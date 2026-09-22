import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
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
  onClick,
  children,
}: ButtonProps) => {
  const compact = size === 'compact';

  const handlePress = () => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    (onClick as unknown as (() => void) | undefined)?.();
  };

  const variantStyle = styles[variantKey(variant)];
  const textStyle = styles[variantTextKey(variant)];
  const iconColor = TEXT_COLOR[variant];

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        compact ? styles.compact : styles[sizeKey(variant)],
        variantStyle,
        compact && variant === 'secondary' && styles.compactSecondary,
        (auto || compact) && styles.auto,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text style={[styles.text, compact && styles.compactText, textStyle]}>{children}</Text>
      {icon ? <Icon name={icon} size={compact ? 18 : 20} strokeWidth={2.4} color={iconColor} /> : null}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    paddingHorizontal: 24,
    borderRadius: tokens.radius.lg,
  },
  primarySize: {
    height: tokens.size.controlLg,
  },
  secondarySize: {
    height: tokens.size.control,
  },
  compact: {
    height: tokens.size.controlCompact,
    paddingHorizontal: 16,
    borderRadius: tokens.radius.xs,
    gap: 8,
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
    borderRadius: 18,
  },
  text: {
    fontWeight: '700',
    fontSize: 18,
  },
  compactText: {
    fontSize: 14,
  },
  primaryText: {
    color: tokens.colors.onBlue,
  },
  onBlueText: {
    color: tokens.colors.blue,
  },
  secondaryText: {
    color: tokens.colors.ink,
    fontSize: 17,
  },
  onBlueGhostText: {
    color: tokens.colors.onBlue,
    fontSize: 17,
  },
});
