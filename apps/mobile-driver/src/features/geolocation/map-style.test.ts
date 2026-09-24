import { tokens } from '@dashroute/ui-tokens';
import { buildMapStyle } from './map-style';

function findLayer(style: ReturnType<typeof buildMapStyle>, id: string) {
  const layer = style.layers.find((l) => l.id === id);
  if (!layer) throw new Error(`layer "${id}" not found`);
  return layer as { paint: Record<string, unknown> };
}

describe('buildMapStyle', () => {
  const style = buildMapStyle('test-key');

  test('recolors ground/water/park/road layers from ui-tokens', () => {
    expect(findLayer(style, 'background').paint['background-color']).toBe(tokens.colors.mapGround);
    expect(findLayer(style, 'water').paint['fill-color']).toBe(tokens.colors.mapWater);
    expect(findLayer(style, 'landuse-park').paint['fill-color']).toBe(tokens.colors.mapPark);
    expect(findLayer(style, 'road-minor').paint['line-color']).toBe(tokens.colors.mapRoadMinor);
    expect(findLayer(style, 'road-major').paint['line-color']).toBe(tokens.colors.mapRoadMajor);
  });

  test('declares no poi, transit, building or place-label layers', () => {
    const ids = style.layers.map((l) => l.id as string);
    const clutter = ids.filter((id) => /poi|transit|building|place/i.test(id));
    expect(clutter).toEqual([]);
  });

  test('embeds the given MapTiler key in the tile source and glyphs URLs', () => {
    const source = style.sources['dashroute-tiles'] as { url: string };
    expect(source.url).toContain('key=test-key');
    expect(style.glyphs).toContain('key=test-key');
  });
});
