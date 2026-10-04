import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { tokens } from '@dashroute/ui-tokens';
import { Banner, BottomSheet, EarningsRow, Tabs } from '@dashroute/ui';
import { EarningsSummary } from '../types';
import { formatCop } from '../utils/formatCop';
import { orderLabel } from '../utils/orderLabel';
import { WeekBars } from './WeekBars';

type Period = 'today' | 'week';

const TAB_OPTIONS = [
  { value: 'today', label: 'Hoy' },
  { value: 'week', label: 'Semana' },
];

type EarningsSheetProps = {
  summary: EarningsSummary | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onClose: () => void;
};

const missionsText = (count: number) =>
  count === 1 ? '1 misión completada' : `${count} misiones completadas`;

export function EarningsSheet({ summary, isLoading, isError, onRetry, onClose }: EarningsSheetProps) {
  const [period, setPeriod] = useState<Period>('today');
  const isToday = period === 'today';
  const totals = summary ? (isToday ? summary.today : summary.week) : undefined;

  return (
    <BottomSheet title="Ganancias" onClose={onClose}>
      <Tabs options={TAB_OPTIONS} value={period} onChange={(value) => setPeriod(value as Period)} />

      {isError ? (
        <Banner tone="danger" onRetry={onRetry}>
          No pudimos cargar tus ganancias.
        </Banner>
      ) : null}

      <View>
        <Text style={styles.caption}>{isToday ? 'Hoy' : 'Últimos 7 días'}</Text>
        <Text style={styles.amount}>{totals ? formatCop(totals.total) : isLoading ? 'Cargando…' : '—'}</Text>
        {totals ? <Text style={styles.detail}>{missionsText(totals.count)}</Text> : null}
      </View>

      {summary && !isToday ? <WeekBars days={summary.week.days} /> : null}

      {summary && isToday ? (
        <View>
          <Text style={styles.listTitle}>Últimas entregas</Text>
          {summary.today.entries.length === 0 ? (
            <Text style={styles.detail}>Aún no tienes entregas hoy.</Text>
          ) : (
            summary.today.entries.map((entry, index) => (
              <EarningsRow
                key={entry.orderId}
                from="Recogida"
                to="Entrega"
                order={orderLabel(entry.orderId)}
                amount={formatCop(entry.amount)}
                last={index === summary.today.entries.length - 1}
              />
            ))
          )}
        </View>
      ) : null}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  caption: {
    fontFamily: tokens.type.native.bodySemiBold,
    fontSize: tokens.type.textStyles.label.fontSize,
    color: tokens.colors.muted,
  },
  amount: {
    fontFamily: tokens.type.native.displayExtraBold,
    fontSize: tokens.type.textStyles.displayAmount.fontSize,
    letterSpacing: tokens.type.textStyles.displayAmount.fontSize * -0.025,
    color: tokens.colors.ink,
  },
  detail: {
    marginTop: tokens.spacing.space1,
    fontFamily: tokens.type.native.bodyRegular,
    fontSize: tokens.type.textStyles.body.fontSize,
    color: tokens.colors.muted,
  },
  listTitle: {
    marginBottom: tokens.spacing.space1,
    fontFamily: tokens.type.native.bodyBold,
    fontSize: tokens.type.textStyles.label.fontSize,
    color: tokens.colors.ink,
  },
});
