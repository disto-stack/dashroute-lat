import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const storageKey = (userId: string) => `driver.available.${userId}`;

export function useAvailability(userId: string | undefined) {
  const [available, setAvailableState] = useState(true);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    setLoaded(false);

    AsyncStorage.getItem(storageKey(userId))
      .then((stored) => {
        if (!cancelled) setAvailableState(stored !== 'false');
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const setAvailable = useCallback(
    (next: boolean) => {
      setAvailableState(next);
      if (userId) AsyncStorage.setItem(storageKey(userId), String(next)).catch(() => {});
    },
    [userId]
  );

  return { available, loaded, setAvailable };
}
