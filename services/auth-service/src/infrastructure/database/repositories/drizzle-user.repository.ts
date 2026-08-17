import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import {
  type IUserRepository,
  type CreateCourierParams,
} from '../../../domain/ports/user-repository.port.js';
import { User } from '../../../domain/entities/user.entity.js';
import { Courier } from '../../../domain/entities/courier.entity.js';
import { DRIZZLE_DB, type DrizzleDb } from '../database.provider.js';
import { users, couriers } from '../schema.js';

@Injectable()
export class DrizzleUserRepository implements IUserRepository {
  constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDb) {}

  async findByEmail(email: string): Promise<User | null> {
    const record = await this.db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!record) return null;

    return new User({
      id: record.id,
      email: record.email,
      passwordHash: record.passwordHash,
      fullName: record.fullName,
      role: record.role,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  async findById(id: string): Promise<User | null> {
    const record = await this.db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!record) return null;

    return new User({
      id: record.id,
      email: record.email,
      passwordHash: record.passwordHash,
      fullName: record.fullName,
      role: record.role,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  async findCourierByUserId(userId: string): Promise<Courier | null> {
    const record = await this.db.query.couriers.findFirst({
      where: eq(couriers.userId, userId),
    });

    if (!record) return null;

    return new Courier({
      id: record.id,
      userId: record.userId,
      vehicleType: record.vehicleType,
      plateNumber: record.plateNumber,
      isVerified: record.isVerified,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  async saveCustomer(user: User): Promise<User> {
    const [saved] = await this.db
      .insert(users)
      .values({
        id: user.id,
        email: user.email,
        passwordHash: user.passwordHash,
        fullName: user.fullName,
        role: user.role,
      })
      .returning();

    return new User({
      id: saved.id,
      email: saved.email,
      passwordHash: saved.passwordHash,
      fullName: saved.fullName,
      role: saved.role,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    });
  }

  async saveCourier(
    user: User,
    courierParams: CreateCourierParams,
  ): Promise<{ user: User; courier: Courier }> {
    const courierId = `cur_${user.id.replace(/^usr_/, '')}`;

    const result = await this.db.transaction(async (tx) => {
      const [savedUser] = await tx
        .insert(users)
        .values({
          id: user.id,
          email: user.email,
          passwordHash: user.passwordHash,
          fullName: user.fullName,
          role: user.role,
        })
        .returning();

      const [savedCourier] = await tx
        .insert(couriers)
        .values({
          id: courierId,
          userId: savedUser.id,
          vehicleType: courierParams.vehicleType,
          plateNumber: courierParams.plateNumber,
          isVerified: false,
        })
        .returning();

      return {
        user: new User({
          id: savedUser.id,
          email: savedUser.email,
          passwordHash: savedUser.passwordHash,
          fullName: savedUser.fullName,
          role: savedUser.role,
          createdAt: savedUser.createdAt,
          updatedAt: savedUser.updatedAt,
        }),
        courier: new Courier({
          id: savedCourier.id,
          userId: savedCourier.userId,
          vehicleType: savedCourier.vehicleType,
          plateNumber: savedCourier.plateNumber,
          isVerified: savedCourier.isVerified,
          createdAt: savedCourier.createdAt,
          updatedAt: savedCourier.updatedAt,
        }),
      };
    });

    return result;
  }

  async findCourierById(courierId: string): Promise<Courier | null> {
    const record = await this.db.query.couriers.findFirst({
      where: eq(couriers.id, courierId),
    });

    if (!record) return null;

    return new Courier({
      id: record.id,
      userId: record.userId,
      vehicleType: record.vehicleType,
      plateNumber: record.plateNumber,
      isVerified: record.isVerified,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  async updateCourierVerification(courierId: string, isVerified: boolean): Promise<Courier | null> {
    const [updated] = await this.db
      .update(couriers)
      .set({
        isVerified,
        updatedAt: new Date(),
      })
      .where(eq(couriers.id, courierId))
      .returning();

    if (!updated) return null;

    return new Courier({
      id: updated.id,
      userId: updated.userId,
      vehicleType: updated.vehicleType,
      plateNumber: updated.plateNumber,
      isVerified: updated.isVerified,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    });
  }
}
