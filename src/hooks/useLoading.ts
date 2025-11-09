/**
 * Hook for using loading states
 */

import { useLoadingContext } from '../services/loading/LoadingProvider';
import { useCallback } from 'react';
import type { LoadingType } from '../types/loading.types';

/**
 * Hook to use loading service
 *
 * @example
 * // Simple usage - start/stop loading
 * const { startLoading, stopLoading, isLoading } = useLoading();
 * const handleSubmit = async () => {
 *   const id = startLoading('global');
 *   try {
 *     await apiCall();
 *   } finally {
 *     stopLoading(id);
 *   }
 * };
 *
 * @example
 * // Check loading state
 * const { isLoading, isGlobalLoading } = useLoading();
 * if (isLoading) return <Spinner />;
 *
 * @example
 * // Use with withLoading helper
 * import { withLoading } from '@services/loading/loading.utils';
 * const result = await withLoading(() => apiCall(), 'global');
 */
export const useLoading = () => {
	const context = useLoadingContext();

	/**
	 * Start loading and return cleanup function
	 * Useful with useEffect cleanup
	 */
	const useLoadingState = useCallback(
		(type: LoadingType = 'global', message?: string) => {
			const id = context.startLoading(type, message);
			return () => context.stopLoading(id);
		},
		[context]
	);

	return {
		// Loading state checks
		isLoading: context.isLoading,
		isGlobalLoading: context.isGlobalLoading,
		isInlineLoading: context.isInlineLoading,
		isButtonLoading: context.isButtonLoading,
		isOverlayLoading: context.isOverlayLoading,

		// Loading control
		startLoading: (type?: LoadingType, message?: string) => context.startLoading(type, message),
		stopLoading: (id: string) => context.stopLoading(id),
		stopAllLoading: () => context.stopAllLoading(),

		// Helper hook for automatic cleanup
		useLoadingState
	};
};
