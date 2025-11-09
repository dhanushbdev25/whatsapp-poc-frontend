/**
 * Logger type definitions
 */

/**
 * Log levels
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Log entry
 */
export interface LogEntry {
	level: LogLevel;
	message: string;
	timestamp: Date;
	category?: string;
	context?: Record<string, unknown>;
	error?: Error;
	stack?: string;
}

/**
 * Logger configuration
 */
export interface LoggerConfig {
	level: LogLevel;
	enableConsole: boolean;
	enableRemote?: boolean;
	remoteEndpoint?: string;
}

/**
 * Logger interface
 */
export interface ILogger {
	debug: (message: string, context?: Record<string, unknown>) => void;
	info: (message: string, context?: Record<string, unknown>) => void;
	warn: (message: string, context?: Record<string, unknown>) => void;
	error: (message: string, error?: Error | unknown, context?: Record<string, unknown>) => void;
	setLevel: (level: LogLevel) => void;
}
