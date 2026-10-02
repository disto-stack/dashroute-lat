import { router } from 'expo-router';
import { StyleSheet, Text, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { tokens } from '@dashroute/ui-tokens';
import { Button } from '@dashroute/ui';
import { useAuth } from '@/context/AuthContext';
import { DriverMap } from '@/features/geolocation/components/DriverMap';
import { useCurrentLocation } from '@/features/geolocation/hooks/useCurrentLocation';
import { useLocationSocket } from '@/features/geolocation/hooks/useLocationSocket';
import { useDriverNotifications } from '@/features/missions/hooks/useDriverNotifications';
import * as Notifications from 'expo-notifications';

// Mostrar notificaciones aunque la app esté en primer plano
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowList: true,
  }),
});

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const { coords } = useCurrentLocation();
  
  // 1. Escuchar la misión desde WebSocket y mostrar un Alert visual en la app
  useDriverNotifications(() => {
    Alert.alert('¡Nueva Misión!', 'Te ha llegado una nueva asignación desde el backend 🚀');
  });

  useLocationSocket(coords, 'IDLE');

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  // 2. Botón local para forzar una notificación Push de prueba y confirmar que hay permisos
  const handleCreate = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Sin permisos', 'Activa las notificaciones en Ajustes para probar esto.');
      return;
    }
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '¡Push Funcionando! 🚀',
        body: 'El celular está listo para recibir notificaciones de misiones.',
      },
      trigger: null,
    });
  };

  return (
    <View style={styles.screen}>
      <DriverMap coords={coords} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        <Text style={styles.headline}>
          {user?.fullName ? `¡Hola, ${user.fullName}!` : '¡Listo para repartir!'}
        </Text>
        <Button variant="primary" onClick={handleCreate}>
          Probar Push Local
        </Button>
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
