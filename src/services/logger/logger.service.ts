/**
 * Logger service implementation
 */

import type { LogLevel, LogEntry, ILogger, LoggerConfig } from './logger.types';
import {
	shouldLog,
	formatLogEntry,
	extractStackTrace,
	normalizeError,
	getUserContext,
	getRouteContext
} from './logger.utils';
import { env } from '../../config/env';
import { ERROR_CATEGORIES } from '../../constants/error.constants';

/**
 * Logger service class
 */
class LoggerService implements ILogger {
	private config: LoggerConfig;

	constructor(config?: Partial<LoggerConfig>) {
		const logLevel = (env.VITE_LOG_LEVEL as LogLevel) || 'info';
		this.config = {
			level: logLevel,
			enableConsole: true,
			enableRemote: false,
			...config
		};
	}

	/**
	 * Log a debug message
	 */
	debug(message: string, context?: Record<string, unknown>): void {
		this.log('debug', message, undefined, context);
	}

	/**
	 * Log an info message
	 */
	info(message: string, context?: Record<string, unknown>): void {
		this.log('info', message, undefined, context);
	}

	/**
	 * Log a warning message
	 */
	warn(message: string, context?: Record<string, unknown>): void {
		this.log('warn', message, undefined, context);
	}

	/**
	 * Log an error message
	 */
	error(message: string, error?: Error | unknown, context?: Record<string, unknown>): void {
		const normalizedError = error ? normalizeError(error) : undefined;
		this.log('error', message, normalizedError, context);
	}

	/**
	 * Set the log level
	 */
	setLevel(level: LogLevel): void {
		this.config.level = level;
	}

	/**
	 * Internal log method
	 */
	private log(level: LogLevel, message: string, error?: Error, context?: Record<string, unknown>): void {
		if (!shouldLog(this.config.level, level)) {
			return;
		}

		const userContext = getUserContext();
		const routeContext = getRouteContext();

		const logEntry: LogEntry = {
			level,
			message,
			timestamp: new Date(),
			context: {
				...context,
				...(userContext && { user: userContext }),
				...(routeContext && { route: routeContext })
			},
			error,
			stack: error ? extractStackTrace(error) : undefined
		};

		if (this.config.enableConsole) {
			this.logToConsole(logEntry);
		}

		if (this.config.enableRemote && this.config.remoteEndpoint) {
			// Future: implement remote logging
			this.logToRemote(logEntry);
		}
	}

	/**
	 * Log to console
	 */
	private logToConsole(entry: LogEntry): void {
		const formatted = formatLogEntry(entry);

		switch (entry.level) {
			case 'debug':
				console.debug(formatted);
				break;
			case 'info':
				console.info(formatted);
				break;
			case 'warn':
				console.warn(formatted);
				break;
			case 'error':
				console.error(formatted);
				if (entry.error) {
					console.error(entry.error);
				}
				break;
		}
	}

	/**
	 * Log to remote endpoint (future implementation)
	 */
	private logToRemote(_entry: LogEntry): void {
		// Future: implement remote logging
		// This could send logs to a logging service like Sentry, LogRocket, etc.
	}
}

/**
 * Create logger instance
 */
export const createLogger = (config?: Partial<LoggerConfig>): ILogger => {
	return new LoggerService(config);
};

/**
 * Default logger instance
 */
export const logger = createLogger();

/**
 * Helper function to log API errors
 */
export const logApiError = (error: unknown, context?: Record<string, unknown>): void => {
	const errorMessage = error instanceof Error ? error.message : 'Unknown API error';
	logger.error(`API Error: ${errorMessage}`, error, {
		category: ERROR_CATEGORIES.API,
		...context
	});
};

/**
 * Helper function to log validation errors
 */
export const logValidationError = (errors: Record<string, unknown>, context?: Record<string, unknown>): void => {
	logger.warn('Validation errors occurred', {
		category: ERROR_CATEGORIES.VALIDATION,
		errors,
		...context
	});
};

/**
 * Helper function to log authentication errors
 */
export const logAuthError = (error: unknown, context?: Record<string, unknown>): void => {
	const errorMessage = error instanceof Error ? error.message : 'Unknown authentication error';
	logger.error(`Authentication Error: ${errorMessage}`, error, {
		category: ERROR_CATEGORIES.AUTHENTICATION,
		...context
	});
};
