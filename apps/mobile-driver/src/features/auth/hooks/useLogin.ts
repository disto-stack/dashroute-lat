import { useMutation } from '@tanstack/react-query';
import * as authService from '../services/auth.service';
import { setTokens } from '../services/token-storage';
import { LoginCredentials, LoginResponse } from '../types';

export function useLogin(onSuccess?: (response: LoginResponse) => void) {
  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: async (data) => {
      await setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
      onSuccess?.(data);
    },
  });
}
