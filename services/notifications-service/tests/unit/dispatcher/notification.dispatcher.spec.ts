import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationDispatcher } from '../../../src/dispatcher/notification.dispatcher.js';
import { NotificationChannel } from '../../../src/channels/notification-channel.interface.js';
import { NotificationPayload } from '../../../src/shared/types/notification-payload.type.js';

const mockLogger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
};

describe('NotificationDispatcher', () => {
  let dispatcher: NotificationDispatcher;
  let pushChannelMock: import('vitest').Mocked<NotificationChannel>;
  let wsChannelMock: import('vitest').Mocked<NotificationChannel>;

  beforeEach(() => {
    pushChannelMock = {
      channelId: 'push',
      canHandle: vi.fn(),
      send: vi.fn().mockResolvedValue(undefined),
    };

    wsChannelMock = {
      channelId: 'websocket',
      canHandle: vi.fn(),
      send: vi.fn().mockResolvedValue(undefined),
    };

    dispatcher = new NotificationDispatcher(
      [pushChannelMock, wsChannelMock],
      mockLogger as any,
    );
  });

  const payload: NotificationPayload = {
    driverId: '123',
    missionId: 'm1',
    title: 'title',
    body: 'body',
    recipientPreferences: {},
  };

  it('calls send only on channels that return true for canHandle', async () => {
    pushChannelMock.canHandle.mockReturnValue(true);
    wsChannelMock.canHandle.mockReturnValue(false);

    await dispatcher.dispatch(payload);

    expect(pushChannelMock.send).toHaveBeenCalledWith(payload);
    expect(wsChannelMock.send).not.toHaveBeenCalled();
  });

  it('continues executing if one channel fails (Promise.allSettled)', async () => {
    pushChannelMock.canHandle.mockReturnValue(true);
    wsChannelMock.canHandle.mockReturnValue(true);

    pushChannelMock.send.mockRejectedValue(new Error('Push failed'));
    wsChannelMock.send.mockResolvedValue(undefined);

    await expect(dispatcher.dispatch(payload)).resolves.toBeUndefined();

    expect(pushChannelMock.send).toHaveBeenCalledWith(payload);
    expect(wsChannelMock.send).toHaveBeenCalledWith(payload);
  });

  it('logs an error for each failed channel', async () => {
    pushChannelMock.canHandle.mockReturnValue(true);
    wsChannelMock.canHandle.mockReturnValue(false);

    const err = new Error('Push failed');
    pushChannelMock.send.mockRejectedValue(err);

    await dispatcher.dispatch(payload);

    expect(mockLogger.error).toHaveBeenCalled();
  });

  it('returns silently with zero applicable channels', async () => {
    pushChannelMock.canHandle.mockReturnValue(false);
    wsChannelMock.canHandle.mockReturnValue(false);

    await expect(dispatcher.dispatch(payload)).resolves.toBeUndefined();

    expect(pushChannelMock.send).not.toHaveBeenCalled();
    expect(wsChannelMock.send).not.toHaveBeenCalled();
  });
});
