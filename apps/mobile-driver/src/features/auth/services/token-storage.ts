import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { AuthTokens } from '../types';

export async function getTokens(): Promise<Partial<AuthTokens>> {
  if (Platform.OS === 'web') {
    return {
      accessToken: localStorage.getItem('accessToken') ?? undefined,
      refreshToken: localStorage.getItem('refreshToken') ?? undefined,
    };
  }
  const [accessToken, refreshToken] = await Promise.all([
    SecureStore.getItemAsync('accessToken'),
    SecureStore.getItemAsync('refreshToken'),
  ]);
  return {
    accessToken: accessToken ?? undefined,
    refreshToken: refreshToken ?? undefined,
  };
}

export async function setTokens(tokens: AuthTokens): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
    return;
  }
  await Promise.all([
    SecureStore.setItemAsync('accessToken', tokens.accessToken),
    SecureStore.setItemAsync('refreshToken', tokens.refreshToken),
  ]);
}

export async function clearTokens(): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return;
  }
  await Promise.all([
    SecureStore.deleteItemAsync('accessToken'),
    SecureStore.deleteItemAsync('refreshToken'),
  ]);
}
