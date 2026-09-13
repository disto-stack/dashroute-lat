import { InvalidStateTransitionException } from '../exceptions/invalid-state-transition.exception.js';

export type OrderStatus = 'PENDING' | 'ASSIGNED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['IN_TRANSIT', 'PENDING', 'CANCELLED'],
  IN_TRANSIT: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
};

export class Order {
  constructor(
    public readonly id: string,
    public readonly customerId: string,
    public status: OrderStatus,
    public readonly pickupLocation: { lat: number; lng: number },
    public readonly dropoffLocation: { lat: number; lng: number },
    public readonly createdAt: Date,
    public updatedAt: Date,
    public courierId: string | null = null,
  ) {}

  public canTransitionTo(targetStatus: OrderStatus): boolean {
    return ALLOWED_TRANSITIONS[this.status].includes(targetStatus);
  }

  public transitionTo(targetStatus: OrderStatus): void {
    if (!this.canTransitionTo(targetStatus)) {
      throw new InvalidStateTransitionException(this.status, targetStatus);
    }
    this.status = targetStatus;
    this.updatedAt = new Date();
  }

  public assignCourier(courierId: string): void {
    this.transitionTo('ASSIGNED');
    this.courierId = courierId;
  }

  public markInTransit(): void {
    this.transitionTo('IN_TRANSIT');
  }

  public markDelivered(): void {
    this.transitionTo('DELIVERED');
  }

  public cancel(): void {
    this.transitionTo('CANCELLED');
  }
}
