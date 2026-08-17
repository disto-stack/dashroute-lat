import { type User } from '../entities/user.entity.js';
import { type Courier, type VehicleType } from '../entities/courier.entity.js';

export const USER_REPOSITORY_PORT = Symbol('USER_REPOSITORY_PORT');

export interface CreateCourierParams {
  userId: string;
  vehicleType: VehicleType;
  plateNumber: string | null;
}

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  findCourierById(courierId: string): Promise<Courier | null>;
  findCourierByUserId(userId: string): Promise<Courier | null>;
  saveCustomer(user: User): Promise<User>;
  saveCourier(user: User, courier: CreateCourierParams): Promise<{ user: User; courier: Courier }>;
  updateCourierVerification(courierId: string, isVerified: boolean): Promise<Courier | null>;
}
