import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { tokens } from '@dashroute/ui-tokens';
import { Icon } from '../Icon';
import { Switch } from '../Switch';
import { ProfileMenuProps } from './ProfileMenu.types';

export const ProfileMenu = ({
  available,
  onAvailableChange,
  availableLabel = 'Activo',
  availabilityLabel = 'DISPONIBILIDAD',
  items = [],
}: ProfileMenuProps) => {
  return (
    <View style={styles.menu}>
      <View>
        <Text style={styles.eyebrow}>{availabilityLabel}</Text>
        <View style={styles.row}>
          <Text style={styles.label}>{availableLabel}</Text>
          <Switch checked={available} onClick={onAvailableChange} label={availableLabel} />
        </View>
      </View>
      {items.length ? <View style={styles.divider} /> : null}
      {items.length ? (
        <View style={styles.items}>
          {items.map((item, index) => (
            <Pressable
              key={index}
              accessibilityRole="menuitem"
              style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
              onPress={(item.onClick as unknown as (() => void) | undefined) ?? undefined}
            >
              <Icon name={item.icon} size={20} color={item.tone === 'danger' ? tokens.colors.danger : tokens.colors.ink} />
              <Text style={[styles.itemLabel, item.tone === 'danger' && styles.danger]}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  menu: {
    width: 280,
    padding: tokens.spacing.space4,
    borderRadius: tokens.radius.menu,
    backgroundColor: tokens.colors.card,
    shadowColor: '#1a1d21',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.18,
    shadowRadius: 36,
    elevation: 12,
  },
  eyebrow: {
    fontFamily: tokens.type.native.bodySemiBold,
    fontSize: tokens.type.textStyles.eyebrow.fontSize,
    letterSpacing: tokens.type.textStyles.eyebrow.fontSize * 0.12,
    textTransform: 'uppercase',
    color: tokens.colors.muted,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontFamily: tokens.type.native.bodySemiBold,
    fontSize: 16,
    color: tokens.colors.ink,
  },
  divider: {
    height: 1,
    backgroundColor: tokens.colors.line,
    marginVertical: tokens.spacing.space4,
  },
  items: {
    gap: 2,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.space3,
    height: tokens.size.target,
    paddingHorizontal: tokens.spacing.space1,
    borderRadius: tokens.radius.xs,
  },
  itemPressed: {
    backgroundColor: tokens.colors.rowHover,
  },
  itemLabel: {
    fontFamily: tokens.type.native.bodySemiBold,
    fontSize: tokens.type.textStyles.bodyStrong.fontSize,
    color: tokens.colors.ink,
  },
  danger: {
    color: tokens.colors.danger,
  },
});
