import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { tokens } from '@dashroute/ui-tokens';
import { Icon } from '../Icon';
import { BottomSheetProps } from './BottomSheet.types';

export const BottomSheet = ({ title, onClose, children }: BottomSheetProps) => {
  return (
    <View style={styles.sheet} accessibilityRole="none" accessibilityLabel={title}>
      <View style={styles.handle} />
      <View style={styles.head}>
        <Text style={styles.title}>{title}</Text>
        <Pressable
          style={styles.close}
          accessibilityRole="button"
          accessibilityLabel="Cerrar"
          onPress={(onClose as unknown as (() => void) | undefined) ?? undefined}
        >
          <Icon name="close" size={20} color={tokens.colors.ink} />
        </Pressable>
      </View>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  sheet: {
    gap: tokens.spacing.space4,
    paddingHorizontal: tokens.spacing.space5,
    paddingTop: tokens.spacing.space3,
    paddingBottom: 28,
    borderTopLeftRadius: tokens.radius['2xl'],
    borderTopRightRadius: tokens.radius['2xl'],
    backgroundColor: tokens.colors.card,
    shadowColor: '#1a1d21',
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.2,
    shadowRadius: 40,
    elevation: 12,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: tokens.colors.handle,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: tokens.type.native.displayExtraBold,
    fontSize: tokens.type.textStyles.displayPlace.fontSize,
    letterSpacing: tokens.type.textStyles.displayPlace.fontSize * -0.02,
    color: tokens.colors.ink,
  },
  close: {
    width: tokens.size.target,
    height: tokens.size.target,
    borderRadius: 22,
    backgroundColor: tokens.colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
