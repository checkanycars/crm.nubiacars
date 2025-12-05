import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Mock mode - set to true for testing without backend
const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_AUTH === 'true';

// Mock user for testing
const MOCK_USER: User = {
  id: 1,
  name: 'John Doe',
  email: 'admin@example.com',
  role: 'Administrator',
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    if (USE_MOCK_AUTH) {
      // Mock mode: Check localStorage for mock session
      const mockSession = localStorage.getItem('mock_user_session');
      if (mockSession) {
        setUser(JSON.parse(mockSession));
      } else {
        setUser(null);
      }
      setIsLoading(false);
      return;
    }

    // Real API call
    try {
      const response = await axios.get('/api/user');
      if (response.data?.user) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = (userData: User) => {
    setUser(userData);
    if (USE_MOCK_AUTH) {
      // Store mock session in localStorage
      localStorage.setItem('mock_user_session', JSON.stringify(userData));
    }
  };

  const logout = async () => {
    if (USE_MOCK_AUTH) {
      // Mock mode: Just clear localStorage
      localStorage.removeItem('mock_user_session');
      setUser(null);
      return;
    }

    // Real API call
    try {
      await axios.post('/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Export mock user for use in login
export { MOCK_USER, USE_MOCK_AUTH };

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}