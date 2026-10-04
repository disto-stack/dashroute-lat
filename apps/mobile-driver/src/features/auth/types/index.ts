export type CourierProfile = {
  id: string;
  vehicleType: string;
  plateNumber: string;
  isVerified: boolean;
};

export type User = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  courierId?: string;
  // Only returned by GET /auth/me (not by the login response).
  courierProfile?: CourierProfile;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type LoginResponse = AuthTokens & {
  user: User;
};
