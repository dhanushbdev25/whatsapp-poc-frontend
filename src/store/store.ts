// third-party
import { Middleware, configureStore, isRejectedWithValue } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

// project import
import appReducer from './reducers';
import { authApi } from './api/auth/auth.api';
import { sessionApi } from './api/auth/session.api';
import { logoutApp } from './reducers/actions';
import { logger, logApiError } from '../services/logger/logger.service';
import { notificationService } from '../services/notifications/notification.service';
import { ERROR_MESSAGES, HTTP_STATUS } from '../constants';
import type { ErrorResponse } from '../types/api.types';
import { isDevelopment } from '../config/env';
import { customerApi } from './api/customers/customer.api';

// ==============================|| REDUX TOOLKIT - MAIN STORE ||============================== //

/**
 * RTK Query error logger middleware
 * Logs errors, shows notifications, and dispatches logout on 401 errors
 */
export const rtkQueryErrorLogger: Middleware =
	({ dispatch }) =>
	next =>
	action => {
		if (isRejectedWithValue(action)) {
			const { status, data, error } =
				(action.payload as {
					status?: number;
					data?: ErrorResponse;
					error?: string;
				}) || {};

			// Extract error message from backend ErrorResponse format
			let errorMessage: string = ERROR_MESSAGES.SERVER_ERROR;
			let validationErrors: Record<string, string[]> | undefined;

			if (data && typeof data === 'object' && 'success' in data && data.success === false) {
				errorMessage = data.message;
				validationErrors = data.errors;
			} else if (error) {
				errorMessage = error;
			}

			// Log the error
			logApiError({ status, data, error }, { actionType: action.type, statusCode: status });

			if (status === HTTP_STATUS.UNAUTHORIZED) {
				dispatch(logoutApp());
				logger.warn('Session expired, logging out user', { statusCode: status });
				notificationService.error(ERROR_MESSAGES.SESSION_EXPIRED, 'Session Expired');
			} else {
				// Show error notification with validation errors if present
				if (validationErrors && Object.keys(validationErrors).length > 0) {
					const validationMessages = Object.entries(validationErrors)
						.flatMap(([field, messages]) => messages.map(msg => `${field}: ${msg}`))
						.join('\n');
					const message =
						validationMessages.length > 200
							? `${errorMessage}\n\n${validationMessages.substring(0, 200)}...`
							: `${errorMessage}\n\n${validationMessages}`;
					notificationService.error(message, 'Validation Error');
				} else {
					notificationService.error(errorMessage, 'Error');
				}
			}
		}
		return next(action);
	};

export const store = configureStore({
	reducer: appReducer,
	devTools: isDevelopment(),
	middleware: getDefaultMiddleware =>
		getDefaultMiddleware({
			serializableCheck: false
		}).concat([authApi.middleware, sessionApi.middleware,customerApi.middleware, rtkQueryErrorLogger] as Middleware[])
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
