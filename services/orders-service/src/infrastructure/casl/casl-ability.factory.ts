import {
  AbilityBuilder,
  createMongoAbility,
  type MongoAbility,
  type ExtractSubjectType,
  type InferSubjects,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { type AuthenticatedUser } from '../http/guards/jwt-auth.guard.js';

export type Action = 'manage' | 'create' | 'read' | 'update' | 'delete';

export class OrderSubject {
  id!: string;
  customerId!: string;
  courierId!: string | null;
}

export type Subjects = InferSubjects<typeof OrderSubject> | 'all' | 'Order';

export type AppAbility = MongoAbility<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: AuthenticatedUser): AppAbility {
    const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

    if (user.role === 'ADMIN') {
      can('manage', 'all');
    } else if (user.role === 'CUSTOMER') {
      can('create', 'Order');
      can('read', 'Order', { customerId: user.id });
      can('update', 'Order', { customerId: user.id });
    } else if (user.role === 'COURIER') {
      can('read', 'Order', { courierId: user.id });
      can('update', 'Order', { courierId: user.id });
    }

    return build({
      detectSubjectType: (item) => {
        if (item instanceof OrderSubject || (item as any)?.customerId) return 'Order';
        return item as ExtractSubjectType<Subjects>;
      },
    });
  }
}
