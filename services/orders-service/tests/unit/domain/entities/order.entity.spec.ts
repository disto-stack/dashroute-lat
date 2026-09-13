import { describe, it, expect } from 'vitest';
import { Order } from '../../../../src/domain/entities/order.entity.js';
import { InvalidStateTransitionException } from '../../../../src/domain/exceptions/invalid-state-transition.exception.js';

describe('Order Entity State Machine', () => {
  const createOrder = (status: 'PENDING' | 'ASSIGNED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED') =>
    new Order(
      'order-1',
      'customer-1',
      status,
      { lat: 10, lng: 10 },
      { lat: 11, lng: 11 },
      new Date(),
      new Date(),
    );

  it('should allow valid transition from PENDING to ASSIGNED', () => {
    const order = createOrder('PENDING');
    order.assignCourier('courier-123');

    expect(order.status).toBe('ASSIGNED');
    expect(order.courierId).toBe('courier-123');
  });

  it('should throw InvalidStateTransitionException when transitioning from DELIVERED to ASSIGNED', () => {
    const order = createOrder('DELIVERED');

    expect(() => order.assignCourier('courier-123')).toThrow(InvalidStateTransitionException);
  });

  it('should allow cancellation from PENDING or IN_TRANSIT', () => {
    const order1 = createOrder('PENDING');
    order1.cancel();
    expect(order1.status).toBe('CANCELLED');

    const order2 = createOrder('IN_TRANSIT');
    order2.cancel();
    expect(order2.status).toBe('CANCELLED');
  });

  it('should not allow transitions out of CANCELLED or DELIVERED', () => {
    const order = createOrder('CANCELLED');
    expect(() => order.markInTransit()).toThrow(InvalidStateTransitionException);
    expect(() => order.markDelivered()).toThrow(InvalidStateTransitionException);
  });
});
