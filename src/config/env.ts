import { z } from 'zod/v4';

/**
 * Environment variable schema with validation
 */
const envSchema = z.object({
	// Application Configuration
	VITE_APP_NAME: z.string().min(1, 'Application name is required'),
	API_BASE_URL: z.url('API_BASE_URL must be a valid URL').endsWith('/', 'API_BASE_URL must end with /'),
	API_BASE_URL_PRE_AUTH: z
		.string()
		.url('API_BASE_URL_PRE_AUTH must be a valid URL')
		.endsWith('/', 'API_BASE_URL_PRE_AUTH must end with /'),
	REDIRECT_URI: z
		.string()
		.url('REDIRECT_URI must be a valid URL')
		.optional()
		.default('http://localhost:5173/auth/login'),

	// Azure AD Configuration
	VITE_AZURE_CLIENT_ID: z.string().min(1, 'Azure Client ID is required'),

	// Environment
	NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

	// Feature Flags (Optional)
	VITE_ENABLE_ANALYTICS: z
		.string()
		.optional()
		.default('false')
		.transform(val => val === 'true'),
	VITE_ENABLE_PERFORMANCE_MONITORING: z
		.string()
		.optional()
		.default('true')
		.transform(val => val === 'true'),
	VITE_LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).optional().default('info'),

	// Authentication Mode
	VITE_AUTH_MODE: z
		.enum(['cookie', 'localStorage'])
		.optional()
		.default('cookie')
});

/**
 * Type for validated environment variables
 */
export type EnvConfig = z.infer<typeof envSchema>;

/**
 * Validates and parses environment variables
 */
function validateEnv(): EnvConfig {
	const rawEnv = {
		VITE_APP_NAME: import.meta.env.VITE_APP_NAME,
		API_BASE_URL: (import.meta.env.API_BASE_URL || process.env.API_BASE_URL) as string,
		API_BASE_URL_PRE_AUTH: (import.meta.env.API_BASE_URL_PRE_AUTH || process.env.API_BASE_URL_PRE_AUTH) as string,
		REDIRECT_URI: (import.meta.env.REDIRECT_URI || process.env.REDIRECT_URI) as string | undefined,
		VITE_AZURE_CLIENT_ID: import.meta.env.VITE_AZURE_CLIENT_ID,
		NODE_ENV: (import.meta.env.NODE_ENV || import.meta.env.MODE || process.env.NODE_ENV) as
			| 'development'
			| 'production'
			| 'test',
		VITE_ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS,
		VITE_ENABLE_PERFORMANCE_MONITORING: import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING,
		VITE_LOG_LEVEL: import.meta.env.VITE_LOG_LEVEL,
		VITE_AUTH_MODE: import.meta.env.VITE_AUTH_MODE
	};

	const result = envSchema.safeParse(rawEnv);

	if (!result.success) {
		const errorMessages = result.error.issues
			.map(err => `${err.path.map(String).join('.')}: ${err.message}`)
			.join('\n');
		throw new Error(`Environment variable validation failed:\n${errorMessages}`);
	}

	return result.data;
}

/**
 * Validated environment configuration
 * This will throw an error if validation fails on app startup
 */
export const env = validateEnv();

/**
 * Helper function to check if we're in development mode
 */
export const isDevelopment = (): boolean => env.NODE_ENV === 'development';

/**
 * Helper function to check if we're in production mode
 */
export const isProduction = (): boolean => env.NODE_ENV === 'production';

/**
 * Helper function to check if analytics is enabled
 */
export const isAnalyticsEnabled = (): boolean => env.VITE_ENABLE_ANALYTICS;

/**
 * Helper function to check if performance monitoring is enabled
 */
export const isPerformanceMonitoringEnabled = (): boolean => env.VITE_ENABLE_PERFORMANCE_MONITORING;
