/**
 * Error-related constants
 */

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
	// Generic errors
	GENERIC: 'Something went wrong',
	NETWORK_ERROR: 'Network error. Please check your connection.',
	TIMEOUT_ERROR: 'Request timed out. Please try again.',
	UNKNOWN_ERROR: 'An unknown error occurred',

	// Authentication errors
	UNAUTHORIZED: 'You are not authorized to perform this action',
	FORBIDDEN: 'Access denied',
	SESSION_EXPIRED: 'Your session has expired. Please log in again.',
	INVALID_CREDENTIALS: 'Invalid email or password',

	// Validation errors
	VALIDATION_ERROR: 'Please fix the validation errors',
	REQUIRED_FIELD: 'This field is required',
	INVALID_EMAIL: 'Please enter a valid email address',
	INVALID_FORMAT: 'Invalid format',

	// API errors
	API_ERROR: 'API error occurred',
	NOT_FOUND: 'Resource not found',
	CONFLICT: 'A conflict occurred',
	SERVER_ERROR: 'Server error. Please try again later.',

	// Session errors
	SESSION_ERROR: 'Session error',
	INVALID_SESSION: 'Invalid session context structure'
} as const;

/**
 * Error codes
 */
export const ERROR_CODES = {
	// Network errors
	NETWORK_ERROR: 'NETWORK_ERROR',
	TIMEOUT: 'TIMEOUT',
	ABORTED: 'ABORTED',

	// HTTP errors
	BAD_REQUEST: 'BAD_REQUEST',
	UNAUTHORIZED: 'UNAUTHORIZED',
	FORBIDDEN: 'FORBIDDEN',
	NOT_FOUND: 'NOT_FOUND',
	CONFLICT: 'CONFLICT',
	UNPROCESSABLE_ENTITY: 'UNPROCESSABLE_ENTITY',
	INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',

	// Validation errors
	VALIDATION_ERROR: 'VALIDATION_ERROR',
	INVALID_INPUT: 'INVALID_INPUT',

	// Session errors
	SESSION_EXPIRED: 'SESSION_EXPIRED',
	INVALID_SESSION: 'INVALID_SESSION'
} as const;

/**
 * Error categories
 */
export const ERROR_CATEGORIES = {
	API: 'API',
	VALIDATION: 'VALIDATION',
	NETWORK: 'NETWORK',
	AUTHENTICATION: 'AUTHENTICATION',
	SESSION: 'SESSION',
	UNKNOWN: 'UNKNOWN'
} as const;
