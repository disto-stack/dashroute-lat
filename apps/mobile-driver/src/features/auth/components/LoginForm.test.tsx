import React from 'react';
import { render, screen, userEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginForm } from './LoginForm';
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

async function renderLoginForm(onSuccess = jest.fn()) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  await render(
    <QueryClientProvider client={queryClient}>
      <LoginForm onSuccess={onSuccess} />
    </QueryClientProvider>
  ); // render() is async in v14 — always await it
  return { onSuccess };
}

beforeEach(() => {
  jest.clearAllMocks();
});

test('shows field errors for an invalid email and empty password', async () => {
  const user = userEvent.setup();
  await renderLoginForm();

  await user.type(screen.getByPlaceholderText('nombre@empresa.com'), 'not-an-email');
  await user.press(screen.getByText('Iniciar sesión'));

  expect(await screen.findByText('Ingresa un correo válido')).toBeTruthy();
  expect(await screen.findByText('Ingresa tu contraseña')).toBeTruthy();
  expect(authService.login).not.toHaveBeenCalled();
});

test('submits valid credentials and calls onSuccess', async () => {
  (authService.login as jest.Mock).mockResolvedValue(loginResponse);
  const user = userEvent.setup();
  const { onSuccess } = await renderLoginForm();

  await user.type(screen.getByPlaceholderText('nombre@empresa.com'), 'courier@dashroute.com');
  await user.type(screen.getByPlaceholderText('••••••••'), 'secret');
  await user.press(screen.getByText('Iniciar sesión'));

  await waitFor(() =>
    expect(authService.login).toHaveBeenCalledWith({
      email: 'courier@dashroute.com',
      password: 'secret',
    })
  );
  await waitFor(() => expect(tokenStorage.setTokens).toHaveBeenCalled());
  expect(onSuccess).toHaveBeenCalledWith(loginResponse);
});

test('shows a banner (not a field error) on wrong credentials', async () => {
  (authService.login as jest.Mock).mockRejectedValue(new Error('Invalid credentials'));
  const user = userEvent.setup();
  await renderLoginForm();

  await user.type(screen.getByPlaceholderText('nombre@empresa.com'), 'courier@dashroute.com');
  await user.type(screen.getByPlaceholderText('••••••••'), 'wrong-password');
  await user.press(screen.getByText('Iniciar sesión'));

  expect(await screen.findByText('Correo o contraseña incorrectos.')).toBeTruthy();
});
