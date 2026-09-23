import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { tokens } from '@dashroute/ui-tokens';
import { StepperProps } from './Stepper.types';

const DEFAULT_STEPS: [string, string, string] = ['Recoger', 'Entregar', 'Listo'];

export const Stepper = ({ steps = DEFAULT_STEPS, current }: StepperProps) => {
  return (
    <View style={styles.stepper} accessibilityRole="list" accessibilityLabel="Progreso de la misión">
      {steps.map((label, i) => {
        const n = i + 1;
        const active = n === current || n < current;
        return (
          <View key={n} style={styles.step}>
            <View style={[styles.bar, active && styles.barActive]} />
            <Text style={[styles.label, n === current && styles.labelCurrent, n < current && styles.labelDone]}>
              {n} · {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  stepper: {
    flexDirection: 'row',
    gap: tokens.spacing.space2,
  },
  step: {
    flex: 1,
    gap: 6,
  },
  bar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: tokens.colors.line,
  },
  barActive: {
    backgroundColor: tokens.colors.blue,
  },
  label: {
    fontFamily: tokens.type.native.bodySemiBold,
    fontSize: tokens.type.textStyles.caption.fontSize,
    color: tokens.colors.muted,
  },
  labelDone: {
    color: tokens.colors.blue,
  },
  labelCurrent: {
    color: tokens.colors.ink,
    fontFamily: tokens.type.native.bodyBold,
  },
});
