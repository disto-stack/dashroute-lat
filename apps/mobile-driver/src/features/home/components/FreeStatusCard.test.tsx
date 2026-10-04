import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { FreeStatusCard } from './FreeStatusCard';

test('shows the searching state when available', async () => {
  await render(<FreeStatusCard firstName="Andrés" available canGoOnline />);

  expect(screen.getByText('Hola, Andrés')).toBeOnTheScreen();
  expect(screen.getByText('Disponible')).toBeOnTheScreen();
  expect(screen.getByText('Buscando nuevas rutas…')).toBeOnTheScreen();
  expect(screen.getByText('Sin misión asignada')).toBeOnTheScreen();
});

test('shows the out-of-service state when the courier switched off', async () => {
  await render(<FreeStatusCard firstName="Andrés" available={false} canGoOnline />);

  expect(screen.getByText('Inactivo')).toBeOnTheScreen();
  expect(screen.getByText('Fuera de servicio')).toBeOnTheScreen();
  expect(screen.getByText('Actívate desde tu perfil.')).toBeOnTheScreen();
});

test('explains the verification state instead of asking to switch on', async () => {
  await render(<FreeStatusCard firstName="Andrés" available={false} canGoOnline={false} />);

  expect(screen.getByText('Cuenta en verificación')).toBeOnTheScreen();
  expect(screen.queryByText('Actívate desde tu perfil.')).toBeNull();
});
