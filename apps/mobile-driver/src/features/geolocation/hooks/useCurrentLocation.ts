import { useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import { Coordinate, LocationPermissionStatus } from '../types';

type UseCurrentLocationResult = {
  coords: Coordinate | null;
  status: LocationPermissionStatus;
  error: string | null;
};

export function useCurrentLocation(): UseCurrentLocationResult {
  const [coords, setCoords] = useState<Coordinate | null>(null);
  const [status, setStatus] = useState<LocationPermissionStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    let isMounted = true;

    const start = async () => {
      const { status: permissionStatus } = await Location.requestForegroundPermissionsAsync();

      if (!isMounted) return;

      if (permissionStatus !== 'granted') {
        setStatus('denied');
        return;
      }

      setStatus('granted');

      subscriptionRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 3000,
          distanceInterval: 10,
        },
        (position) => {
          if (!isMounted) return;
          setCoords({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        }
      );
    };

    start().catch((e) => {
      if (!isMounted) return;
      setError(e instanceof Error ? e.message : 'No se pudo obtener la ubicación');
      setStatus('denied');
    });

    return () => {
      isMounted = false;
      subscriptionRef.current?.remove();
      subscriptionRef.current = null;
    };
  }, []);

  return { coords, status, error };
}
