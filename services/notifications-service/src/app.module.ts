import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { NotificationDispatcher } from './dispatcher/notification.dispatcher.js';
import { NOTIFICATION_CHANNELS } from './channels/notification-channel.interface.js';
import { DatabaseModule } from './database/database.module.js';
import { DevicesModule } from './devices/devices.module.js';
import { MissionAssignedConsumer } from './consumers/mission-assigned.consumer.js';
import { ExpoPushChannel } from './channels/push/expo-push.channel.js';
import { WebSocketChannel } from './channels/websocket/websocket.channel.js';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL || 'info',
        customProps: () => ({
          serviceName: 'notifications-service',
          environment: process.env.NODE_ENV || 'development',
        }),
        genReqId: (req) =>
          (req.headers['x-request-id'] as string) ||
          (req.headers['x-trace-id'] as string) ||
          crypto.randomUUID(),
      },
    }),
    DatabaseModule,
    DevicesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    NotificationDispatcher,
    MissionAssignedConsumer,
    ExpoPushChannel,
    WebSocketChannel,
    {
      provide: NOTIFICATION_CHANNELS,
      useFactory: (expoPushChannel: ExpoPushChannel, wsChannel: WebSocketChannel) => [
        expoPushChannel,
        wsChannel,
      ],
      inject: [ExpoPushChannel, WebSocketChannel],
    },
  ],
})
export class AppModule {}
