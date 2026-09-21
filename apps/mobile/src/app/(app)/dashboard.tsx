import { View, Text, TouchableOpacity } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useTracking } from '@/context/TrackingContext';

export default function DashboardScreen() {
  const { logout, user } = useAuth();
  const { isTracking, lastLocation } = useTracking();

  const handleLogout = () => {
    logout();
  };

  return (
    <View className="flex-1 justify-center items-center bg-zinc-100 dark:bg-zinc-900 px-6">
      <View className="bg-white dark:bg-zinc-800 p-8 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-700 w-full max-w-sm items-center">
        <View className={`w-16 h-16 rounded-full items-center justify-center mb-4 ${isTracking ? 'bg-green-100 dark:bg-green-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
          <Text className="text-2xl">{isTracking ? '📡' : '📦'}</Text>
        </View>
        
        <Text className="text-2xl font-bold text-zinc-900 dark:text-white mb-2 text-center">
          {user?.fullName ? `¡Hola, ${user.fullName}!` : '¡Listo para repartir!'}
        </Text>
        
        <Text className="text-zinc-500 dark:text-zinc-400 text-center mb-2">
          {isTracking 
            ? 'Transmitiendo tu ubicación al backend...'
            : 'Conectando con el servidor...'}
        </Text>

        {lastLocation && (
          <View className="bg-zinc-100 dark:bg-zinc-900 p-3 rounded-lg mb-6 w-full items-center">
            <Text className="text-xs text-zinc-500 font-mono">
              Lat: {lastLocation.lat.toFixed(5)}
            </Text>
            <Text className="text-xs text-zinc-500 font-mono">
              Lng: {lastLocation.lng.toFixed(5)}
            </Text>
          </View>
        )}

        <TouchableOpacity
          onPress={handleLogout}
          className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-xl py-3 items-center mt-2"
        >
          <Text className="text-zinc-800 dark:text-white font-semibold">
            Cerrar Sesión
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
