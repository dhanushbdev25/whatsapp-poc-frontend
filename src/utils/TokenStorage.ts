import { env } from '../config/env';
import Cookie from './Cookie';

/**
 * Token storage keys
 */
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

/**
 * Token storage utility that abstracts between cookie and localStorage
 * based on AUTH_MODE environment variable
 */
class TokenStorage {
	/**
	 * Get the access token
	 */
	static getAccessToken(): string | null {
		if (env.VITE_AUTH_MODE === 'localStorage') {
			return localStorage.getItem(ACCESS_TOKEN_KEY);
		}
		return Cookie.get(ACCESS_TOKEN_KEY);
	}

	/**
	 * Get the refresh token
	 */
	static getRefreshToken(): string | null {
		if (env.VITE_AUTH_MODE === 'localStorage') {
			return localStorage.getItem(REFRESH_TOKEN_KEY);
		}
		return Cookie.get(REFRESH_TOKEN_KEY);
	}

	/**
	 * Set both access and refresh tokens
	 */
	static setTokens(accessToken: string, refreshToken: string): void {
		if (env.VITE_AUTH_MODE === 'localStorage') {
			localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
			localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
		} else {
			// Cookie mode - In cookie mode, backend sets cookies automatically
			// This method is mainly for localStorage mode, but we keep it for consistency
			// If needed in cookie mode, cookies are set by the server response
		}
	}

	/**
	 * Clear both tokens
	 */
	static clearTokens(): void {
		if (env.VITE_AUTH_MODE === 'localStorage') {
			localStorage.removeItem(ACCESS_TOKEN_KEY);
			localStorage.removeItem(REFRESH_TOKEN_KEY);
		} else {
			// Cookie mode - use existing Cookie utility
			Cookie.removeToken();
		}
	}
}

export default TokenStorage;

