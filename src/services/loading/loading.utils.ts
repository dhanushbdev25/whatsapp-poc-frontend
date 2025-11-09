/**
 * Loading utility functions for simplified usage
 */

import { loadingService } from './loading.service';
import type { LoadingType } from './loading.types';

/**
 * Simple hook-like function to use loading with automatic cleanup
 * Returns a function to stop loading
 */
export const useLoadingState = (type: LoadingType = 'global', message?: string): (() => void) => {
	const loadingId = loadingService.start(type, message);
	return () => loadingService.stop(loadingId);
};

/**
 * Create a loading wrapper for async functions
 * Automatically handles loading state during async operation
 */
export const withLoading = async <T>(
	asyncFn: () => Promise<T>,
	type: LoadingType = 'global',
	message?: string
): Promise<T> => {
	const loadingId = loadingService.start(type, message);
	try {
		return await asyncFn();
	} finally {
		loadingService.stop(loadingId);
	}
};

/**
 * Check if any loading is active (simplified)
 */
export const isLoading = (): boolean => {
	return loadingService.isLoading();
};

/**
 * Check if specific loading type is active
 */
export const isLoadingType = (type: LoadingType): boolean => {
	return loadingService.isLoading(type);
};
