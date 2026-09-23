import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { tokens } from '@dashroute/ui-tokens';
import { Button } from '@dashroute/ui';
import { useAuth } from '@/context/AuthContext';

export default function HomeScreen() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.headline}>
        {user?.fullName ? `¡Hola, ${user.fullName}!` : '¡Listo para repartir!'}
      </Text>
      <Button variant="secondary" onClick={handleLogout}>
        Cerrar sesión
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: tokens.spacing.space6,
    padding: tokens.spacing.space6,
    backgroundColor: tokens.colors.paper,
  },
  headline: {
    fontFamily: tokens.type.native.displayExtraBold,
    fontSize: tokens.type.textStyles.displayState.fontSize,
    letterSpacing: tokens.type.textStyles.displayState.fontSize * -0.025,
    color: tokens.colors.ink,
    textAlign: 'center',
  },
});
