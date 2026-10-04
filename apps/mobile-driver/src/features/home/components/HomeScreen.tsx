import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tokens } from '@dashroute/ui-tokens';
import { Banner, ProfileMenu } from '@dashroute/ui';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { DriverMap } from '@/features/geolocation/components/DriverMap';
import { useDriverSession } from '@/features/session/hooks/useDriverSession';
import { useEarnings } from '@/features/earnings/hooks/useEarnings';
import { EarningsSheet } from '@/features/earnings/components/EarningsSheet';
import { formatCop } from '@/features/earnings/utils/formatCop';
import { firstName, initials } from '@/lib/initials';
import { HomeTopBar } from './HomeTopBar';
import { FreeStatusCard } from './FreeStatusCard';

export function HomeScreen() {
  const { user, logout } = useAuth();
  const { coords, locationStatus, available, canGoOnline, setAvailable } = useDriverSession();
  const earnings = useEarnings(user?.courierProfile?.id ?? user?.courierId);
  const insets = useSafeAreaInsets();
  const [menuOpen, setMenuOpen] = useState(false);
  const [earningsOpen, setEarningsOpen] = useState(false);
  const [cardHeight, setCardHeight] = useState(0);
  const bottomOffset = insets.bottom + tokens.spacing.space4;

  const fullName = user?.fullName ?? '';

  const openEarnings = () => {
    setMenuOpen(false);
    setEarningsOpen(true);
  };

  return (
    <View style={styles.screen}>
      <DriverMap coords={coords} mode={available ? 'searching' : 'inactive'}
        bottomInset={bottomOffset + cardHeight}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.top, { top: insets.top + tokens.spacing.space2 }]} pointerEvents="box-none">
        <HomeTopBar
          name={firstName(fullName)}
          initials={initials(fullName)}
          earnings={earnings.data ? formatCop(earnings.data.today.total) : '—'}
          onOpenProfile={() => setMenuOpen((open) => !open)}
          onOpenEarnings={openEarnings}
        />
        {!canGoOnline ? (
          <Banner tone="warning">Tu cuenta aún no está verificada, por ahora no recibirás misiones.</Banner>
        ) : null}
        {locationStatus === 'denied' ? (
          <Banner tone="warning">Activa el permiso de ubicación para recibir misiones.</Banner>
        ) : null}
      </View>

      <View
        testID="home-status-card"
        style={[styles.bottom, { bottom: bottomOffset }]}
        pointerEvents="box-none"
        onLayout={(event) => setCardHeight(event.nativeEvent.layout.height)}
      >
        <FreeStatusCard firstName={firstName(fullName)} available={available} canGoOnline={canGoOnline} />
      </View>

      {menuOpen ? (
        <>
          <Pressable
            style={StyleSheet.absoluteFill}
            accessibilityLabel="Cerrar menú"
            onPress={() => setMenuOpen(false)}
          />
          <View style={[styles.menu, { top: insets.top + tokens.spacing.space2 + tokens.size.pillHeight + tokens.spacing.space2 }]}>
            <ProfileMenu
              available={available}
              availableLabel={available ? 'Activo' : 'Inactivo'}
              onAvailableChange={() => canGoOnline && setAvailable(!available)}
              items={[{ icon: 'logout', label: 'Cerrar sesión', tone: 'danger', onClick: () => void logout() }]}
            />
          </View>
        </>
      ) : null}

      {earningsOpen ? (
        <>
          <Pressable
            style={[StyleSheet.absoluteFill, styles.scrim]}
            accessibilityLabel="Cerrar resumen de ganancias"
            onPress={() => setEarningsOpen(false)}
          />
          <View style={styles.sheet}>
            <EarningsSheet
              summary={earnings.data}
              isLoading={earnings.isLoading}
              isError={earnings.isError}
              onRetry={() => void earnings.refetch()}
              onClose={() => setEarningsOpen(false)}
            />
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: tokens.colors.paper,
  },
  top: {
    position: 'absolute',
    left: tokens.spacing.space4,
    right: tokens.spacing.space4,
    gap: tokens.spacing.space2,
  },
  bottom: {
    position: 'absolute',
    left: tokens.spacing.space3,
    right: tokens.spacing.space3,
  },
  menu: {
    position: 'absolute',
    left: tokens.spacing.space4,
  },
  scrim: {
    backgroundColor: 'rgba(26, 29, 33, 0.42)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
});
