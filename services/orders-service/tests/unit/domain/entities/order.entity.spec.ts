import { describe, it, expect } from 'vitest';
import { Order, type OrderStatus } from '../../../../src/domain/entities/order.entity.js';
import { InvalidStateTransitionException } from '../../../../src/domain/exceptions/invalid-state-transition.exception.js';

describe('Order Entity State Machine', () => {
  const createOrder = (status: OrderStatus) =>
    new Order(
      'order-1',
      'customer-1',
      status,
      { lat: 10, lng: 10 },
      { lat: 11, lng: 11 },
      new Date(),
      new Date(),
      status !== 'PENDING' ? 'courier-123' : null,
    );

  it('should allow valid lifecycle flow PENDING -> ASSIGNED -> ACCEPTED -> IN_TRANSIT -> DELIVERED', () => {
    const order = createOrder('PENDING');

    order.assignCourier('courier-123');
    expect(order.status).toBe('ASSIGNED');
    expect(order.courierId).toBe('courier-123');

    order.acceptOrder();
    expect(order.status).toBe('ACCEPTED');

    order.markInTransit();
    expect(order.status).toBe('IN_TRANSIT');

    order.markDelivered();
    expect(order.status).toBe('DELIVERED');
  });

  it('should throw InvalidStateTransitionException when transitioning from ASSIGNED directly to IN_TRANSIT without ACCEPTED', () => {
    const order = createOrder('ASSIGNED');
    expect(() => order.markInTransit()).toThrow(InvalidStateTransitionException);
  });

  it('should throw InvalidStateTransitionException when transitioning from DELIVERED to ASSIGNED', () => {
    const order = createOrder('DELIVERED');
    expect(() => order.assignCourier('courier-123')).toThrow(InvalidStateTransitionException);
  });

  it('should allow cancellation from PENDING, ASSIGNED, ACCEPTED, or IN_TRANSIT', () => {
    const statuses: OrderStatus[] = ['PENDING', 'ASSIGNED', 'ACCEPTED', 'IN_TRANSIT'];
    statuses.forEach((status) => {
      const order = createOrder(status);
      order.cancel();
      expect(order.status).toBe('CANCELLED');
    });
  });

  it('should not allow transitions out of CANCELLED or DELIVERED', () => {
    const cancelledOrder = createOrder('CANCELLED');
    expect(() => cancelledOrder.acceptOrder()).toThrow(InvalidStateTransitionException);
    expect(() => cancelledOrder.markInTransit()).toThrow(InvalidStateTransitionException);
    expect(() => cancelledOrder.markDelivered()).toThrow(InvalidStateTransitionException);

    const deliveredOrder = createOrder('DELIVERED');
    expect(() => deliveredOrder.acceptOrder()).toThrow(InvalidStateTransitionException);
  });

  it('should return correct actor for current state', () => {
    expect(createOrder('PENDING').getActorForCurrentState()).toBe('SYSTEM');
    expect(createOrder('ASSIGNED').getActorForCurrentState()).toBe('COURIER');
    expect(createOrder('ACCEPTED').getActorForCurrentState()).toBe('COURIER');
    expect(createOrder('IN_TRANSIT').getActorForCurrentState()).toBe('COURIER');
    expect(createOrder('DELIVERED').getActorForCurrentState()).toBe('ANY');
    expect(createOrder('CANCELLED').getActorForCurrentState()).toBe('ANY');
  });
});

