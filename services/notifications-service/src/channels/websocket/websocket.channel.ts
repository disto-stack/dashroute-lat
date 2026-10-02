import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { NotificationChannel } from '../notification-channel.interface.js';
import { NotificationPayload } from '../../shared/types/notification-payload.type.js';

@Injectable()
@WebSocketGateway({ path: '/ws', cors: true })
export class WebSocketChannel
  implements NotificationChannel, OnGatewayConnection, OnGatewayDisconnect
{
  readonly channelId = 'websocket';

  @WebSocketServer()
  server!: Server;

  constructor(
    @InjectPinoLogger(WebSocketChannel.name)
    private readonly logger: PinoLogger,
  ) {}

  canHandle(_notification: NotificationPayload): boolean {
    return true;
  }

  async send(notification: NotificationPayload): Promise<void> {
    const userId = notification.driverId.replace(/^cur_/, 'usr_');
    const room = `driver:${userId}`;
    this.server.to(room).emit('mission_assigned', notification.data);
    this.logger.info(
      { room, driverId: notification.driverId, userId },
      'Emitted mission_assigned via WebSocket',
    );
  }

  handleConnection(client: Socket) {
    try {
      const authHeader = client.handshake.headers.authorization || client.handshake.auth?.token;
      if (!authHeader) {
        this.logger.warn({ clientId: client.id }, 'WebSocket connection attempt without token');
        client.disconnect();
        return;
      }

      // Simplistic extraction for MVP (in production use complete JWT verification)
      const token = authHeader.replace('Bearer ', '');
      const payload = this.decodeJwtPayload(token);

      if (!payload || !payload.sub) {
        this.logger.warn({ clientId: client.id }, 'Invalid JWT payload in WebSocket connection');
        client.disconnect();
        return;
      }

      const driverId = payload.sub; // Assumes 'sub' contains the driver ID
      const room = `driver:${driverId}`;
      client.join(room);
      this.logger.info({ clientId: client.id, room }, 'WebSocket client joined room');
    } catch (err) {
      this.logger.error((err as Error).stack, 'Error handling WebSocket connection');
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.info({ clientId: client.id }, 'WebSocket client disconnected');
  }

  private decodeJwtPayload(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }
}
