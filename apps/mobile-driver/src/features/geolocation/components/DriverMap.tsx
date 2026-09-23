import { useMemo, useRef, useState } from 'react';
import { NativeSyntheticEvent, Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Camera, type CameraRef, Map, Marker, type ViewStateChangeEvent } from '@maplibre/maplibre-react-native';
import { tokens } from '@dashroute/ui-tokens';
import { buildMapStyle } from '../map-style';
import { Coordinate } from '../types';
import { LocationDot } from './LocationDot';

const FALLBACK_CENTER: [number, number] = [-74.0721, 4.711];
const FOLLOW_ZOOM = 16;

type DriverMapProps = {
  coords: Coordinate | null;
  style?: ViewStyle;
};

export function DriverMap({ coords, style }: DriverMapProps) {
  const cameraRef = useRef<CameraRef>(null);
  const [isFollowing, setIsFollowing] = useState(true);

  const mapStyle = useMemo(() => buildMapStyle(process.env.EXPO_PUBLIC_MAPTILER_KEY ?? ''), []);
  const center: [number, number] = coords ? [coords.longitude, coords.latitude] : FALLBACK_CENTER;

  const handleRegionIsChanging = (event: NativeSyntheticEvent<ViewStateChangeEvent>) => {
    if (event.nativeEvent.userInteraction) {
      setIsFollowing(false);
    }
  };

  const recenter = () => {
    setIsFollowing(true);
    cameraRef.current?.easeTo({ center, zoom: FOLLOW_ZOOM, duration: 400 });
  };

  return (
    <View style={[styles.container, style]}>
      <Map style={styles.map} mapStyle={mapStyle} onRegionIsChanging={handleRegionIsChanging}>
        <Camera
          ref={cameraRef}
          initialViewState={{ center, zoom: FOLLOW_ZOOM }}
          trackUserLocation={isFollowing ? 'default' : undefined}
        />
        {coords && (
          <Marker id="driver-location" lngLat={center}>
            <LocationDot />
          </Marker>
        )}
      </Map>
      {!isFollowing && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver a centrar el mapa en mi ubicación"
          onPress={recenter}
          style={styles.recenterButton}
        >
          <RecenterIcon />
        </Pressable>
      )}
    </View>
  );
}

function RecenterIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={tokens.colors.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
      <Path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  recenterButton: {
    position: 'absolute',
    right: tokens.spacing.space4,
    bottom: tokens.spacing.space4,
    width: tokens.size.control,
    height: tokens.size.control,
    borderRadius: tokens.radius.pill,
    backgroundColor: tokens.colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: tokens.shadow.float,
  },
});
