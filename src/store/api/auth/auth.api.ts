import { createApi } from '@reduxjs/toolkit/query/react';
import { rawBaseQuery } from '../baseApi';
import { logger } from '../../../services/logger/logger.service';
import { env } from '../../../config/env';
import TokenStorage from '../../../utils/TokenStorage';

/**
 * Login response type
 * After transformation, baseApi returns the data portion
 * In localStorage mode: { accessToken: string, refreshToken: string }
 * In cookie mode: {} (empty object)
 */
export type LoginRes = Record<string, never> | { accessToken: string; refreshToken: string };

/**
 * Logout response type
 * After transformation, baseApi returns the data portion (empty object {} for logout)
 */
export type LogoutRes = Record<string, never>;

export const authApi = createApi({
	reducerPath: 'authApi',
	baseQuery: rawBaseQuery,
	endpoints: builder => ({
		loginUser: builder.mutation<LoginRes, { email: string; password: string }>({
			query(data) {
				return {
					url: 'auth/login',
					method: 'post',
					body: data
				};
			},
			transformResponse: (response: unknown) => {
				// Since rawBaseQuery is used, we receive the full backend response structure:
				// { success: true, data: { accessToken, refreshToken }, message: string, timestamp: string }
				// In localStorage mode: Backend returns { success: true, data: { accessToken, refreshToken }, ... }
				// In cookie mode: Backend returns { success: true, data: {}, ... }
				if (typeof response === 'object' && response !== null) {
					const backendResponse = response as { success?: boolean; data?: { accessToken?: string; refreshToken?: string } };
					
					// If in localStorage mode and tokens are present, store them
					if (env.VITE_AUTH_MODE === 'localStorage' && backendResponse.success === true && backendResponse.data) {
						const { accessToken, refreshToken } = backendResponse.data;
						if (accessToken && refreshToken) {
							TokenStorage.setTokens(accessToken, refreshToken);
							return { accessToken, refreshToken } as LoginRes;
						}
					}
					// Cookie mode or no tokens: return empty object
					return {} as LoginRes;
				}
				logger.error('Login response validation failed', new Error('Invalid response type'), {
					response
				});
				throw new Error('Invalid login response structure');
			}
		}),

		logoutUser: builder.mutation<LogoutRes, void>({
			query: () => ({
				url: 'auth/logout',
				method: 'post',
				credentials: env.VITE_AUTH_MODE === 'cookie' ? 'include' : 'omit'
			}),
			transformResponse: (response: unknown) => {
				// Response is already transformed by baseApi
				// Backend returns: { success: true, data: {}, message: "Logged out successfully", timestamp: string }
				// After baseApi transformation: {} (empty object)
				if (typeof response === 'object' && response !== null) {
					// Clear tokens from storage (works for both cookie and localStorage modes)
					TokenStorage.clearTokens();
					return {} as LogoutRes;
				}
				logger.error('Logout response validation failed', new Error('Invalid response type'), {
					response
				});
				throw new Error('Invalid logout response structure');
			}
		})
	})
});

export const { useLoginUserMutation, useLogoutUserMutation } = authApi;
