// Import shared user types
import type { User, UserRole } from './user';

// Re-export for backward compatibility
export type { User, UserRole };

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
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
}