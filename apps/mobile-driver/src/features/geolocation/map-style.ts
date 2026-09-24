import type { StyleSpecification } from '@maplibre/maplibre-react-native';
import { tokens } from '@dashroute/ui-tokens';

/**
 * A MapLibre GL style JSON, built from DashRoute's own design tokens instead
 * of a generic map provider's default look.
 *
 * The source is MapTiler's OpenMapTiles-schema vector tiles (source-layers:
 * water, landcover, landuse, transportation, building, poi, place, etc.) —
 * see https://cloud.maptiler.com. We only declare the layers we actually
 * want (ground, water, parks, roads): everything else in the source — POI
 * icons/labels, transit lines, 3D buildings, place-name clutter — simply has
 * no corresponding layer here, so it never renders. This is what "remove the
 * map information we don't need" means at the style-JSON level.
 */
export type MapLibreStyle = StyleSpecification;

const SOURCE_ID = 'dashroute-tiles';

export function buildMapStyle(maptilerKey: string): MapLibreStyle {
  return {
    version: 8,
    sources: {
      [SOURCE_ID]: {
        type: 'vector',
        url: `https://api.maptiler.com/tiles/v3/tiles.json?key=${maptilerKey}`,
      },
    },
    glyphs: `https://api.maptiler.com/fonts/{fontstack}/{range}.pbf?key=${maptilerKey}`,
    layers: [
      {
        id: 'background',
        type: 'background',
        paint: { 'background-color': tokens.colors.mapGround },
      },
      {
        id: 'water',
        type: 'fill',
        source: SOURCE_ID,
        'source-layer': 'water',
        paint: { 'fill-color': tokens.colors.mapWater },
      },
      {
        id: 'landuse-park',
        type: 'fill',
        source: SOURCE_ID,
        'source-layer': 'landuse',
        filter: ['in', ['get', 'class'], ['literal', ['park', 'grass', 'wood', 'forest']]],
        paint: { 'fill-color': tokens.colors.mapPark },
      },
      {
        id: 'road-minor',
        type: 'line',
        source: SOURCE_ID,
        'source-layer': 'transportation',
        filter: ['!', ['in', ['get', 'class'], ['literal', ['motorway', 'trunk', 'primary']]]],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': tokens.colors.mapRoadMinor, 'line-width': 2 },
      },
      {
        id: 'road-major',
        type: 'line',
        source: SOURCE_ID,
        'source-layer': 'transportation',
        filter: ['in', ['get', 'class'], ['literal', ['motorway', 'trunk', 'primary']]],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': tokens.colors.mapRoadMajor, 'line-width': 4 },
      },
    ],
  };
}
