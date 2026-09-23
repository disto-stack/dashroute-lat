import React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { tokens } from '@dashroute/ui-tokens';
import { Icon } from '../Icon';
import { ProfileChipProps } from './ProfileChip.types';

export const ProfileChip = ({ name, initials, onClick }: ProfileChipProps) => {
  return (
    <Pressable
      style={styles.chip}
      accessibilityRole="button"
      onPress={(onClick as unknown as (() => void) | undefined) ?? undefined}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
      <Text style={styles.name}>{name}</Text>
      <Icon name="chevron" size={18} color={tokens.colors.ink} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.space2,
    height: tokens.size.pillHeight,
    paddingLeft: 6,
    paddingRight: 12,
    borderRadius: 26,
    backgroundColor: tokens.colors.card,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: tokens.colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: tokens.colors.onBlue,
    fontWeight: '700',
    fontSize: 14,
  },
  name: {
    color: tokens.colors.ink,
    fontWeight: '600',
    fontSize: 16,
  },
});
