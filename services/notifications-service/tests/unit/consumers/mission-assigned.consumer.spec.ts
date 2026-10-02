import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MissionAssignedConsumer } from '../../../src/consumers/mission-assigned.consumer.js';
import { NotificationDispatcher } from '../../../src/dispatcher/notification.dispatcher.js';
import { DevicesService } from '../../../src/devices/devices.service.js';

const mockLogger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
};

describe('MissionAssignedConsumer', () => {
  let consumer: MissionAssignedConsumer;
  let dispatcherMock: import('vitest').Mocked<NotificationDispatcher>;
  let devicesServiceMock: import('vitest').Mocked<DevicesService>;
  let dbMock: any;
  let channelMock: any;

  beforeEach(() => {
    dispatcherMock = {
      dispatch: vi.fn().mockResolvedValue(undefined),
    } as any;

    devicesServiceMock = {
      findTokenByDriverId: vi.fn().mockResolvedValue('push-token'),
    } as any;

    const insertResultMock = {
      values: vi.fn().mockReturnThis(),
      onConflictDoNothing: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([{ insertedId: 'event-123' }]),
    };

    dbMock = {
      insert: vi.fn().mockReturnValue(insertResultMock),
    };

    channelMock = {
      ack: vi.fn(),
      nack: vi.fn(),
    };

    consumer = new MissionAssignedConsumer(
      dispatcherMock,
      devicesServiceMock,
      dbMock,
      mockLogger as any,
    );
    // @ts-ignore
    consumer.channel = channelMock;
  });

  const validMessage = {
    content: Buffer.from(
      JSON.stringify({
        event_id: 'event-123',
        event_type: 'delivery.assigned',
        occurredAt: '2026-09-24T01:00:00Z',
        payload: {
          orderId: 'o1',
          courierId: 'c1',
          assignedAt: '2026-09-24T01:00:00Z',
        },
      })
    ),
  };

  it('maps valid payload correctly and calls dispatcher', async () => {
    // @ts-ignore
    await consumer.handleMessage(validMessage);

    expect(dispatcherMock.dispatch).toHaveBeenCalledWith({
      missionId: 'o1',
      driverId: 'c1',
      title: 'New Delivery Assigned!',
      body: 'You have been assigned to order: o1',
      data: {
        orderId: 'o1',
        courierId: 'c1',
        assignedAt: '2026-09-24T01:00:00Z',
      },
      expoPushToken: 'push-token',
      recipientPreferences: {},
    });
    expect(channelMock.ack).toHaveBeenCalledWith(validMessage);
  });

  it('does not dispatch if eventId already processed (idempotency)', async () => {
    dbMock.insert().onConflictDoNothing().returning.mockResolvedValueOnce([]);

    // @ts-ignore
    await consumer.handleMessage(validMessage);

    expect(dispatcherMock.dispatch).not.toHaveBeenCalled();
    expect(channelMock.ack).toHaveBeenCalledWith(validMessage);
  });

  it('nacks (requeue=false) if payload is invalid', async () => {
    const invalidMessage = {
      content: Buffer.from(JSON.stringify({ event_type: 'wrong.type' })),
    };

    // @ts-ignore
    await consumer.handleMessage(invalidMessage);

    expect(dispatcherMock.dispatch).not.toHaveBeenCalled();
    expect(channelMock.nack).toHaveBeenCalledWith(invalidMessage, false, false);
  });

  it('nacks (requeue=false) if JSON parsing fails', async () => {
    const badJsonMessage = {
      content: Buffer.from('{ bad json'),
    };

    // @ts-ignore
    await consumer.handleMessage(badJsonMessage);

    expect(dispatcherMock.dispatch).not.toHaveBeenCalled();
    expect(channelMock.nack).toHaveBeenCalledWith(badJsonMessage, false, false);
  });
});
