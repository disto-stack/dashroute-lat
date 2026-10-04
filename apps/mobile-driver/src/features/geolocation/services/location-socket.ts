import { PingPayload } from '../types';

const RECONNECT_DELAY_MS = 3000;

type RNWebSocketConstructor = new (
  url: string,
  protocols?: string | string[],
  options?: { headers?: Record<string, string> }
) => WebSocket;

const RNWebSocket = WebSocket as unknown as RNWebSocketConstructor;

export type AccessTokenProvider = () => Promise<string | null>;

export class LocationSocket {
  private socket: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private closedByClient = false;

  // The token is read on every (re)connection so a refreshed token is picked up.
  constructor(
    private readonly url: string,
    private readonly getAccessToken: AccessTokenProvider,
    private readonly onOpen?: () => void
  ) {}

  async connect(): Promise<void> {
    this.closedByClient = false;
    const accessToken = await this.getAccessToken();
    if (this.closedByClient || !accessToken) return;

    const socket = new RNWebSocket(this.url, undefined, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    this.socket = socket;

    socket.onopen = () => {
      this.onOpen?.();
    };

    socket.onclose = () => {
      this.socket = null;
      if (!this.closedByClient) {
        this.scheduleReconnect();
      }
    };

    socket.onerror = () => {};
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
      void this.connect();
    }, RECONNECT_DELAY_MS);
  }
}
