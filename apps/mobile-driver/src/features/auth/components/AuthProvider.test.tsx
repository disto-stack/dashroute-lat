import React, { useContext } from 'react';
import { Text, Button } from 'react-native';
import { render, waitFor, act, fireEvent } from '@testing-library/react-native';
import { AuthProvider, AuthContext, AuthContextType } from './AuthProvider';
import * as authService from '@/features/auth/services/auth.service';
import { getTokens, clearTokens } from '@/features/auth/services/token-storage';

jest.mock('@/features/auth/services/auth.service', () => ({
  getMe: jest.fn(),
  logout: jest.fn(),
}));

jest.mock('@/features/auth/services/token-storage', () => ({
  getTokens: jest.fn(),
  clearTokens: jest.fn(),
}));

const mockUser = {
  id: 'usr-123',
  fullName: 'John Doe',
  email: 'john@example.com',
  courierProfile: {
    id: 'cur-123',
    isVerified: true,
  },
};

let currentContextValue: AuthContextType | null = null;

function TestComponent() {
  const context = useContext(AuthContext);
  currentContextValue = context;
  
  if (!context) return <Text>No Context</Text>;
  
  return (
    <>
      <Text testID="loading">{context.isLoading.toString()}</Text>
      <Text testID="user">{context.user ? context.user.fullName : 'null'}</Text>
      <Button title="Login" onPress={() => context.setSession({ user: mockUser, accessToken: 'token', refreshToken: 'token' })} />
      <Button title="Logout" onPress={() => context.logout()} />
    </>
  );
}

const renderProvider = async () => {
  return await render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  );
};

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    currentContextValue = null;
  });

  it('starts in a loading state and resolves when no tokens exist', async () => {
    (getTokens as jest.Mock).mockResolvedValue({ accessToken: null, refreshToken: null });

    const { getByTestId } = await renderProvider();

    await waitFor(() => {
      expect(getByTestId('loading').props.children).toBe('false');
    });

    expect(authService.getMe).not.toHaveBeenCalled();
    expect(currentContextValue?.user).toBeNull();
  });

  it('restores session when tokens exist', async () => {
    (getTokens as jest.Mock).mockResolvedValue({ accessToken: 'valid-token', refreshToken: null });
    (authService.getMe as jest.Mock).mockResolvedValue(mockUser);

    const { getByTestId } = await renderProvider();

    await waitFor(() => {
      expect(getByTestId('loading').props.children).toBe('false');
    });

    expect(authService.getMe).toHaveBeenCalledTimes(1);
    expect(getByTestId('user').props.children).toBe('John Doe');
    expect(currentContextValue?.user).toEqual(mockUser);
  });

  it('handles setSession correctly', async () => {
    (getTokens as jest.Mock).mockResolvedValue({ accessToken: null, refreshToken: null });
    (authService.getMe as jest.Mock).mockResolvedValue(mockUser);

    const { getByTestId, getByText } = await renderProvider();

    await waitFor(() => {
      expect(getByTestId('loading').props.children).toBe('false');
    });

    await act(async () => {
      fireEvent.press(getByText('Login'));
    });

    expect(getByTestId('user').props.children).toBe('John Doe');
    expect(authService.getMe).toHaveBeenCalledTimes(1);
  });

  it('handles logout correctly', async () => {
    (getTokens as jest.Mock).mockResolvedValue({ accessToken: 'valid-token', refreshToken: null });
    (authService.getMe as jest.Mock).mockResolvedValue(mockUser);
    (authService.logout as jest.Mock).mockResolvedValue(undefined);

    const { getByTestId, getByText } = await renderProvider();

    await waitFor(() => {
      expect(getByTestId('loading').props.children).toBe('false');
    });

    expect(getByTestId('user').props.children).toBe('John Doe');

    await act(async () => {
      fireEvent.press(getByText('Logout'));
    });

    expect(authService.logout).toHaveBeenCalledTimes(1);
    expect(clearTokens).toHaveBeenCalledTimes(1);
    expect(getByTestId('user').props.children).toBe('null');
    expect(currentContextValue?.user).toBeNull();
  });
});
