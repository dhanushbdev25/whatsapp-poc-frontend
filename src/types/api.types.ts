/**
 * API-related types
 * Matches backend response structure
 */

/**
 * Success response type matching backend format
 */
export interface SuccessResponse<T = unknown> {
	success: true;
	data?: T;
	message?: string;
	timestamp: string;
}

/**
 * Error response type matching backend format
 */
export interface ErrorResponse {
	success: false;
	message: string;
	errors?: Record<string, string[]>;
	timestamp: string;
}

/**
 * Generic API response wrapper (success or error)
 */
export type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;

/**
 * Paginated API response
 */
export interface PaginatedResponse<T> {
	data: T[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
	page?: number;
	pageSize?: number;
	sortBy?: string;
	sortOrder?: 'asc' | 'desc';
}

/**
 * API error response (for RTK Query compatibility)
 */
export interface ApiError {
	status?: number;
	data?:
		| ErrorResponse
		| {
				message?: string;
				msg?: string;
				errors?: Record<string, string[]>;
		  };
	error?: string;
}

/**
 * RTK Query error response
 */
export interface RtkQueryError {
	status: number;
	data?:
		| ErrorResponse
		| {
				message?: string;
				msg?: string;
				errors?: Record<string, string[]>;
		  };
	error?: string;
}

/**
 * Base query function arguments
 */
export type BaseQueryArgs =
	| string
	| {
			url: string;
			method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
			body?: unknown;
			headers?: Record<string, string>;
			params?: Record<string, string | number | boolean>;
	  };
