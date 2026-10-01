import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DevicesController } from '../../../src/devices/devices.controller.js';
import { DevicesService } from '../../../src/devices/devices.service.js';
import { BadRequestException } from '@nestjs/common';

describe('DevicesController', () => {
  let controller: DevicesController;
  let devicesServiceMock: import('vitest').Mocked<DevicesService>;

  beforeEach(() => {
    devicesServiceMock = {
      registerToken: vi.fn().mockResolvedValue(undefined),
    } as any;

    controller = new DevicesController(devicesServiceMock);
  });

  describe('registerToken', () => {
    it('registers token with valid payload', async () => {
      const dto = { expoPushToken: 'ExponentPushToken[123]' } as any;
      const payloadBase64 = Buffer.from(JSON.stringify({ sub: 'driver-1' })).toString('base64');
      const authHeader = `Bearer header.${payloadBase64}.signature`;

      await expect(controller.registerToken(authHeader, dto)).resolves.toEqual({ success: true });
      expect(devicesServiceMock.registerToken).toHaveBeenCalledWith('driver-1', 'ExponentPushToken[123]');
    });

    it('throws bad request if no expo push token provided', async () => {
      const dto = {} as any;
      const payloadBase64 = Buffer.from(JSON.stringify({ sub: 'driver-1' })).toString('base64');
      const authHeader = `Bearer header.${payloadBase64}.signature`;

      await expect(controller.registerToken(authHeader, dto)).rejects.toThrow(BadRequestException);
      expect(devicesServiceMock.registerToken).not.toHaveBeenCalled();
    });

    it('throws unauthorized if user is not authenticated properly', async () => {
      const dto = { expoPushToken: 'ExponentPushToken[123]' } as any;
      const authHeader = '';

      await expect(controller.registerToken(authHeader, dto)).rejects.toThrow();
      expect(devicesServiceMock.registerToken).not.toHaveBeenCalled();
    });
  });
});
