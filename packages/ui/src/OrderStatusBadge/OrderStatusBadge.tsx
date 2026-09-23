import React from 'react';
import { OrderStatus } from '../types/order';
import { OrderStatusBadgeProps } from './OrderStatusBadge.types';
import styles from './OrderStatusBadge.module.css';

const STATUS: Record<OrderStatus, { label: string; tone: 'warning' | 'assigned' | 'route' | 'done' | 'cancelled' }> = {
  PENDING: { label: 'Pendiente', tone: 'warning' },
  ASSIGNED: { label: 'Asignada', tone: 'assigned' },
  ACCEPTED: { label: 'Aceptada', tone: 'assigned' },
  IN_TRANSIT: { label: 'En ruta', tone: 'route' },
  DELIVERED: { label: 'Entregada', tone: 'done' },
  CANCELLED: { label: 'Cancelada', tone: 'cancelled' },
};

export const OrderStatusBadge = ({ status }: OrderStatusBadgeProps) => {
  const st = STATUS[status];
  return (
    <span className={[styles.badge, styles[st.tone]].join(' ')}>
      <span className={styles.dot} />
      {st.label}
    </span>
  );
};
