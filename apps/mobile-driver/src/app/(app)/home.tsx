import { router } from 'expo-router';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { tokens } from '@dashroute/ui-tokens';
import { Button } from '@dashroute/ui';
import { useAuth } from '@/context/AuthContext';
import { DriverMap } from '@/features/geolocation/components/DriverMap';
import { useCurrentLocation } from '@/features/geolocation/hooks/useCurrentLocation';
import { useLocationSocket } from '@/features/geolocation/hooks/useLocationSocket';

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const { coords } = useCurrentLocation();
  useLocationSocket(coords, 'IDLE');

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <View style={styles.screen}>
      <DriverMap coords={coords} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        <Text style={styles.headline}>
          {user?.fullName ? `¡Hola, ${user.fullName}!` : '¡Listo para repartir!'}
        </Text>
        <Button variant="secondary" onClick={handleLogout}>
          Cerrar sesión
        </Button>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: tokens.colors.paper,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: tokens.spacing.space4,
    padding: tokens.spacing.space6,
  },
  headline: {
    fontFamily: tokens.type.native.displayExtraBold,
    fontSize: tokens.type.textStyles.displayCard.fontSize,
    letterSpacing: tokens.type.textStyles.displayCard.fontSize * -0.02,
    color: tokens.colors.ink,
    textAlign: 'center',
  },
});
