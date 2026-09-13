import { describe, it, expect } from 'vitest';
import { CaslAbilityFactory } from '../../../../src/infrastructure/casl/casl-ability.factory.js';
import { type AuthenticatedUser } from '../../../../src/infrastructure/http/guards/jwt-auth.guard.js';

describe('CaslAbilityFactory', () => {
  const factory = new CaslAbilityFactory();

  const ownOrder = { customerId: 'cust-123', courierId: null };
  const otherOrder = { customerId: 'cust-999', courierId: 'courier-888' };

  it('should grant full permissions (manage all) to ADMIN', () => {
    const admin: AuthenticatedUser = { id: 'admin-1', email: 'admin@test.com', role: 'ADMIN' };
    const ability = factory.createForUser(admin);

    expect(ability.can('create', 'Order')).toBe(true);
    expect(ability.can('read', otherOrder as any)).toBe(true);
    expect(ability.can('delete', otherOrder as any)).toBe(true);
  });

  it('should grant CUSTOMER permission only for their own orders', () => {
    const customer: AuthenticatedUser = { id: 'cust-123', email: 'user@test.com', role: 'CUSTOMER' };
    const ability = factory.createForUser(customer);

    expect(ability.can('create', 'Order')).toBe(true);
    expect(ability.can('read', ownOrder as any)).toBe(true);
    expect(ability.can('read', otherOrder as any)).toBe(false);
  });

  it('should grant COURIER permission only for assigned orders', () => {
    const courier: AuthenticatedUser = { id: 'courier-888', email: 'courier@test.com', role: 'COURIER' };
    const ability = factory.createForUser(courier);

    expect(ability.can('read', otherOrder as any)).toBe(true);
    expect(ability.can('read', ownOrder as any)).toBe(false);
    expect(ability.can('create', 'Order')).toBe(false);
  });
});
