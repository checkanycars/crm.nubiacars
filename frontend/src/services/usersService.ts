import axios from '../lib/axios';
import type {
  User,
  UserFormData,
  UsersResponse,
  UserResponse,
  UserStatisticsResponse,
  SalesListResponse,
  AssignableListResponse,
  BulkDeleteResponse,
  UserFilters,
} from '../types/user';

export const usersService = {
  /**
   * Get list of users with optional filters (Manager only)
   */
  async getUsers(filters?: UserFilters): Promise<UsersResponse> {
    const params = new URLSearchParams();

    if (filters?.search) params.append('search', filters.search);
    if (filters?.role) params.append('role', filters.role);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.sort_by) params.append('sort_by', filters.sort_by);
    if (filters?.sort_order) params.append('sort_order', filters.sort_order);
    if (filters?.per_page) params.append('per_page', filters.per_page.toString());
    if (filters?.page) params.append('page', filters.page.toString());

    const response = await axios.get<UsersResponse>(`/api/users?${params.toString()}`);
    return response.data;
  },

  /**
   * Get user statistics (Manager only)
   */
  async getUserStatistics(): Promise<UserStatisticsResponse> {
    const response = await axios.get<UserStatisticsResponse>('/api/users-statistics');
    return response.data;
  },

  /**
   * Get list of sales users for assignment dropdown
   */
  async getSalesList(): Promise<SalesListResponse> {
    const response = await axios.get<SalesListResponse>('/api/users-sales-list');
    return response.data;
  },

  /**
   * Get list of all assignable users (sales and managers) for lead assignment
   */
  async getAssignableList(): Promise<AssignableListResponse> {
    const response = await axios.get<AssignableListResponse>('/api/users-assignable-list');
    return response.data;
  },

  /**
   * Get a single user by ID
   */
  async getUser(userId: number): Promise<UserResponse> {
    const response = await axios.get<UserResponse>(`/api/users/${userId}`);
    return response.data;
  },

  /**
   * Create a new user (Manager only)
   */
  async createUser(data: UserFormData): Promise<UserResponse> {
    const response = await axios.post<UserResponse>('/api/users', data);
    return response.data;
  },

  /**
   * Update an existing user (Manager only)
   */
  async updateUser(userId: number, data: Partial<UserFormData>): Promise<UserResponse> {
    const response = await axios.put<UserResponse>(`/api/users/${userId}`, data);
    return response.data;
  },

  /**
   * Delete a user (Manager only)
   */
  async deleteUser(userId: number): Promise<{ message: string }> {
    const response = await axios.delete<{ message: string }>(`/api/users/${userId}`);
    return response.data;
  },

  /**
   * Bulk delete users (Manager only)
   */
  async bulkDeleteUsers(userIds: number[]): Promise<BulkDeleteResponse> {
    const response = await axios.post<BulkDeleteResponse>('/api/users-bulk-destroy', {
      user_ids: userIds,
    });
    return response.data;
  },

  /**
   * Helper function to get role badge styles
   */
  getRoleBadgeStyles(role: string): string {
    const styles: Record<string, string> = {
      manager: 'bg-purple-100 text-purple-800 border-purple-200',
      sales: 'bg-green-100 text-green-800 border-green-200',
      finance: 'bg-blue-100 text-blue-800 border-blue-200',
    };
    return styles[role] || 'bg-gray-100 text-gray-800 border-gray-200';
  },

  /**
   * Helper function to get status badge styles
   */
  getStatusBadgeStyles(status: string): string {
    const styles: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  },

  /**
   * Helper function to format last login time
   */
  formatLastLogin(lastLoginAt: string | null | undefined): string {
    if (!lastLoginAt) return 'Never';

    const date = new Date(lastLoginAt);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  },

  /**
   * Helper function to determine user status based on last login
   */
  getUserStatus(lastLoginAt: string | null | undefined): 'active' | 'inactive' {
    if (!lastLoginAt) return 'inactive';

    const date = new Date(lastLoginAt);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / 86400000);

    return diffInDays < 30 ? 'active' : 'inactive';
  },

  /**
   * Helper function to capitalize role name
   */
  formatRole(role: string): string {
    return role.charAt(0).toUpperCase() + role.slice(1);
  },
};