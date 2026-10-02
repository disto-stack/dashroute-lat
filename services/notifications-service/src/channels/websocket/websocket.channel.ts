import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import jwt from 'jsonwebtoken';
import { NotificationChannel } from '../notification-channel.interface.js';
import { NotificationPayload } from '../../shared/types/notification-payload.type.js';

@Injectable()
@WebSocketGateway({ path: '/ws', cors: true })
export class WebSocketChannel
  implements NotificationChannel, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  readonly channelId = 'websocket';

  @WebSocketServer()
  server!: Server;

  constructor(
    @InjectPinoLogger(WebSocketChannel.name)
    private readonly logger: PinoLogger,
    @Inject(ConfigService)
    private readonly configService: ConfigService,
  ) {}
  afterInit(server: Server) {
    const secret =
      this.configService.get<string>('JWT_SECRET') ||
      'dashroute-default-jwt-secret-replace-in-prod';

    server.use((socket, next) => {
      try {
        const authHeader =
          socket.handshake.headers.authorization || socket.handshake.auth?.token;
        if (!authHeader) {
          return next(new Error('Authentication token missing'));
        }

        const token = authHeader.replace('Bearer ', '');
        const payload = jwt.verify(token, secret) as any;

        if (!payload || !payload.sub) {
          return next(new Error('Invalid token payload'));
        }

        socket.data.driverId = payload.sub;

        next();
      } catch (err) {
        this.logger.warn(
          { clientId: socket.id, error: (err as Error).message },
          'WebSocket connection rejected due to invalid token',
        );
        
        next(new Error('Invalid or expired authentication token'));
      }
    });
  }

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
      const driverId = client.data.driverId;
      if (!driverId) {
        this.logger.warn({ clientId: client.id }, 'Missing driverId in client data after auth middleware');
        client.disconnect();
        return;
      }

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

}
