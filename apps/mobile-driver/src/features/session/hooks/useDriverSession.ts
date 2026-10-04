import { useContext } from 'react';
import { DriverSession, DriverSessionContext } from '../components/DriverSessionProvider';

export function useDriverSession(): DriverSession {
  const session = useContext(DriverSessionContext);
  if (!session) {
    throw new Error('useDriverSession must be used within a DriverSessionProvider');
  }
  return session;
}
