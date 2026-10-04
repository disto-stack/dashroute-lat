import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { tokens } from '@dashroute/ui-tokens';
import { MissionCard, StatusPill } from '@dashroute/ui';

type FreeStatusCardProps = {
  firstName: string;
  available: boolean;
  canGoOnline: boolean;
};

function copyFor(available: boolean, canGoOnline: boolean) {
  if (available) return { title: 'Buscando nuevas rutas…', detail: 'Sin misión asignada' };
  if (!canGoOnline) return { title: 'Cuenta en verificación', detail: 'Podrás recibir misiones al verificarla.' };
  return { title: 'Fuera de servicio', detail: 'Actívate desde tu perfil.' };
}

export function FreeStatusCard({ firstName, available, canGoOnline }: FreeStatusCardProps) {
  const { title, detail } = copyFor(available, canGoOnline);

  return (
    <MissionCard tone="paper">
      <View style={styles.head}>
        <Text style={styles.greeting}>Hola, {firstName}</Text>
        {available ? (
          <StatusPill tone="success" dot>
            Disponible
          </StatusPill>
        ) : (
          <StatusPill tone="neutral" dot>
            Inactivo
          </StatusPill>
        )}
      </View>

      <View style={styles.status}>
        <Svg viewBox="0 0 48 48" width={48} height={48} accessibilityElementsHidden>
          <Circle cx={24} cy={24} r={22} stroke={tokens.colors.blue} strokeOpacity={available ? 0.25 : 0.1} strokeWidth={2} fill="none" />
          <Circle cx={24} cy={24} r={14} stroke={tokens.colors.blue} strokeOpacity={available ? 0.5 : 0.15} strokeWidth={2} fill="none" />
          <Circle cx={24} cy={24} r={5} fill={available ? tokens.colors.blue : tokens.colors.muted} />
        </Svg>
        <View style={styles.copy}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.detail}>{detail}</Text>
        </View>
      </View>
    </MissionCard>
  );
}

const styles = StyleSheet.create({
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greeting: {
    fontFamily: tokens.type.native.bodySemiBold,
    fontSize: 16,
    color: tokens.colors.muted,
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: tokens.radius.lg,
    backgroundColor: tokens.colors.paper,
  },
  copy: {
    flex: 1,
  },
  title: {
    fontFamily: tokens.type.native.displayExtraBold,
    fontSize: tokens.type.textStyles.displayCard.fontSize,
    lineHeight: tokens.type.textStyles.displayCard.fontSize * tokens.type.textStyles.displayCard.lineHeight,
    letterSpacing: tokens.type.textStyles.displayCard.fontSize * -0.02,
    color: tokens.colors.ink,
  },
  detail: {
    marginTop: 2,
    fontFamily: tokens.type.native.bodyRegular,
    fontSize: tokens.type.textStyles.body.fontSize,
    color: tokens.colors.muted,
  },
});
