import { OrderStatus } from '../types/order';

export const TL_STEPS = [
  { key: 'received', label: 'Pedido recibido', doing: 'Buscando el repartidor más cercano' },
  { key: 'assigned', label: 'Repartidor asignado', doing: 'Va en camino al punto de recogida' },
  { key: 'picked', label: 'Pedido recogido', doing: 'Va en camino a tu dirección' },
  { key: 'delivered', label: 'Entregado', doing: 'Tu pedido llegó a su destino' },
] as const;

export const TL_INDEX: Partial<Record<OrderStatus, number>> = {
  PENDING: 0,
  ASSIGNED: 1,
  ACCEPTED: 1,
  IN_TRANSIT: 2,
  DELIVERED: 3,
};
