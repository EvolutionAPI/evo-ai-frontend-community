import type { StandardResponse, PaginatedResponse, PaginationMeta } from '@/types/core';

// Team entity
export interface Team {
  id: string;
  name: string;
  description?: string;
  allow_auto_assign: boolean;
  is_member?: boolean; // Calculated field: if current user is a member
  members_count?: number;
  created_at?: string;
  updated_at?: string;
}

// Form data for creating/updating teams
export interface TeamFormData {
  name: string;
  description?: string;
  allow_auto_assign: boolean;
}

// API response types
export interface TeamsResponse extends PaginatedResponse<Team> {}

export interface TeamResponse extends StandardResponse<Team> {}

export interface TeamDeleteResponse extends StandardResponse<{ message: string }> {}

// Teams list parameters
export interface TeamsListParams {
  page?: number;
  per_page?: number;
  sort?: 'name' | 'created_at' | 'updated_at';
  order?: 'asc' | 'desc';
  q?: string; // search query
}

// Teams state for main component
export interface TeamsState {
  teams: Team[];
  selectedTeamIds: string[];
  meta: {
    pagination: PaginationMeta;
  };
  loading: {
    list: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
    import: boolean;
    export: boolean;
    bulk: boolean;
  };
  searchQuery: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

// Team member types
export interface TeamMember {
  id: string;
  user_id: string;
  team_id: string;
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
    thumbnail?: string;
    availability_status: string;
    role: string;
  };
}

// Import/Export types
export interface TeamImportParams {
  file: File;
}

export interface TeamExportParams {
  format: 'csv' | 'xlsx';
  fields: string[];
  includeFilters?: boolean;
  payload?: Record<string, unknown>;
}
