import { io, Socket } from 'socket.io-client';

export class NotificationsSocket {
  private socket: Socket | null = null;

  constructor(
    private readonly url: string,
    private readonly accessToken: string,
    private readonly onMissionAssigned: (data: any) => void
  ) {}

  connect(): void {
    if (this.socket) {
      return;
    }

    this.socket = io(this.url, {
      path: '/api/v1/notifications/ws',
      extraHeaders: {
        Authorization: `Bearer ${this.accessToken}`,
      },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('NotificationsSocket connected');
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('NotificationsSocket disconnected:', reason);
    });

    this.socket.on('mission_assigned', (data: any) => {
      console.log('Received mission_assigned event', data);
      this.onMissionAssigned(data);
    });
  }

  close(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}
