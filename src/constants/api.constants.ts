/**
 * API-related constants
 */

/**
 * API timeout duration in milliseconds
 */
export const API_TIMEOUT = 30000; // 30 seconds

/**
 * API retry configuration
 */
export const API_RETRY_ATTEMPTS = 3;
export const API_RETRY_DELAY = 1000; // 1 second

/**
 * HTTP status codes
 */
export const HTTP_STATUS = {
	OK: 200,
	CREATED: 201,
	NO_CONTENT: 204,
	BAD_REQUEST: 400,
	UNAUTHORIZED: 401,
	FORBIDDEN: 403,
	NOT_FOUND: 404,
	CONFLICT: 409,
	UNPROCESSABLE_ENTITY: 422,
	INTERNAL_SERVER_ERROR: 500,
	BAD_GATEWAY: 502,
	SERVICE_UNAVAILABLE: 503
} as const;

/**
 * API endpoint paths
 */
export const API_ENDPOINTS = {
	AUTH: {
		LOGIN: 'auth/login',
		LOGOUT: 'auth/logout',
		REFRESH: 'auth/refresh'
	},
	SESSION: {
		CONTEXT: '/session'
	}
} as const;

/**
 * API headers
 */
export const API_HEADERS = {
	CONTENT_TYPE: 'Content-Type',
	APPLICATION_JSON: 'application/json',
	ACCEPT: 'Accept',
	AUTHORIZATION: 'Authorization'
} as const;

/**
 * Cache durations in seconds
 */
export const CACHE_DURATION = {
	SHORT: 60, // 1 minute
	MEDIUM: 300, // 5 minutes
	LONG: 1800, // 30 minutes
	VERY_LONG: 3600 // 1 hour
} as const;
