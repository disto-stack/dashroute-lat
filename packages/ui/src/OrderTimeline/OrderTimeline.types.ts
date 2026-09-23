import { OrderStatus } from '../types/order';

export interface OrderTimelineProps {
  status: OrderStatus;
  /** Hora o texto por paso ya completado: received, assigned, picked, delivered. */
  times?: Partial<Record<'received' | 'assigned' | 'picked' | 'delivered', string>>;
  /** Texto bajo "Pedido cancelado". */
  note?: string;
}
