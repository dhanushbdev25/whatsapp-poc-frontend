import { PublicClientApplication } from '@azure/msal-browser';
import { env } from './config/env';
import { APP_SETTINGS, MSAL_CONFIG, LOGIN_REQUEST_SCOPES, LOGIN_REQUEST_PROMPT } from './constants';

/**
 * Drawer width constant
 * @deprecated Use APP_SETTINGS.DRAWER_WIDTH instead
 */
export const drawerWidth = APP_SETTINGS.DRAWER_WIDTH;

/**
 * MSAL configuration
 */
export const msalConfig = {
	auth: {
		clientId: env.VITE_AZURE_CLIENT_ID,
		authority: MSAL_CONFIG.AUTHORITY
	},
	cache: {
		cacheLocation: MSAL_CONFIG.CACHE_LOCATION,
		storeAuthStateInCookie: MSAL_CONFIG.STORE_AUTH_STATE_IN_COOKIE
	}
};

/**
 * Login request configuration
 */
export const loginRequest = {
	scopes: LOGIN_REQUEST_SCOPES,
	prompt: LOGIN_REQUEST_PROMPT
};

/**
 * MSAL instance
 */
export const msalInstance = new PublicClientApplication(msalConfig);
