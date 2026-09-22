import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { tokens } from '@dashroute/ui-tokens';
import { StopTimelineProps } from './StopTimeline.types';

const TONE = {
  blue: { rail: tokens.colors.onBlue, label: tokens.colors.onBlueSoft, addr: tokens.colors.onBlueSoft, name: tokens.colors.onBlue },
  paper: { rail: tokens.colors.blue, label: tokens.colors.muted, addr: tokens.colors.muted, name: tokens.colors.ink },
} as const;

export const StopTimeline = ({ pickup, dropoff, tone = 'blue' }: StopTimelineProps) => {
  const c = TONE[tone];
  const stops = [
    { label: 'Recoger en', s: pickup },
    { label: 'Entregar en', s: dropoff },
  ];
  return (
    <View style={styles.stops}>
      <View style={styles.rail}>
        <View style={[styles.from, { borderColor: c.rail }]} />
        <View style={[styles.line, { backgroundColor: c.rail }]} />
        <View style={[styles.to, { backgroundColor: c.rail }]} />
      </View>
      <View style={styles.list}>
        {stops.map((stop, i) => (
          <View key={i}>
            <Text style={[styles.label, { color: c.label }]}>{stop.label}</Text>
            <Text style={[styles.name, { color: c.name }]}>{stop.s.name}</Text>
            <Text style={[styles.addr, { color: c.addr }]}>{stop.s.addr}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  stops: {
    flexDirection: 'row',
    gap: 14,
  },
  rail: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  from: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 3,
  },
  line: {
    flexGrow: 1,
    width: 2,
    marginVertical: 3,
    opacity: 0.55,
  },
  to: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  list: {
    flex: 1,
    gap: 14,
  },
  label: {
    fontWeight: '600',
    fontSize: 13,
  },
  name: {
    fontWeight: '800',
    fontSize: 28,
    letterSpacing: -0.56,
  },
  addr: {
    fontWeight: '400',
    fontSize: 15,
  },
});
