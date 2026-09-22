import { InvalidStateTransitionException } from '../exceptions/invalid-state-transition.exception.js';

export type OrderStatus = 'PENDING' | 'ASSIGNED' | 'ACCEPTED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';

export type TransitionActor = 'SYSTEM' | 'COURIER' | 'ANY';

export interface TransitionDefinition {
  allowedTo: OrderStatus[];
  actor: TransitionActor;
}

const TRANSITIONS: Record<OrderStatus, TransitionDefinition> = {
  PENDING: {
    allowedTo: ['ASSIGNED', 'CANCELLED'],
    actor: 'SYSTEM',
  },
  ASSIGNED: {
    allowedTo: ['ACCEPTED', 'PENDING', 'CANCELLED'],
    actor: 'COURIER',
  },
  ACCEPTED: {
    allowedTo: ['IN_TRANSIT', 'CANCELLED'],
    actor: 'COURIER',
  },
  IN_TRANSIT: {
    allowedTo: ['DELIVERED', 'CANCELLED'],
    actor: 'COURIER',
  },
  DELIVERED: {
    allowedTo: [],
    actor: 'ANY',
  },
  CANCELLED: {
    allowedTo: [],
    actor: 'ANY',
  },
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
    return TRANSITIONS[this.status].allowedTo.includes(targetStatus);
  }

  public getActorForCurrentState(): TransitionActor {
    return TRANSITIONS[this.status].actor;
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

  public acceptOrder(): void {
    this.transitionTo('ACCEPTED');
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

