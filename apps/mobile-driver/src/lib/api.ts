import axios from 'axios';
import { Platform } from 'react-native';
import { getTokens, setTokens, clearTokens } from '@/features/auth/services/token-storage';

// For Android Emulators, localhost refers to the emulator itself. 10.0.2.2 is the host machine.
const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  if (Platform.OS === 'android') return 'http://10.0.2.2:80/api/v1';
  return 'http://localhost:80/api/v1';
};

export const API_URL = getBaseUrl();

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const { accessToken } = await getTokens();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { refreshToken } = await getTokens();

        if (refreshToken) {
          const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });

          await setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });

          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return axios(originalRequest);
        }
      } catch (refreshError) {
        await clearTokens();
      }
    }
    return Promise.reject(error);
  }
);
