import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WebSocketChannel } from '../../../../src/channels/websocket/websocket.channel.js';
import { NotificationPayload } from '../../../../src/shared/types/notification-payload.type.js';
import { Socket, Server } from 'socket.io';
import * as jwt from 'jsonwebtoken';

vi.mock('jsonwebtoken', () => ({
  default: {
    verify: vi.fn(),
  },
  verify: vi.fn(),
}));

const mockLogger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
};

const mockConfigService = {
  get: vi.fn().mockReturnValue('test-secret'),
};

describe('WebSocketChannel', () => {
  let channel: WebSocketChannel;
  let serverMock: any;

  beforeEach(() => {
    vi.clearAllMocks();
    channel = new WebSocketChannel(mockLogger as any, mockConfigService as any);

    serverMock = {
      to: vi.fn().mockReturnThis(),
      emit: vi.fn(),
      use: vi.fn(),
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

  describe('afterInit (Middleware)', () => {
    it('registers a middleware', () => {
      channel.afterInit(serverMock);
      expect(serverMock.use).toHaveBeenCalled();
    });

    describe('middleware execution', () => {
      let middleware: any;

      beforeEach(() => {
        channel.afterInit(serverMock);
        middleware = serverMock.use.mock.calls[0][0];
      });

      it('calls next with error if no auth header', () => {
        const socketMock = { handshake: { headers: {} } };
        const nextMock = vi.fn();
        middleware(socketMock, nextMock);
        expect(nextMock).toHaveBeenCalledWith(expect.any(Error));
        expect(nextMock.mock.calls[0][0].message).toBe('Authentication token missing');
      });

      it('calls next with error if jwt.verify fails', () => {
        vi.mocked(jwt.verify).mockImplementationOnce(() => {
          throw new Error('invalid');
        });
        const socketMock = {
          handshake: { headers: { authorization: 'Bearer bad-token' } },
          id: '1',
        };
        const nextMock = vi.fn();
        middleware(socketMock, nextMock);
        expect(nextMock).toHaveBeenCalledWith(expect.any(Error));
        expect(nextMock.mock.calls[0][0].message).toBe('Invalid or expired authentication token');
      });

      it('populates socket.data.driverId and calls next if token is valid', () => {
        vi.mocked(jwt.verify).mockReturnValueOnce({ sub: 'driver-123' } as any);
        const socketMock = {
          handshake: { headers: { authorization: 'Bearer good-token' } },
          data: {},
        };
        const nextMock = vi.fn();
        middleware(socketMock, nextMock);
        expect((socketMock.data as any).driverId).toBe('driver-123');
        expect(nextMock).toHaveBeenCalledWith();
      });
    });
  });

  describe('handleConnection', () => {
    it('disconnects if no driverId in data (failsafe)', () => {
      const clientMock = {
        data: {},
        disconnect: vi.fn(),
      };

      channel.handleConnection(clientMock as unknown as Socket);

      expect(clientMock.disconnect).toHaveBeenCalled();
    });

    it('joins room using driverId from socket.data', () => {
      const clientMock = {
        id: 'client-1',
        data: { driverId: 'driver-123' },
        join: vi.fn(),
        disconnect: vi.fn(),
      };

      channel.handleConnection(clientMock as unknown as Socket);

      expect(clientMock.disconnect).not.toHaveBeenCalled();
      expect(clientMock.join).toHaveBeenCalledWith('driver:driver-123');
    });
  });
});
