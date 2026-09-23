import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { tokens } from '@dashroute/ui-tokens';
import { TabsProps } from './Tabs.types';

export const Tabs = ({ options, value, onChange }: TabsProps) => {
  return (
    <View style={styles.tabs}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            style={[styles.item, active && styles.active]}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={onChange ? () => onChange(option.value) : undefined}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    padding: 3,
    gap: 2,
    backgroundColor: tokens.colors.wash,
    borderRadius: tokens.radius.menu,
  },
  item: {
    paddingHorizontal: tokens.spacing.space4,
    paddingVertical: 6,
    borderRadius: tokens.radius.lg,
  },
  active: {
    backgroundColor: tokens.colors.card,
    shadowColor: '#1a1d21',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 1,
  },
  label: {
    fontFamily: tokens.type.native.bodySemiBold,
    fontSize: tokens.type.textStyles.label.fontSize,
    color: tokens.colors.muted,
  },
  labelActive: {
    color: tokens.colors.ink,
  },
});
