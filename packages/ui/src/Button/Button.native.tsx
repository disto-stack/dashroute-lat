import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { tokens } from '@dashroute/ui-tokens';
import { ButtonProps } from './Button.types';

export const Button = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
}: ButtonProps) => {
  const handlePress = () => {
    if (disabled) return;
    
    // Add tactile feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (onPress) {
      onPress();
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text style={[styles.text, styles[`${variant}Text`]]}>{title}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.md,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.8,
  },
  primary: {
    backgroundColor: tokens.colors.brand.primary,
  },
  secondary: {
    backgroundColor: tokens.colors.brand.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: tokens.colors.brand.primary,
  },
  text: {
    fontWeight: '600',
    fontSize: 16,
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#FFFFFF',
  },
  outlineText: {
    color: tokens.colors.brand.primary,
  },
});
