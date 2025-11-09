/**
 * Logger utility functions
 */

import type { LogLevel, LogEntry } from './logger.types';

/**
 * Log level priority mapping
 */
const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
	debug: 0,
	info: 1,
	warn: 2,
	error: 3
};

/**
 * Check if a log level should be logged based on current level
 */
export const shouldLog = (currentLevel: LogLevel, messageLevel: LogLevel): boolean => {
	return LOG_LEVEL_PRIORITY[messageLevel] >= LOG_LEVEL_PRIORITY[currentLevel];
};

/**
 * Format log entry for console output
 */
export const formatLogEntry = (entry: LogEntry): string => {
	const timestamp = entry.timestamp.toISOString();
	const category = entry.category ? `[${entry.category}]` : '';
	const context = entry.context ? ` ${JSON.stringify(entry.context)}` : '';
	const error = entry.error ? `\nError: ${entry.error.message}` : '';
	const stack = entry.stack ? `\nStack: ${entry.stack}` : '';

	return `[${timestamp}] ${entry.level.toUpperCase()} ${category} ${entry.message}${context}${error}${stack}`;
};

/**
 * Extract stack trace from error
 */
export const extractStackTrace = (error: unknown): string | undefined => {
	if (error instanceof Error && error.stack) {
		return error.stack;
	}
	return undefined;
};

/**
 * Create error object from unknown error
 */
export const normalizeError = (error: unknown): Error => {
	if (error instanceof Error) {
		return error;
	}
	if (typeof error === 'string') {
		return new Error(error);
	}
	return new Error('Unknown error');
};

/**
 * Get current user info for logging context
 */
export const getUserContext = (): Record<string, unknown> | undefined => {
	// This can be enhanced to get actual user info from store/context
	// For now, return undefined
	return undefined;
};

/**
 * Get current route for logging context
 */
export const getRouteContext = (): string | undefined => {
	return window.location.pathname;
};
