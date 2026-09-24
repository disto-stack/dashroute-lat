import { PingPayload } from '../types';

const RECONNECT_DELAY_MS = 3000;

type RNWebSocketConstructor = new (
  url: string,
  protocols?: string | string[],
  options?: { headers?: Record<string, string> }
) => WebSocket;

const RNWebSocket = WebSocket as unknown as RNWebSocketConstructor;

export class LocationSocket {
  private socket: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private closedByClient = false;

  constructor(
    private readonly url: string,
    private readonly accessToken: string
  ) {}

  connect(): void {
    this.closedByClient = false;
    this.socket = new RNWebSocket(this.url, undefined, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });

    this.socket.onclose = () => {
      this.socket = null;
      if (!this.closedByClient) {
        this.scheduleReconnect();
      }
    };

    this.socket.onerror = () => {
      // onclose still fires after onerror for the RN WebSocket polyfill,
      // so reconnect scheduling stays centralized there.
    };
  }

  send(payload: PingPayload): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(payload));
    }
  }

  close(): void {
    this.closedByClient = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.socket?.close();
    this.socket = null;
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, RECONNECT_DELAY_MS);
  }
}
