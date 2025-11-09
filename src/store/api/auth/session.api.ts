import { createApi } from '@reduxjs/toolkit/query/react';
import { sessionDataSchema, type SessionData } from '../../../schemas/session.schemas';
import { baseQuery } from '../baseApi';
import { logger } from '../../../services/logger/logger.service';
import { CACHE_DURATION } from '../../../constants';
import type { ErrorResponse } from '../../../types/api.types';

/**
 * Session data type (backward compatibility)
 */
export type sessionData = SessionData;

export const sessionApi = createApi({
	reducerPath: 'sessionApi',
	baseQuery,
	endpoints: builder => ({
		userSessionContext: builder.query<SessionData, null>({
			query: () => '/session',

			// Keep cached for 30 minutes
			keepUnusedDataFor: CACHE_DURATION.LONG,

			transformResponse: (response: unknown) => {
				// Response is already transformed by baseApi
				// Backend returns: { success: true, data: { id, name, email, roleId, roleName, permissions }, message: string, timestamp: string }
				// After baseApi transformation: { id, name, email, roleId, roleName, permissions }
				const parsed = sessionDataSchema.safeParse(response);
				if (!parsed.success) {
					logger.error('Session context validation failed', parsed.error, {
						response
					});
					throw new Error('Invalid session context structure');
				}
				return parsed.data;
			}
		})
	})
});

const { useUserSessionContextQuery } = sessionApi;

const useSessionContextQuery = (token: string | null) => {
	const query = useUserSessionContextQuery(null, {
		skip: !token,
		refetchOnMountOrArgChange: false,
		refetchOnReconnect: false
	});

	let errorMessage: string | undefined;

	if (query.error) {
		if ('status' in query.error && query.error.data && typeof query.error.data === 'object') {
			if ('success' in query.error.data && (query.error.data as { success: unknown }).success === false) {
				errorMessage = (query.error.data as ErrorResponse).message;
			} else {
				errorMessage = `Error ${query.error.status}`;
			}
		} else if ('message' in query.error) {
			errorMessage = query.error.message;
		}
	}

	return { ...query, errorMessage };
};

export { useSessionContextQuery };
