type Listener = (() => void) | null;

class FakeWebSocket {
  static instances: FakeWebSocket[] = [];
  static OPEN = 1;
  readyState = FakeWebSocket.OPEN;
  onopen: Listener = null;
  onclose: Listener = null;
  onerror: Listener = null;
  send = jest.fn();
  close = jest.fn();

  constructor(
    public url: string,
    public protocols?: string | string[],
    public options?: { headers?: Record<string, string> }
  ) {
    FakeWebSocket.instances.push(this);
  }
}

function loadLocationSocket() {
  (global as any).WebSocket = FakeWebSocket;
  let LocationSocket!: typeof import('./location-socket').LocationSocket;
  jest.isolateModules(() => {
    LocationSocket = require('./location-socket').LocationSocket;
  });
  return LocationSocket;
}

beforeEach(() => {
  FakeWebSocket.instances = [];
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

test('connects with the bearer token and notifies when open', async () => {
  const LocationSocket = loadLocationSocket();
  const onOpen = jest.fn();
  const socket = new LocationSocket('ws://x/ws', async () => 'token-1', onOpen);

  await socket.connect();

  expect(FakeWebSocket.instances).toHaveLength(1);
  expect(FakeWebSocket.instances[0].options).toEqual({ headers: { Authorization: 'Bearer token-1' } });
  FakeWebSocket.instances[0].onopen?.();
  expect(onOpen).toHaveBeenCalledTimes(1);
});

test('re-reads the token when it reconnects after a drop', async () => {
  const LocationSocket = loadLocationSocket();
  const getToken = jest.fn().mockResolvedValueOnce('token-1').mockResolvedValueOnce('token-2');
  const socket = new LocationSocket('ws://x/ws', getToken);

  await socket.connect();
  FakeWebSocket.instances[0].onclose?.();
  await jest.advanceTimersByTimeAsync(3000);

  expect(FakeWebSocket.instances).toHaveLength(2);
  expect(FakeWebSocket.instances[1].options).toEqual({ headers: { Authorization: 'Bearer token-2' } });
});

test('does not connect without a token', async () => {
  const LocationSocket = loadLocationSocket();
  const socket = new LocationSocket('ws://x/ws', async () => null);

  await socket.connect();

  expect(FakeWebSocket.instances).toHaveLength(0);
});

test('does not reconnect after being closed by the client', async () => {
  const LocationSocket = loadLocationSocket();
  const socket = new LocationSocket('ws://x/ws', async () => 'token-1');

  await socket.connect();
  socket.close();
  FakeWebSocket.instances[0].onclose?.();
  await jest.advanceTimersByTimeAsync(10_000);

  expect(FakeWebSocket.instances).toHaveLength(1);
});

test('does not connect if closed while waiting for the token', async () => {
  const LocationSocket = loadLocationSocket();
  let resolveToken!: (token: string) => void;
  const socket = new LocationSocket(
    'ws://x/ws',
    () => new Promise<string>((resolve) => (resolveToken = resolve))
  );

  const connecting = socket.connect();
  socket.close();
  resolveToken('token-1');
  await connecting;

  expect(FakeWebSocket.instances).toHaveLength(0);
});

test('only sends while the socket is open', async () => {
  const LocationSocket = loadLocationSocket();
  const socket = new LocationSocket('ws://x/ws', async () => 'token-1');
  const ping = { latitude: 1, longitude: 2, status: 'IDLE' as const };

  socket.send(ping);
  await socket.connect();
  socket.send(ping);

  expect(FakeWebSocket.instances[0].send).toHaveBeenCalledTimes(1);
  expect(FakeWebSocket.instances[0].send).toHaveBeenCalledWith(JSON.stringify(ping));
});
