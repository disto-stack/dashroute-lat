import { Injectable, Inject } from '@nestjs/common';
import { UserNotFoundException } from '../../domain/exceptions/domain.exceptions.js';
import {
  USER_REPOSITORY_PORT,
  type IUserRepository,
} from '../../domain/ports/user-repository.port.js';

@Injectable()
export class GetProfileUseCase {
  constructor(@Inject(USER_REPOSITORY_PORT) private readonly userRepo: IUserRepository) {}

  async execute(userId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new UserNotFoundException(userId);
    }

    let courierProfile: any = null;

    if (user.role !== 'COURIER') {
      return {
        ...user.toJSON(),
        courierProfile: undefined,
      };
    }

    const courier = await this.userRepo.findCourierByUserId(user.id);
    if (courier) {
      courierProfile = courier.toJSON();
    }

    return {
      ...user.toJSON(),
      courierProfile: courierProfile || undefined,
    };
  }
}
