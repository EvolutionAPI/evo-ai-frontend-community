import type { PaginatedResponse } from '@/types/core';

export interface Customer {
  id: string;
  name: string;
  email: string;
  created_at: string;
  users_count?: number;
  agents_count?: number;
}

export interface ListCustomersResponse extends PaginatedResponse<Customer> {}

export interface CreateCustomerRequest {
  name: string;
  email: string;
  password?: string;
}

export interface UpdateCustomerRequest {
  name?: string;
  email?: string;
}
