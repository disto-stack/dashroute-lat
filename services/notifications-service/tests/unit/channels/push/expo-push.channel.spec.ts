import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExpoPushChannel } from '../../../../src/channels/push/expo-push.channel.js';
import { DevicesService } from '../../../../src/devices/devices.service.js';
import { Expo } from 'expo-server-sdk';
import { NotificationPayload } from '../../../../src/shared/types/notification-payload.type.js';

vi.mock('expo-server-sdk', () => {
  const ExpoMock = vi.fn().mockImplementation(function() {
    return { sendPushNotificationsAsync: vi.fn() };
  });
  return {
    Expo: ExpoMock,
  };
});

describe('ExpoPushChannel', () => {
  let channel: ExpoPushChannel;
  let devicesService: import('vitest').Mocked<DevicesService>;
  let expoInstanceMock: any;

  beforeEach(() => {
    vi.clearAllMocks();

    Expo.isExpoPushToken = (vi.fn().mockImplementation((token: string) => {
      return token.startsWith('ExponentPushToken[');
    }) as any);

    devicesService = {
      removeToken: vi.fn(),
    } as any;

    channel = new ExpoPushChannel(devicesService);
    
    expoInstanceMock = vi.mocked(Expo).mock.results[0].value;
  });

  const validPayload: NotificationPayload = {
    driverId: 'driver-123',
    missionId: 'mission-123',
    title: 'Test',
    body: 'Body',
    expoPushToken: 'ExponentPushToken[12345]',
    recipientPreferences: {},
    data: {},
  };

  describe('canHandle', () => {
    it('returns true if token is valid', () => {
      expect(channel.canHandle(validPayload)).toBe(true);
    });

    it('returns false if token is missing', () => {
      expect(channel.canHandle({ ...validPayload, expoPushToken: undefined })).toBe(false);
    });

    it('returns false if token is invalid format', () => {
      expect(channel.canHandle({ ...validPayload, expoPushToken: 'invalid-token' })).toBe(false);
    });
  });

  describe('send', () => {
    it('sends successfully on first attempt', async () => {
      expoInstanceMock.sendPushNotificationsAsync.mockResolvedValueOnce([{ status: 'ok', id: '123' }]);

      await expect(channel.send(validPayload)).resolves.toBeUndefined();
      
      expect(expoInstanceMock.sendPushNotificationsAsync).toHaveBeenCalledTimes(1);
      expect(expoInstanceMock.sendPushNotificationsAsync).toHaveBeenCalledWith([
        expect.objectContaining({
          to: validPayload.expoPushToken,
          title: validPayload.title,
          body: validPayload.body,
        }),
      ]);
    });

    it('removes token and does not retry if DeviceNotRegistered', async () => {
      expoInstanceMock.sendPushNotificationsAsync.mockResolvedValueOnce([
        { status: 'error', details: { error: 'DeviceNotRegistered' } },
      ]);

      await channel.send(validPayload);

      expect(expoInstanceMock.sendPushNotificationsAsync).toHaveBeenCalledTimes(1); // No retries
      expect(devicesService.removeToken).toHaveBeenCalledWith(validPayload.expoPushToken);
    });

    it('retries up to 3 times on generic error with exponential backoff', async () => {
      expoInstanceMock.sendPushNotificationsAsync
        .mockRejectedValueOnce(new Error('Network error 1'))
        .mockRejectedValueOnce(new Error('Network error 2'))
        .mockRejectedValueOnce(new Error('Network error 3'));

      vi.useFakeTimers();

      const sendPromise = channel.send(validPayload).catch(e => {
        if (e.message === 'Network error 3') return 'CAUGHT';
        throw e;
      });

      await vi.advanceTimersByTimeAsync(1000);
      await vi.advanceTimersByTimeAsync(2000);

      await expect(sendPromise).resolves.toBe('CAUGHT');

      expect(expoInstanceMock.sendPushNotificationsAsync).toHaveBeenCalledTimes(3);
      expect(devicesService.removeToken).not.toHaveBeenCalled();

      vi.useRealTimers();
    });

    it('succeeds on the second attempt', async () => {
      expoInstanceMock.sendPushNotificationsAsync
        .mockRejectedValueOnce(new Error('Network error 1'))
        .mockResolvedValueOnce([{ status: 'ok', id: '123' }]);

      vi.useFakeTimers();

      const sendPromise = channel.send(validPayload);
      await vi.advanceTimersByTimeAsync(1000);
      await expect(sendPromise).resolves.toBeUndefined();

      expect(expoInstanceMock.sendPushNotificationsAsync).toHaveBeenCalledTimes(2);

      vi.useRealTimers();
    });
  });
});
