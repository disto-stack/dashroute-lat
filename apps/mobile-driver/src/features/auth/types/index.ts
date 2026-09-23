export type User = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  courierId?: string;
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
