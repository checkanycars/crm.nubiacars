// User roles matching backend UserRole enum
export type UserRole = 'manager' | 'sales';

// User status based on activity
export type UserStatus = 'active' | 'inactive';

// Base user interface matching backend UserResource
export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  target_price?: number | null;
  last_login_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

// User form data for creating/editing users
export interface UserFormData {
  name: string;
  email: string;
  password?: string;
  password_confirmation?: string;
  role: UserRole;
  target_price?: number | string;
}

// User statistics from backend
export interface UserStatistics {
  total_users: number;
  total_managers: number;
  total_sales: number;
  active_users: number;
  inactive_users: number;
  recent_users: number;
}

// API response types
export interface UsersResponse {
  users: User[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface UserResponse {
  user: User;
  message?: string;
}

export interface UserStatisticsResponse {
  statistics: UserStatistics;
}

export interface SalesListResponse {
  sales: User[];
  users?: User[];
}

export interface AssignableListResponse {
  users: User[];
}

export interface BulkDeleteResponse {
  message: string;
  deleted_count: number;
}

// Filter and sort options
export interface UserFilters {
  search?: string;
  role?: UserRole | '';
  status?: UserStatus | '';
  sort_by?: 'name' | 'email' | 'role' | 'created_at' | 'last_login_at';
  sort_order?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}