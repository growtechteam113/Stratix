// ============================================================================
// STRATIX AI - Shared Types
// ============================================================================

/**
 * User entity
 */
export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Tenant entity
 */
export interface Tenant {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * JWT Payload
 */
export interface JwtPayload {
  sub: string;
  email: string;
  tenantId: string;
  iat: number;
  exp: number;
}

/**
 * Auth DTOs
 */
export interface SignupDto {
  email: string;
  password: string;
  name?: string;
}

export interface SigninDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
  tenant: Tenant;
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Pagination
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Job status
 */
export enum JobStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface JobProgress {
  jobId: string;
  status: JobStatus;
  progress: number;
  message?: string;
  error?: string;
}
