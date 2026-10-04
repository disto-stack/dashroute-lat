export type Coordinate = {
  latitude: number;
  longitude: number;
};

export type CourierStatus = 'ONLINE' | 'OFFLINE' | 'BUSY' | 'IDLE';

export type LocationPermissionStatus = 'loading' | 'granted' | 'denied';

export type PingPayload = {
  longitude: number;
  latitude: number;
  status: CourierStatus;
};
