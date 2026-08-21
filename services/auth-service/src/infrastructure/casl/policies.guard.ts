import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CaslAbilityFactory, type AppAbility } from './casl-ability.factory.js';
import { CHECK_POLICIES_KEY, type PolicyHandler } from './check-policies.decorator.js';
import { type AuthenticatedUser } from '../http/guards/jwt-auth.guard.js';

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    @Inject(Reflector) private reflector: Reflector,
    @Inject(CaslAbilityFactory) private caslAbilityFactory: CaslAbilityFactory,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policyHandlers =
      this.reflector.getAllAndOverride<PolicyHandler[]>(CHECK_POLICIES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) || [];

    if (policyHandlers.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<{ user?: AuthenticatedUser }>();
    if (!user) {
      throw new ForbiddenException('User context missing for policy evaluation');
    }

    const ability = this.caslAbilityFactory.createForUser(user);

    const hasPermission = policyHandlers.every((handler) =>
      this.execPolicyHandler(handler, ability),
    );

    if (!hasPermission) {
      throw new ForbiddenException('You are not allowed to perform this action');
    }

    return true;
  }

  private execPolicyHandler(handler: PolicyHandler, ability: AppAbility) {
    if (typeof handler === 'function') {
      return handler(ability);
    }
    return handler.handle(ability);
  }
}
