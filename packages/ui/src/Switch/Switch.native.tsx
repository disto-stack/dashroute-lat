import React from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { tokens } from '@dashroute/ui-tokens';
import { SwitchProps } from './Switch.types';

export const Switch = ({ checked = false, label, disabled = false, onClick }: SwitchProps) => {
  return (
    <Pressable
      style={[styles.switch, checked && styles.on, disabled && styles.disabled]}
      accessibilityRole="switch"
      accessibilityState={{ checked, disabled }}
      accessibilityLabel={label}
      disabled={disabled}
      onPress={(onClick as unknown as (() => void) | undefined) ?? undefined}
    >
      <View style={[styles.thumb, checked && styles.thumbOn]} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  switch: {
    width: 51,
    height: 31,
    padding: 2,
    borderRadius: tokens.radius.pill,
    backgroundColor: tokens.colors.wash,
    justifyContent: 'center',
  },
  on: {
    backgroundColor: tokens.colors.success,
  },
  disabled: {
    opacity: 0.5,
  },
  thumb: {
    width: 27,
    height: 27,
    borderRadius: tokens.radius.pill,
    backgroundColor: tokens.colors.card,
    shadowColor: '#1a1d21',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 2,
  },
  thumbOn: {
    transform: [{ translateX: 20 }],
  },
});
