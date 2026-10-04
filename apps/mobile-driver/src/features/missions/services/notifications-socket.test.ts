import { NotificationsSocket } from './notifications-socket';
import { io } from 'socket.io-client';

jest.mock('socket.io-client', () => {
  const mSocket = {
    on: jest.fn(),
    disconnect: jest.fn(),
  };
  return {
    io: jest.fn(() => mSocket),
  };
});

describe('NotificationsSocket', () => {
  let notificationsSocket: NotificationsSocket;
  let mockOnMissionAssigned: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnMissionAssigned = jest.fn();
    notificationsSocket = new NotificationsSocket('https://api.test', 'token-123', mockOnMissionAssigned);
  });

  it('connects via socket.io with the correct parameters', () => {
    notificationsSocket.connect();
    
    expect(io).toHaveBeenCalledWith('https://api.test', {
      path: '/api/v1/notifications/ws',
      extraHeaders: {
        Authorization: 'Bearer token-123',
      },
      transports: ['websocket'],
    });
  });

  it('sets up event listeners on connect', () => {
    notificationsSocket.connect();
    const mSocket = (io as jest.Mock).mock.results[0].value;
    
    expect(mSocket.on).toHaveBeenCalledWith('connect', expect.any(Function));
    expect(mSocket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
    expect(mSocket.on).toHaveBeenCalledWith('mission_assigned', expect.any(Function));
  });

  it('triggers onMissionAssigned callback when mission_assigned event fires', () => {
    notificationsSocket.connect();
    const mSocket = (io as jest.Mock).mock.results[0].value;
    
    const missionAssignedCall = mSocket.on.mock.calls.find((call: unknown[]) => call[0] === 'mission_assigned');
    expect(missionAssignedCall).toBeDefined();
    
    const [, callback] = missionAssignedCall;
    const testData = { missionId: 'm1' };
    
    callback(testData);
    
    expect(mockOnMissionAssigned).toHaveBeenCalledWith(testData);
  });

  it('does not create multiple sockets on subsequent connect calls', () => {
    notificationsSocket.connect();
    notificationsSocket.connect();
    
    expect(io).toHaveBeenCalledTimes(1);
  });

  it('disconnects and clears socket on close', () => {
    notificationsSocket.connect();
    const mSocket = (io as jest.Mock).mock.results[0].value;
    
    notificationsSocket.close();
    
    expect(mSocket.disconnect).toHaveBeenCalled();
  });
});
