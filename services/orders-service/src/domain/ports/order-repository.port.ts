import { type Order } from '../entities/order.entity.js';

export const ORDER_REPOSITORY_PORT = Symbol('ORDER_REPOSITORY_PORT');

export interface OrderSearchCriteria {
  customerId?: string;
  courierId?: string;
  status?: Order['status'];
}

export interface CursorPaginationParams {
  cursor?: string;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  nextCursor: string | null;
  hasNextPage: boolean;
}

export interface CreateOrderParams {
  customerId: string;
  status: Order['status'];
  pickupLocation: { lat: number; lng: number };
  dropoffLocation: { lat: number; lng: number };
}

export interface IOrderRepository {
  create(order: CreateOrderParams): Promise<Order>;
  findById(id: string): Promise<Order | null>;
  findByCustomerId(customerId: string): Promise<Order[]>;
  updateStatus(id: string, status: Order['status'], courierId?: string): Promise<Order>;
  search(criteria: OrderSearchCriteria, pagination: CursorPaginationParams): Promise<PaginatedResult<Order>>;
}
