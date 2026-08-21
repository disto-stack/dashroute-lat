import { describe, it, expect, beforeEach } from 'vitest';
import { CaslAbilityFactory } from '../../../src/infrastructure/casl/casl-ability.factory.js';
import { type AuthenticatedUser } from '../../../src/infrastructure/http/guards/jwt-auth.guard.js';

describe('CaslAbilityFactory (Unit)', () => {
  let factory: CaslAbilityFactory;

  beforeEach(() => {
    factory = new CaslAbilityFactory();
  });

  it('should grant manage all permissions to ADMIN', () => {
    const admin: AuthenticatedUser = {
      id: 'usr_admin',
      email: 'admin@dashroute.com',
      role: 'ADMIN',
    };

    const ability = factory.createForUser(admin);

    expect(ability.can('manage', 'all')).toBe(true);
    expect(ability.can('delete', 'User')).toBe(true);
    expect(ability.can('update', 'Courier')).toBe(true);
  });

  it('should restrict CUSTOMER permissions to read and self update', () => {
    const customer: AuthenticatedUser = {
      id: 'usr_cust',
      email: 'cust@dashroute.com',
      role: 'CUSTOMER',
    };

    const ability = factory.createForUser(customer);

    expect(ability.can('read', 'User')).toBe(true);
    expect(ability.can('update', 'User')).toBe(true);
    expect(ability.can('manage', 'all')).toBe(false);
    expect(ability.can('delete', 'Courier')).toBe(false);
  });

  it('should grant COURIER permissions to access courier profile', () => {
    const courier: AuthenticatedUser = {
      id: 'usr_cur',
      email: 'cur@dashroute.com',
      role: 'COURIER',
      courierId: 'cur_123',
    };

    const ability = factory.createForUser(courier);

    expect(ability.can('read', 'User')).toBe(true);
    expect(ability.can('read', 'Courier')).toBe(true);
    expect(ability.can('update', 'Courier')).toBe(true);
    expect(ability.can('delete', 'User')).toBe(false);
  });
});
