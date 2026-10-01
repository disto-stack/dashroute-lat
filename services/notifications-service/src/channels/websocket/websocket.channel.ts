import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, Injectable } from '@nestjs/common';
import { NotificationChannel } from '../notification-channel.interface.js';
import { NotificationPayload } from '../../shared/types/notification-payload.type.js';

@Injectable()
@WebSocketGateway({ path: '/ws', cors: true })
export class WebSocketChannel implements NotificationChannel, OnGatewayConnection, OnGatewayDisconnect {
  readonly channelId = 'websocket';
  private readonly logger = new Logger(WebSocketChannel.name);

  @WebSocketServer()
  server!: Server;

  canHandle(notification: NotificationPayload): boolean {
    return true;
  }

  async send(notification: NotificationPayload): Promise<void> {
    const room = `driver:${notification.driverId}`;
    this.server.to(room).emit('mission_assigned', notification.data);
    this.logger.log(`Emitted mission_assigned to WebSocket room: ${room}`);
  }

  handleConnection(client: Socket) {
    try {
      const authHeader = client.handshake.headers.authorization || client.handshake.auth?.token;
      if (!authHeader) {
        this.logger.warn('WebSocket connection attempt without token');
        client.disconnect();
        return;
      }

      // Simplistic extraction for MVP (in production use complete JWT verification)
      const token = authHeader.replace('Bearer ', '');
      const payload = this.decodeJwtPayload(token);

      if (!payload || !payload.sub) {
        this.logger.warn('Invalid JWT payload in WebSocket connection');
        client.disconnect();
        return;
      }

      const driverId = payload.sub; // Assumes 'sub' contains the driver ID
      const room = `driver:${driverId}`;
      client.join(room);
      this.logger.log(`Client ${client.id} joined room ${room}`);
    } catch (err) {
      this.logger.error('Error handling WebSocket connection', err);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client ${client.id} disconnected`);
  }

  private decodeJwtPayload(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }
}
