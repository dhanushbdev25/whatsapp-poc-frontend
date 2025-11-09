/**
 * Application-wide constants
 */

/**
 * Route paths
 */
export const ROUTE_PATHS = {
	ROOT: '/',
	LOGIN: '/auth/login',
	NOT_FOUND: '/404',
	SESSION_ERROR: '/session-error'
} as const;

/**
 * Permission strings
 */
export const PERMISSIONS = {
	// Sample permissions - add more as needed
	LISTSAMPLE: 'LISTSAMPLE'
} as const;

/**
 * Application settings
 */
export const APP_SETTINGS = {
	DRAWER_WIDTH: 290,
	SESSION_CACHE_DURATION: 1800 // 30 minutes in seconds
} as const;

/**
 * Azure AD MSAL configuration
 */
export const MSAL_CONFIG = {
	AUTHORITY: 'https://login.microsoftonline.com/common',
	CACHE_LOCATION: 'sessionStorage' as const,
	STORE_AUTH_STATE_IN_COOKIE: false
} as const;

/**
 * Azure AD login request scopes
 */
export const LOGIN_REQUEST_SCOPES = ['User.Read'] as const;

/**
 * Azure AD login request prompt
 */
export const LOGIN_REQUEST_PROMPT = 'select_account' as const;
