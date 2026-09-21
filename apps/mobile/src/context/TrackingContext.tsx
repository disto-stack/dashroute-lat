import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';

const WS_URL = process.env.EXPO_PUBLIC_WS_URL || 'ws://localhost:80/api/v1';

type LocationState = {
  lat: number;
  lng: number;
} | null;

type TrackingContextType = {
  isTracking: boolean;
  lastLocation: LocationState;
  startTracking: () => void;
  stopTracking: () => void;
};

const TrackingContext = createContext<TrackingContextType | null>(null);

export const useTracking = () => {
  const context = useContext(TrackingContext);
  if (!context) {
    throw new Error('useTracking must be used within a TrackingProvider');
  }
  return context;
};

export const TrackingProvider = ({ children }: { children: React.ReactNode }) => {
  const [isTracking, setIsTracking] = useState(false);
  const [lastLocation, setLastLocation] = useState<LocationState>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startTracking = async () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Se requiere acceso a la ubicación para rastrear los pedidos.');
      return;
    }

    const token = await SecureStore.getItemAsync('accessToken');
    if (!token) return;

    const wsOptions = { headers: { Authorization: `Bearer ${token}` } };
    // @ts-ignore - React Native's WebSocket accepts a 3rd argument for headers, missing in standard TS DOM lib
    const ws = new WebSocket(`${WS_URL}/geolocation/ws`, null, wsOptions);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsTracking(true);

      pingIntervalRef.current = setInterval(async () => {
        try {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          const payload = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            status: "IDLE"
          };
          
          setLastLocation({ lat: payload.latitude, lng: payload.longitude });
          
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(payload));
          }
        } catch (e) {
          console.error('Error al obtener ubicación:', e);
        }
      }, 3000);
    };

    ws.onerror = (e) => {
      console.error('Global WebSocket Error:', e.message);
    };

    ws.onclose = () => {
      setIsTracking(false);
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
    };
  };

  const stopTracking = () => {
    if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
    if (wsRef.current) wsRef.current.close();
    setIsTracking(false);
  };

  useEffect(() => {
    startTracking();

    return () => {
      stopTracking();
    };
  }, []);

  return (
    <TrackingContext.Provider value={{ isTracking, lastLocation, startTracking, stopTracking }}>
      {children}
    </TrackingContext.Provider>
  );
};
