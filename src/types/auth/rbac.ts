import type { PaginatedResponse } from '@/types/core';

// Types for Role-Based Access Control (RBAC)

export interface RoleAction {
  key: string;
  name: string;
  description: string;
  resource: string;
  permission_key: string;
  system?: boolean; // Optional since it comes from configuration
}

export interface Role {
  id: string;
  key: string;
  name: string;
  description: string;
  system: boolean;
  type: 'user' | 'account';
  created_at: string;
  updated_at: string;
  permissions_count?: number;
  users_count?: number;
}

export interface RoleResponse extends PaginatedResponse<Role> {}

export interface RoleActionsResponse extends PaginatedResponse<RoleAction> {}

export interface RoleCreate {
  key: string;
  name: string;
  description?: string;
  system?: boolean;
  type: 'user' | 'account';
}

export interface RoleUpdate {
  key?: string;
  name?: string;
  description?: string;
  system?: boolean;
  type?: 'user' | 'account';
}

export interface RolePermission {
  id: string;
  role_id: string;
  role: Role; // Full role object for display
  permission_keys: string[]; // Array of permission keys in "resource.action" format
  permissions_by_resource: PermissionsByResource; // Organized by resource
  created_at: string;
  updated_at: string;
}

export interface RolePermissionCreate {
  role_id: string;
  permission_keys: string[]; // Permission keys in "resource.action" format
}

export interface RolePermissionUpdate {
  role_id?: string;
  permission_keys?: string[]; // Permission keys in "resource.action" format
}

// Types for displaying and filtering
export interface RoleFilters {
  search?: string;
  systemOnly?: boolean;
  type?: 'user' | 'account';
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface RoleActionFilters {
  search?: string;
  resource?: string;
  systemOnly?: boolean;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface RolePermissionFilters {
  search?: string;
  roleId?: string;
  resource?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

export interface PermissionsByResource {
  [resource: string]: string[]; // resource -> array of action keys
}

// API Response types
export interface RolePermissionsResponse extends PaginatedResponse<RolePermission> {}