import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WebSocketChannel } from '../../../../src/channels/websocket/websocket.channel.js';
import { NotificationPayload } from '../../../../src/shared/types/notification-payload.type.js';
import { Socket, Server } from 'socket.io';

describe('WebSocketChannel', () => {
  let channel: WebSocketChannel;
  let serverMock: any;

  beforeEach(() => {
    channel = new WebSocketChannel();
    
    serverMock = {
      to: vi.fn().mockReturnThis(),
      emit: vi.fn(),
    };
    
    channel.server = serverMock as unknown as Server;
  });

  const payload: NotificationPayload = {
    driverId: 'driver-123',
    missionId: 'm-1',
    title: 'test',
    body: 'body',
    data: { foo: 'bar' },
    recipientPreferences: {},
  };

  describe('canHandle', () => {
    it('always returns true', () => {
      expect(channel.canHandle(payload)).toBe(true);
    });
  });

  describe('send', () => {
    it('emits event to the driver room', async () => {
      await channel.send(payload);

      expect(serverMock.to).toHaveBeenCalledWith('driver:driver-123');
      expect(serverMock.emit).toHaveBeenCalledWith('mission_assigned', payload.data);
    });
  });

  describe('handleConnection', () => {
    it('disconnects if no auth header', () => {
      const clientMock = {
        handshake: { headers: {} },
        disconnect: vi.fn(),
      };

      channel.handleConnection(clientMock as unknown as Socket);

      expect(clientMock.disconnect).toHaveBeenCalled();
    });

    it('joins room if token is valid', () => {
      const payloadObj = { sub: 'driver-123' };
      const tokenStr = 'fakeHeader.' + Buffer.from(JSON.stringify(payloadObj)).toString('base64') + '.fakeSignature';

      const clientMock = {
        id: 'client-1',
        handshake: { headers: { authorization: `Bearer ${tokenStr}` } },
        join: vi.fn(),
        disconnect: vi.fn(),
      };

      channel.handleConnection(clientMock as unknown as Socket);

      expect(clientMock.disconnect).not.toHaveBeenCalled();
      expect(clientMock.join).toHaveBeenCalledWith('driver:driver-123');
    });

    it('disconnects if token payload is invalid', () => {
      const clientMock = {
        handshake: { headers: { authorization: `Bearer not-a-jwt` } },
        disconnect: vi.fn(),
      };

      channel.handleConnection(clientMock as unknown as Socket);

      expect(clientMock.disconnect).toHaveBeenCalled();
    });
  });
});
