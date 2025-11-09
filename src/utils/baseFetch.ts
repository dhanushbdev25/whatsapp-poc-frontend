import { env } from '../config/env';
import TokenStorage from './TokenStorage';

async function baseFetch(endpoint: string, controller: AbortController, token?: string) {
	const accessToken = token || TokenStorage.getAccessToken();
	if (!accessToken) {
		throw new Error('Missing authorization token');
	}

	const response = await fetch(`${env.API_BASE_URL}${endpoint}`, {
		signal: controller.signal,
		headers: {
			Authorization: `Bearer ${accessToken}`
		},
		credentials: env.VITE_AUTH_MODE === 'cookie' ? 'include' : 'omit'
	});

	if (!response.ok) {
		throw new Error(`Download failed. Status: ${response.status}`);
	}
	return response;
}

export default baseFetch;
