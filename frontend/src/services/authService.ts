import axios from '../lib/axios';
import type { LoginResponse, User } from '../types/auth';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const authService = {
  /**
   * Login user with email and password
   */
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    try {
      const response = await axios.post<LoginResponse>('/api/login', {
        email,
        password,
      });

      const { user, access_token } = response.data;

      // Store token and user data in localStorage
      this.setToken(access_token);
      this.setUser(user);

      return { user, token: access_token };
    } catch (error) {
      // Clear any stale data on login failure
      this.clearAuth();
      throw error;
    }
  },

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    try {
      // Call backend to revoke token
      await axios.post('/api/logout');
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with local logout even if API call fails
    } finally {
      this.clearAuth();
    }
  },

  /**
   * Check current authentication status
   */
  async checkAuth(): Promise<User | null> {
    const token = this.getToken();

    if (!token) {
      this.clearAuth();
      return null;
    }

    try {
      // Verify token with backend /api/me endpoint
      const response = await axios.get('/api/me');

      if (response.data?.user) {
        const user = response.data.user;
        this.setUser(user);
        return user;
      } else {
        // Invalid response, clear auth
        this.clearAuth();
        return null;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      this.clearAuth();
      return null;
    }
  },

  /**
   * Get current user from localStorage
   */
  getCurrentUser(): User | null {
    const userJson = localStorage.getItem(USER_KEY);
    if (!userJson) return null;

    try {
      return JSON.parse(userJson);
    } catch (error) {
      console.error('Failed to parse stored user:', error);
      this.clearAuth();
      return null;
    }
  },

  /**
   * Get stored token
   */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Set token in localStorage
   */
  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },

  /**
   * Set user in localStorage
   */
  setUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  /**
   * Clear all auth data from localStorage
   */
  clearAuth(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  /**
   * Check if user is authenticated (has token and user data)
   */
  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getCurrentUser();
  },
};