import { useEffect, useRef } from 'react';
import { getTokens } from '@/features/auth/services/token-storage';
import { LocationSocket } from '../services/location-socket';
import { Coordinate, CourierStatus, PingPayload } from '../types';

const getWsUrl = () => `${process.env.EXPO_PUBLIC_WS_URL ?? 'ws://localhost:80/api/v1'}/geolocation/ws`;

const getAccessToken = async () => (await getTokens()).accessToken ?? null;

export const HEARTBEAT_INTERVAL_MS = 10_000;

export function useLocationSocket(
  coords: Coordinate | null,
  status: CourierStatus,
  heartbeatIntervalMs: number = HEARTBEAT_INTERVAL_MS
) {
  const socketRef = useRef<LocationSocket | null>(null);
  const lastPingRef = useRef<PingPayload | null>(null);

  useEffect(() => {
    const socket = new LocationSocket(getWsUrl(), getAccessToken, () => {
      if (lastPingRef.current) socket.send(lastPingRef.current);
    });

    socketRef.current = socket;

    void socket.connect();

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!coords) return;
    const ping: PingPayload = { latitude: coords.latitude, longitude: coords.longitude, status };
    lastPingRef.current = ping;
    socketRef.current?.send(ping);
  }, [coords, status]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (lastPingRef.current) socketRef.current?.send(lastPingRef.current);
    }, heartbeatIntervalMs);
    
    return () => clearInterval(timer);
  }, [heartbeatIntervalMs]);
}
