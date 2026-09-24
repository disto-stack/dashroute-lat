import { useEffect, useRef } from 'react';
import { getTokens } from '@/features/auth/services/token-storage';
import { LocationSocket } from '../services/location-socket';
import { Coordinate, CourierStatus } from '../types';

const getWsUrl = () => `${process.env.EXPO_PUBLIC_WS_URL ?? 'ws://localhost:80/api/v1'}/geolocation/ws`;

export function useLocationSocket(coords: Coordinate | null, status: CourierStatus) {
  const socketRef = useRef<LocationSocket | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const connect = async () => {
      const { accessToken } = await getTokens();
      if (isCancelled || !accessToken) return;

      const socket = new LocationSocket(getWsUrl(), accessToken);
      socket.connect();
      socketRef.current = socket;
    };

    connect();

    return () => {
      isCancelled = true;
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!coords) return;
    socketRef.current?.send({ latitude: coords.latitude, longitude: coords.longitude, status });
  }, [coords, status]);
}
