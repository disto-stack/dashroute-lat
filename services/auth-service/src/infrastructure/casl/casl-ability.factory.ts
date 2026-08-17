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

export class UserSubject {
  id!: string;
  email!: string;
  role!: string;
}

export class CourierSubject {
  id!: string;
  userId!: string;
}

export type Subjects =
  InferSubjects<typeof UserSubject | typeof CourierSubject> | 'all' | 'User' | 'Courier';

export type AppAbility = MongoAbility<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: AuthenticatedUser): AppAbility {
    const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

    if (user.role === 'ADMIN') {
      can('manage', 'all');
    } else if (user.role === 'COURIER') {
      can('read', 'User');
      can('update', 'User');
      can('read', 'Courier');
      can('update', 'Courier');
    } else if (user.role === 'DISPATCHER') {
      can('read', 'User');
      can('read', 'Courier');
      can('update', 'Courier');
    } else {
      // CUSTOMER default
      can('read', 'User');
      can('update', 'User');
    }

    return build({
      detectSubjectType: (item) => {
        if (item instanceof UserSubject || (item as any)?.email) return 'User';
        if (item instanceof CourierSubject || (item as any)?.vehicleType) return 'Courier';
        return item as ExtractSubjectType<Subjects>;
      },
    });
  }
}
