import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { tokens } from '@dashroute/ui-tokens';
import {
  Button,
  Input,
  StatusPill,
  Stepper,
  ProfileChip,
  EarningsPill,
  StopTimeline,
  MissionCard,
  BottomSheet,
  Logo,
  OrderTimeline,
} from '@dashroute/ui';

export default function DesignSystemScreen() {
  const [available, setAvailable] = useState(true);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Logo variant="lockup" size={40} />

      <Section title="Top bar">
        <View style={styles.row}>
          <ProfileChip name="Camila Ríos" initials="CR" onClick={() => setAvailable((v) => !v)} />
          <EarningsPill amount="$ 84.500" />
        </View>
      </Section>

      <Section title="Estado">
        <View style={styles.row}>
          <StatusPill tone={available ? 'success' : 'neutral'}>
            {available ? 'Disponible' : 'Inactivo'}
          </StatusPill>
        </View>
        <Stepper current={2} />
      </Section>

      <Section title="Botones">
        <Button variant="primary" icon="nav">
          Iniciar ruta
        </Button>
        <Button variant="secondary">Volver al inicio</Button>
        <Button variant="secondary" size="compact" auto icon="plus">
          Crear orden
        </Button>
      </Section>

      <Section title="Formulario">
        <Input label="Correo electrónico" type="email" placeholder="tu@dashroute.co" />
        <Input label="Contraseña" type="password" />
      </Section>

      <Section title="Ruta">
        <View style={styles.mapSurface}>
          <StopTimeline
            tone="paper"
            pickup={{ name: 'Sucursal Chapinero', addr: 'Cra. 13 #63-40, Bogotá' }}
            dropoff={{ name: 'Hub Norte', addr: 'Cl. 100 #15-20, Bogotá' }}
          />
        </View>
      </Section>

      <Section title="Misión — tramo (paper)">
        <MissionCard tone="paper" actionsRow={false} actions={<Button variant="primary">Confirmar llegada</Button>}>
          <Text style={styles.place}>Sucursal Chapinero</Text>
          <Text style={styles.addr}>Cra. 13 #63-40, Bogotá</Text>
        </MissionCard>
      </Section>

      <Section title="Misión — oferta (blue)">
        <MissionCard
          tone="blue"
          offer
          badge="Nueva misión asignada"
          order="#02047A"
          actionsRow
          actions={
            <>
              <Button variant="on-blue-ghost">Rechazar</Button>
              <Button variant="on-blue">Aceptar misión</Button>
            </>
          }
        >
          <StopTimeline
            tone="blue"
            pickup={{ name: 'Sucursal Chapinero', addr: 'Cra. 13 #63-40, Bogotá' }}
            dropoff={{ name: 'Hub Norte', addr: 'Cl. 100 #15-20, Bogotá' }}
          />
        </MissionCard>
      </Section>

      <Section title="Hoja inferior">
        <BottomSheet title="Resumen de hoy">
          <Text style={styles.addr}>Ganancias del día: $ 84.500</Text>
        </BottomSheet>
      </Section>

      <Section title="Seguimiento del pedido">
        <Text style={styles.label}>En ruta</Text>
        <OrderTimeline status="IN_TRANSIT" times={{ received: '9:02', assigned: '9:05' }} />
        <Text style={[styles.label, styles.labelSpaced]}>Cancelado</Text>
        <OrderTimeline status="CANCELLED" note="El conductor no pudo completar la entrega." />
      </Section>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: tokens.colors.paper,
  },
  content: {
    padding: tokens.spacing.space6,
    gap: tokens.spacing.space8,
  },
  section: {
    gap: tokens.spacing.space3,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: tokens.colors.muted,
  },
  row: {
    flexDirection: 'row',
    gap: tokens.spacing.space3,
  },
  mapSurface: {
    padding: tokens.spacing.space5,
    borderRadius: tokens.radius.xl,
    backgroundColor: tokens.colors.mapGround,
  },
  place: {
    fontWeight: '800',
    fontSize: 25,
    color: tokens.colors.ink,
  },
  addr: {
    fontSize: 15,
    color: tokens.colors.muted,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: tokens.colors.muted,
  },
  labelSpaced: {
    marginTop: tokens.spacing.space3,
  },
});
