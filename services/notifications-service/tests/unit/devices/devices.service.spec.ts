import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DevicesService } from '../../../src/devices/devices.service.js';

describe('DevicesService', () => {
  let devicesService: DevicesService;
  let dbMock: any;

  beforeEach(() => {
    const insertResultMock = {
      values: vi.fn().mockReturnThis(),
      onConflictDoUpdate: vi.fn().mockResolvedValue([{}]),
    };

    const deleteResultMock = {
      where: vi.fn().mockResolvedValue([{}]),
    };

    const selectResultMock = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ expoPushToken: 'token-123' }]),
    };

    const updateResultMock = {
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
    };

    dbMock = {
      insert: vi.fn().mockReturnValue(insertResultMock),
      delete: vi.fn().mockReturnValue(deleteResultMock),
      select: vi.fn().mockReturnValue(selectResultMock),
      update: vi.fn().mockReturnValue(updateResultMock),
    };

    devicesService = new DevicesService(dbMock);
  });

  describe('registerToken', () => {
    it('creates or updates a token successfully', async () => {
      await expect(devicesService.registerToken('driver-1', 'new-token')).resolves.toBeUndefined();
      
      expect(dbMock.update).toHaveBeenCalled();
      const updateMock = dbMock.update();
      expect(updateMock.set).toHaveBeenCalledWith({
        expoPushToken: 'new-token',
        updatedAt: expect.any(Date),
      });
      expect(updateMock.where).toHaveBeenCalled();
    });
  });

  describe('removeToken', () => {
    it('deletes token successfully without exception', async () => {
      await expect(devicesService.removeToken('token-123')).resolves.toBeUndefined();
      
      expect(dbMock.delete).toHaveBeenCalled();
      expect(dbMock.delete().where).toHaveBeenCalled();
    });
  });

  describe('findTokenByUserId', () => {
    it('returns token string if it exists', async () => {
      const result = await devicesService.findTokenByUserId('usr-1');
      expect(result).toBe('token-123');
    });

    it('returns null if token does not exist', async () => {
      dbMock.select().where().limit.mockResolvedValueOnce([]);
      
      const result = await devicesService.findTokenByUserId('usr-2');
      expect(result).toBeNull();
    });
  });

  describe('findTokenByDriverId', () => {
    it('returns token string if it exists', async () => {
      const result = await devicesService.findTokenByDriverId('driver-1');
      expect(result).toBe('token-123');
    });

    it('returns null if token does not exist', async () => {
      dbMock.select().where().limit.mockResolvedValueOnce([]);
      
      const result = await devicesService.findTokenByDriverId('driver-2');
      expect(result).toBeNull();
    });
  });
});
