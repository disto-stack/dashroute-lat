import { getCourierSnapshotTool } from '../../../src/tools/get-courier-snapshot.tool.js';

describe('get_courier_snapshot', () => {
  it('combines distance, status and lock per nearby courier', async () => {
    const redis = {
      nearbyCouriers: vi.fn().mockResolvedValue([
        { courierId: 'c1', distanceKm: 0.4 },
        { courierId: 'c2', distanceKm: 1.2 },
      ]),
      courierStatus: vi.fn(async (id: string) => (id === 'c1' ? 'IDLE' : null)),
      lockTtl: vi.fn(async (id: string) => (id === 'c1' ? 18 : null)),
    };

    const result = await getCourierSnapshotTool(redis).handler({
      lat: 6.2,
      lng: -75.5,
      radiusKm: 3,
    });

    expect(redis.nearbyCouriers).toHaveBeenCalledWith(6.2, -75.5, 3, 5);
    expect(result).toEqual({
      radiusKm: 3,
      couriersFound: 2,
      couriers: [
        { courierId: 'c1', distanceKm: 0.4, status: 'IDLE', locked: true, lockTtlSeconds: 18 },
        { courierId: 'c2', distanceKm: 1.2, status: null, locked: false, lockTtlSeconds: null },
      ],
    });
  });

  it('returns an empty list when nobody is nearby', async () => {
    const redis = {
      nearbyCouriers: vi.fn().mockResolvedValue([]),
      courierStatus: vi.fn(),
      lockTtl: vi.fn(),
    };
    const result = await getCourierSnapshotTool(redis).handler({ lat: 0, lng: 0, radiusKm: 3 });
    expect(result).toEqual({ radiusKm: 3, couriersFound: 0, couriers: [] });
  });
});
