import { View, Text, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@dashroute/ui';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('repartidor@dashroute.com');
  const [password, setPassword] = useState('DashRoute123!');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return;
    
    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (e: any) {
      const errorMsg = e.response?.data?.message || e.message || 'Error desconocido';
      Alert.alert('Error al iniciar sesión', errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-zinc-900 px-6">
      <View className="w-full max-w-sm">
        <Text className="text-4xl font-bold text-white mb-2 text-center">
          DashRoute
        </Text>
        <Text className="text-zinc-400 text-center mb-8">
          Inicia sesión para recibir pedidos
        </Text>

        <View className="space-y-4">
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="Correo electrónico"
            placeholderTextColor="#A1A1AA"
            className="w-full bg-zinc-800 text-white rounded-xl px-4 py-3 border border-zinc-700"
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Contraseña"
            placeholderTextColor="#A1A1AA"
            secureTextEntry
            className="w-full bg-zinc-800 text-white rounded-xl px-4 py-3 border border-zinc-700 mb-4"
          />

          <Button
            title={isSubmitting ? "Entrando..." : "Entrar"}
            onPress={handleLogin}
            disabled={isSubmitting}
            variant="primary"
          />
        </View>
      </View>
    </View>
  );
}
