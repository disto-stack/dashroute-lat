import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { tokens } from '@dashroute/ui-tokens';
import { DayEarnings } from '../types';
import { formatCop } from '../utils/formatCop';

const MAX_BAR_HEIGHT = 96;
const MIN_BAR_HEIGHT = 6;

type WeekBarsProps = {
  days: DayEarnings[];
};

export function WeekBars({ days }: WeekBarsProps) {
  const max = Math.max(...days.map((day) => day.total), 0);

  return (
    <View style={styles.chart}>
      {days.map((day, index) => {
        const height = max > 0 ? Math.max((day.total / max) * MAX_BAR_HEIGHT, MIN_BAR_HEIGHT) : MIN_BAR_HEIGHT;
        const isToday = index === days.length - 1;
        return (
          <View
            key={day.date}
            style={styles.column}
            accessible
            accessibilityLabel={`${day.label}: ${formatCop(day.total)}`}
          >
            <View
              testID="week-bar"
              style={[styles.bar, { height }, isToday ? styles.barToday : styles.barPast]}
            />
            <Text style={styles.label}>{day.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: tokens.spacing.space2,
    height: 124,
  },
  column: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
    height: '100%',
  },
  bar: {
    width: '100%',
    borderRadius: tokens.radius.xs,
  },
  barToday: {
    backgroundColor: tokens.colors.blue,
  },
  barPast: {
    backgroundColor: tokens.colors.blueTint,
  },
  label: {
    fontFamily: tokens.type.native.bodySemiBold,
    fontSize: tokens.type.textStyles.eyebrow.fontSize,
    color: tokens.colors.muted,
  },
});
