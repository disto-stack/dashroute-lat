export type VehicleType = 'BICYCLE' | 'MOTORCYCLE' | 'CAR' | 'VAN';

export interface CourierProps {
  id: string;
  userId: string;
  vehicleType: VehicleType;
  plateNumber: string | null;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Courier {
  constructor(private readonly props: CourierProps) {}

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get vehicleType(): VehicleType {
    return this.props.vehicleType;
  }

  get plateNumber(): string | null {
    return this.props.plateNumber;
  }

  get isVerified(): boolean {
    return this.props.isVerified;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  toJSON() {
    return {
      id: this.props.id,
      userId: this.props.userId,
      vehicleType: this.props.vehicleType,
      plateNumber: this.props.plateNumber,
      isVerified: this.props.isVerified,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
