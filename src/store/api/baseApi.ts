import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { env } from '../../config/env';
import type { SuccessResponse, ErrorResponse, RtkQueryError } from '../../types/api.types';
import { logger, logApiError } from '../../services/logger/logger.service';
import { performanceMonitor } from '../../services/performance/performance.service';
import { loadingService } from '../../services/loading/loading.service';
import { HTTP_STATUS } from '../../constants';
import TokenStorage from '../../utils/TokenStorage';

/**
 * Raw base query for API calls
 */
export const rawBaseQuery = fetchBaseQuery({
	baseUrl: env.API_BASE_URL,
	credentials: env.VITE_AUTH_MODE === 'cookie' ? 'include' : 'omit',
	prepareHeaders: (headers) => {
		// Add Authorization header when in localStorage mode
		if (env.VITE_AUTH_MODE === 'localStorage') {
			const token = TokenStorage.getAccessToken();
			if (token) {
				headers.set('authorization', `Bearer ${token}`);
			}
		}
		return headers;
	}
});

/**
 * Transform backend response to RTK Query format
 * Backend format: { success: true, data?: T, message?: string, timestamp: string }
 *                { success: false, message: string, errors?: Record<string, string[]>, timestamp: string }
 */
const isBackendResponse = (response: unknown): response is SuccessResponse | ErrorResponse => {
	return (
		typeof response === 'object' &&
		response !== null &&
		'success' in response &&
		typeof (response as { success: unknown }).success === 'boolean'
	);
};

const transformErrorResponse = (errorResponse: ErrorResponse, status?: number): FetchBaseQueryError => {
	return {
		status: status || 400,
		data: errorResponse
	};
};

/**
 * Base query with automatic token refresh on 401, performance tracking, loading state management,
 * and backend response transformation
 */
export const baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
	args,
	api,
	extraOptions
) => {
	const url = typeof args === 'string' ? args : args.url;
	const measureId = performanceMonitor.startMeasure(`api-${url}`, 'api_call');
	const loadingId = loadingService.start('global');

	try {
		let result = await rawBaseQuery(args, api, extraOptions);

		// Transform backend response format
		if (result.data && isBackendResponse(result.data)) {
			if (result.data.success === false) {
				// Convert error response to RTK Query error
				result = {
					error: transformErrorResponse(result.data, HTTP_STATUS.BAD_REQUEST),
					data: undefined,
					meta: result.meta
				};
			} else {
				// Extract data from success response
				result.data = result.data.data ?? {};
			}
		}

		// Track API performance
		const duration = performanceMonitor.endMeasure(measureId);
		if (duration !== null) {
			logger.debug(`API call completed: ${url}`, {
				duration: `${duration.toFixed(2)}ms`,
				status: result.error ? result.error.status : 'success'
			});
		}

		// Handle 401 unauthorized - attempt token refresh
		if (result.error?.status === HTTP_STATUS.UNAUTHORIZED) {
			logger.info('Attempting token refresh', { url });
			
			// Prepare refresh request based on auth mode
			const refreshToken = TokenStorage.getRefreshToken();
			const refreshArgs: FetchArgs = 
				env.VITE_AUTH_MODE === 'localStorage' && refreshToken
					? {
							url: 'auth/refresh',
							method: 'POST',
							body: { refreshToken }
						}
					: 'auth/refresh';

			const refresh = await rawBaseQuery(refreshArgs, api, extraOptions);

			if (refresh.data && isBackendResponse(refresh.data)) {
				if (refresh.data.success === false) {
					logApiError(refresh.data, { url, action: 'token_refresh' });
				} else {
					// Store tokens if in localStorage mode
					if (env.VITE_AUTH_MODE === 'localStorage' && refresh.data.data) {
						const data = refresh.data.data as { accessToken?: string; refreshToken?: string };
						if (data.accessToken && data.refreshToken) {
							TokenStorage.setTokens(data.accessToken, data.refreshToken);
						}
					}

					logger.info('Token refresh successful, retrying request', { url });
					result = await rawBaseQuery(args, api, extraOptions);

					// Transform retry result
					if (result.data && isBackendResponse(result.data)) {
						if (result.data.success === false) {
							result = {
								error: transformErrorResponse(result.data, HTTP_STATUS.BAD_REQUEST),
								data: undefined,
								meta: result.meta
							};
						} else {
							result.data = result.data.data ?? {};
						}
					}
				}
			} else if (refresh.error) {
				logApiError(refresh.error, { url, action: 'token_refresh' });
			}
		}

		// Transform error if it's a backend error format
		if (result.error?.data && isBackendResponse(result.error.data) && result.error.data.success === false) {
			const statusCode = typeof result.error.status === 'number' ? result.error.status : 400;
			result.error = transformErrorResponse(result.error.data, statusCode);
		}

		if (result.error) {
			logApiError(result.error, {
				url,
				status: result.error.status
			});
		}

		return result;
	} catch (error) {
		const duration = performanceMonitor.endMeasure(measureId);
		logApiError(error, {
			url,
			duration: duration ? `${duration.toFixed(2)}ms` : undefined,
			action: 'api_call'
		});
		throw error;
	} finally {
		// Always stop loading, even on error
		loadingService.stop(loadingId);
	}
};

/**
 * Creates a prefixed base query for API endpoints with a specific prefix
 */
export const createPrefixedBaseQuery =
	(prefix: string): BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> =>
	async (args, api, extraOptions) => {
		const modifiedArgs = typeof args === 'string' ? `${prefix}${args}` : { ...args, url: `${prefix}${args.url}` };

		return baseQuery(modifiedArgs, api, extraOptions);
	};

/**
 * Type guard for RTK Query error
 */
export const isRtkQueryError = (error: unknown): error is RtkQueryError => {
	return (
		typeof error === 'object' &&
		error !== null &&
		'status' in error &&
		typeof (error as { status: unknown }).status === 'number'
	);
};
