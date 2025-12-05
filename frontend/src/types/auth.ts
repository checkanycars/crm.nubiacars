// User roles matching backend UserRole enum
export type UserRole = 'manager' | 'sales';

// User interface matching backend UserResource
export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at?: string;
  updated_at?: string;
}

// Login response from backend
export interface LoginResponse {
  message: string;
  user: User;
  access_token: string;
  token_type: string;
}

// Auth context type
export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
}