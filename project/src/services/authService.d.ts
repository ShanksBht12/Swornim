export interface AuthCredentials {
  email: string;
  password: string;
}

export interface UserData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  userType: string;
  phone?: string;
}

export interface AuthResponse {
  token: string;
  user: any;
}

export interface CurrentUser {
  token: string;
  user: any;
}

export const authService: {
  login: (credentials: AuthCredentials) => Promise<AuthResponse>;
  signup: (userData: UserData) => Promise<any>;
  logout: () => void;
  getCurrentUser: () => CurrentUser | null;
  verifyToken: () => Promise<any>;
}; 