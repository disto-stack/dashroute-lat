import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { tokens } from '@dashroute/ui-tokens';
import { Banner, Button, Input } from '@dashroute/ui';
import { useLogin } from '../hooks/useLogin';
import { loginSchema, LoginFormValues } from '../types/login.schema';
import { LoginResponse } from '../types';

type LoginFormProps = {
  onSuccess: (response: LoginResponse) => void;
};

export function LoginForm({ onSuccess }: LoginFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onTouched'
  });

  const { mutate, isPending, isError, reset: resetMutation } = useLogin(onSuccess);

  const onSubmit = (values: LoginFormValues) => {
    resetMutation();
    mutate(values);
  };

  return (
    <View style={styles.card}>
      {isError ? (
        <Banner tone="danger">Correo o contraseña incorrectos.</Banner>
      ) : null}

      <Controller
        control={control}
        name="email"
        render={({ field }) => (
          <Input
            label="Correo electrónico"
            type="email"
            placeholder="nombre@empresa.com"
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={errors.email?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field }) => (
          <Input
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={errors.password?.message}
          />
        )}
      />

      <Button icon="arrow" loading={isPending} onClick={handleSubmit(onSubmit)}>
        Iniciar sesión
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: tokens.spacing.space4,
    padding: tokens.spacing.space6,
    borderRadius: tokens.radius.xl,
    backgroundColor: tokens.colors.card,
    borderWidth: 1,
    borderColor: tokens.colors.line,
  },
});
