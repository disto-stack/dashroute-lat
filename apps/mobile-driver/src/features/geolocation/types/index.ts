export type Coordinate = {
  latitude: number;
  longitude: number;
};

export type CourierStatus = 'ONLINE' | 'OFFLINE' | 'BUSY' | 'IDLE';

export type LocationPermissionStatus = 'loading' | 'granted' | 'denied';

// Matches the backend's PingPayload schema (docs/api/dashroute-unified.openapi.yaml,
// GET /geolocation/ws) — note this uses latitude/longitude, unlike LocationDto
// elsewhere in the API which uses lat/lng. That inconsistency is still unconfirmed
// with backend; verify before assuming either naming is the "correct" one.
export type PingPayload = {
  longitude: number;
  latitude: number;
  status: CourierStatus;
};
