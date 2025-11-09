/**
 * Error-related types
 */

/**
 * Error categories
 */
export type ErrorCategory = 'API' | 'VALIDATION' | 'NETWORK' | 'AUTHENTICATION' | 'SESSION' | 'UNKNOWN';

/**
 * Error severity levels
 */
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Structured error information
 */
export interface ErrorInfo {
	message: string;
	code?: string;
	category: ErrorCategory;
	severity: ErrorSeverity;
	statusCode?: number;
	stack?: string;
	timestamp: Date;
	context?: Record<string, unknown>;
	userInfo?: {
		id?: number;
		email?: string;
	};
	route?: string;
}

/**
 * API error details
 */
export interface ApiErrorDetails {
	status?: number;
	data?: {
		message?: string;
		msg?: string;
		errors?: Record<string, string[]>;
	};
	error?: string;
}

/**
 * Validation error details
 */
export interface ValidationError {
	field: string;
	message: string;
	value?: unknown;
}

/**
 * Error context for logging
 */
export interface ErrorContext {
	user?: {
		id?: number;
		email?: string;
	};
	route?: string;
	action?: string;
	additionalData?: Record<string, unknown>;
}
