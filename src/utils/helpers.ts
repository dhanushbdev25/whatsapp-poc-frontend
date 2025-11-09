import { FieldErrors } from 'react-hook-form';
import { notificationService } from '../services/notifications/notification.service';
import { ERROR_MESSAGES } from '../constants';
import type { ErrorResponse } from '../types/api.types';

/**
 * Display error notification
 * Handles backend error format: { success: false, message: string, errors?: Record<string, string[]>, timestamp: string }
 */
export const displayError = (error: unknown) => {
	if (!error) return;

	if (typeof error === 'object' && error !== null && 'data' in error) {
		const errorData = (error as { data?: unknown }).data;

		if (errorData && typeof errorData === 'object' && 'success' in errorData && errorData.success === false) {
			const backendError = errorData as ErrorResponse;
			let errorMessage = backendError.message;

			// Include validation errors if present
			if (backendError.errors && Object.keys(backendError.errors).length > 0) {
				const validationMessages = Object.entries(backendError.errors)
					.flatMap(([field, messages]) => messages.map(msg => `${field}: ${msg}`))
					.join('\n');
				errorMessage =
					validationMessages.length > 200
						? `${backendError.message}\n\n${validationMessages.substring(0, 200)}...`
						: `${backendError.message}\n\n${validationMessages}`;
			}

			notificationService.error(errorMessage, 'Error');
			return;
		}
	}

	notificationService.error(ERROR_MESSAGES.GENERIC, 'Error');
};

export const displayValidationErrors = (errors: FieldErrors) => {
	const errorMessages: string[] = [];

	const extractErrors = (obj: Record<string, unknown>, path = ''): void => {
		Object.keys(obj).forEach(key => {
			const currentPath = path ? `${path}.${key}` : key;
			const value = obj[key];

			if (value && typeof value === 'object') {
				if ('message' in value && typeof value.message === 'string') {
					// This is a field error
					const friendlyPath = formatFieldPath(currentPath);
					errorMessages.push(`${friendlyPath}: ${value.message}`);
				} else {
					// This is a nested object, recurse
					extractErrors(value as Record<string, unknown>, currentPath);
				}
			}
		});
	};

	extractErrors(errors);

	if (errorMessages.length > 0) {
		const message =
			errorMessages.length === 1
				? errorMessages[0]
				: `Please fix the following errors:\n${errorMessages.map((msg, idx) => `${idx + 1}. ${msg}`).join('\n')}`;
		notificationService.error(message, 'Validation Errors');
	}
};

// Helper function to format field paths into user-friendly names
const formatFieldPath = (path: string): string => {
	// Convert camelCase to Title Case and replace dots with spaces
	return path
		.replace(/([A-Z])/g, ' $1') // Add space before capital letters
		.replace(/\./g, ' ') // Replace dots with spaces
		.replace(/^./, str => str.toUpperCase()) // Capitalize first letter
		.replace(/\b\w/g, l => l.toUpperCase()) // Capitalize each word
		.replace(/\s+/g, ' ') // Remove extra spaces
		.trim();
};

export const formatDate = (date: Date) => {
	const options: Intl.DateTimeFormatOptions = {
		month: 'long',
		year: 'numeric'
	};

	return new Date(date).toLocaleString('en-US', options).replace(/\s/g, '');
};

type dateDiff = {
	displayText: string;
	severity: string;
};

export const isNull = (value: string | undefined | null) => {
	return typeof value === 'undefined' || value === '' || value === null;
};

export const dateDifferentiator = (claimDateFromDB: Date): dateDiff => {
	// Current date
	const currentDate = new Date();

	// Calculate the difference in milliseconds between the current date and claim date
	const timeDifference = currentDate.getTime() - claimDateFromDB.getTime();

	// Convert milliseconds to hours and days
	const hoursDifference = Math.floor(timeDifference / (1000 * 3600));
	const daysDifference = Math.floor(timeDifference / (1000 * 3600 * 24));

	let severity = 'low';
	let displayText = '';
	if (daysDifference < 1) {
		displayText = `${hoursDifference} ${hoursDifference === 1 ? 'hour' : 'hours'} ago`;
	} else {
		displayText = `${daysDifference} ${daysDifference === 1 ? 'day' : 'days'} ago`;
	}
	if (daysDifference > 2 && daysDifference < 8) {
		severity = 'medium';
	}
	if (daysDifference > 8) {
		severity = 'high';
	}

	return {
		displayText,
		severity
	};
};

export const addPrecisionToNumber = (value: number, precision: number): string => {
	if (typeof value !== 'number' || isNaN(value)) {
		return '0';
	}

	if (typeof precision !== 'number' || isNaN(precision) || !Number.isInteger(precision) || precision < 0) {
		throw new Error('Precision must be a non-negative integer.');
	}

	return value.toFixed(precision);
};

export const addPrecisionToInteger = (value: number, precision: number) => {
	if (typeof value !== 'number' || isNaN(value) || !Number.isInteger(value)) {
		return 0;
	}

	if (typeof precision !== 'number' || isNaN(precision) || !Number.isInteger(precision) || precision < 0) {
		throw new Error('Precision must be a non-negative integer.');
	}

	const stringValue = value.toString();
	const decimalPart = '0'.repeat(precision);
	const result = `${stringValue}.${decimalPart}`;
	return result;
};

export const formatCurrency = (value: number, locale = 'en-US', currency = 'USD') => {
	if (typeof value !== 'number' || isNaN(value) || !Number.isInteger(value) || value <= 0) {
		return '-';
	}

	const formattedCurrency = new Intl.NumberFormat(locale, {
		style: 'currency',
		currency
	}).format(value);

	return formattedCurrency;
};

export function truncateString(text: string, maxLength: number) {
	if (text.length <= maxLength) {
		return text;
	} else {
		return text.slice(0, maxLength) + '...';
	}
}

/**
 * Extract error message from backend ErrorResponse format
 * Backend format: { success: false, message: string, errors?: Record<string, string[]>, timestamp: string }
 */
export function extractErrorMessage(err: unknown): string {
	if (err instanceof Error) return err.message;

	if (typeof err === 'object' && err !== null && 'data' in err) {
		const errorData = (err as { data?: unknown }).data;

		if (errorData && typeof errorData === 'object' && 'success' in errorData && errorData.success === false) {
			return (errorData as ErrorResponse).message;
		}
	}

	return 'Something went wrong';
}
