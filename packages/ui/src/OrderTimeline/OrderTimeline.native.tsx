import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { tokens } from '@dashroute/ui-tokens';
import { Icon } from '../Icon';
import { OrderTimelineProps } from './OrderTimeline.types';
import { TL_STEPS, TL_INDEX } from './OrderTimeline.steps';

export const OrderTimeline = ({ status, times = {}, note }: OrderTimelineProps) => {
  if (status === 'CANCELLED') {
    return (
      <View style={styles.cancel} accessibilityRole="text">
        <View style={styles.cancelIcon}>
          <Icon name="close" size={18} strokeWidth={2.4} color={tokens.colors.onBlue} />
        </View>
        <View>
          <Text style={[styles.label, styles.cancelLabel]}>Pedido cancelado</Text>
          {note ? <Text style={[styles.sub, styles.cancelSub]}>{note}</Text> : null}
        </View>
      </View>
    );
  }

  const idx = TL_INDEX[status] ?? 0;
  const delivered = status === 'DELIVERED';

  return (
    <View accessibilityLabel="Estado del pedido">
      {TL_STEPS.map((step, i) => {
        const state = i < idx || (delivered && i === idx) ? 'done' : i === idx ? 'current' : 'todo';
        const sub = state === 'current' ? step.doing : times[step.key];
        const isLast = i === TL_STEPS.length - 1;
        return (
          <View key={step.key} style={styles.item}>
            <View style={styles.rail}>
              <View style={[styles.mark, state === 'done' && styles.markDone, state === 'current' && styles.markCurrent]}>
                {state === 'done' ? (
                  <Icon name="check" size={14} strokeWidth={3} color={tokens.colors.onBlue} />
                ) : state === 'current' ? (
                  <View style={styles.dot} />
                ) : null}
              </View>
              {!isLast ? <View style={[styles.line, state === 'done' && styles.lineDone]} /> : null}
            </View>
            <View style={[styles.text, isLast && styles.textLast]}>
              <Text style={[styles.label, state === 'todo' && styles.labelTodo]}>{step.label}</Text>
              {sub ? <Text style={[styles.sub, state === 'current' && styles.subCurrent]}>{sub}</Text> : null}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    columnGap: 14,
  },
  rail: {
    width: 28,
    alignItems: 'center',
  },
  mark: {
    width: 24,
    height: 24,
    borderRadius: tokens.radius.panel,
    borderWidth: 2,
    borderColor: tokens.colors.borderStrong,
    backgroundColor: tokens.colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markDone: {
    backgroundColor: tokens.colors.blue,
    borderColor: tokens.colors.blue,
  },
  markCurrent: {
    borderWidth: 3,
    borderColor: tokens.colors.blue,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: tokens.colors.blue,
  },
  line: {
    flex: 1,
    width: 2,
    minHeight: 20,
    marginVertical: tokens.spacing.space1,
    backgroundColor: tokens.colors.line,
  },
  lineDone: {
    backgroundColor: tokens.colors.blue,
  },
  text: {
    paddingBottom: 18,
  },
  textLast: {
    paddingBottom: 0,
  },
  label: {
    fontFamily: tokens.type.native.bodyBold,
    fontSize: 16,
    color: tokens.colors.ink,
  },
  labelTodo: {
    fontFamily: tokens.type.native.bodySemiBold,
    color: tokens.colors.muted,
  },
  sub: {
    marginTop: 2,
    fontFamily: tokens.type.native.bodyRegular,
    fontSize: 14,
    color: tokens.colors.muted,
  },
  subCurrent: {
    color: tokens.colors.ink,
  },
  cancel: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: tokens.spacing.space3,
    padding: 14,
    borderRadius: tokens.radius.lg,
    backgroundColor: tokens.colors.dangerTint,
  },
  cancelIcon: {
    width: 28,
    height: 28,
    borderRadius: tokens.radius.sm,
    backgroundColor: tokens.colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelLabel: {
    color: tokens.colors.danger,
  },
  cancelSub: {
    color: tokens.colors.ink,
  },
});
