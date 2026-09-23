import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useLogin } from './useLogin';
import * as authService from '../services/auth.service';
import * as tokenStorage from '../services/token-storage';
import { LoginResponse } from '../types';

jest.mock('../services/auth.service');
jest.mock('../services/token-storage');

const loginResponse: LoginResponse = {
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
  user: { id: '1', email: 'courier@dashroute.com', fullName: 'Camila Ríos', role: 'COURIER' },
};

function renderUseLogin(onSuccess?: (response: LoginResponse) => void) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return renderHook(() => useLogin(onSuccess), { wrapper }); // renderHook is async in v14 — always await it
}

beforeEach(() => {
  jest.clearAllMocks();
});

test('persists tokens and calls onSuccess when login succeeds', async () => {
  (authService.login as jest.Mock).mockResolvedValue(loginResponse);
  const onSuccess = jest.fn();

  const { result } = await renderUseLogin(onSuccess);
  result.current.mutate({ email: 'courier@dashroute.com', password: 'secret' });

  await waitFor(() => expect(result.current.isSuccess).toBe(true));

  expect(authService.login).toHaveBeenCalledWith({
    email: 'courier@dashroute.com',
    password: 'secret',
  });
  expect(tokenStorage.setTokens).toHaveBeenCalledWith({
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
  });
  expect(onSuccess).toHaveBeenCalledWith(loginResponse);
});

test('does not persist tokens when login fails', async () => {
  (authService.login as jest.Mock).mockRejectedValue(new Error('Invalid credentials'));

  const { result } = await renderUseLogin();
  result.current.mutate({ email: 'courier@dashroute.com', password: 'wrong' });

  await waitFor(() => expect(result.current.isError).toBe(true));

  expect(tokenStorage.setTokens).not.toHaveBeenCalled();
});
