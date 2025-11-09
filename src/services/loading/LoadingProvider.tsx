/**
 * Loading Provider component
 */

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { LoadingState, LoadingContextValue, LoadingType } from './loading.types';
import { loadingService } from './loading.service';

/**
 * Loading context
 */
const LoadingContext = createContext<LoadingContextValue | undefined>(undefined);

/**
 * Loading Provider props
 */
interface LoadingProviderProps {
	children: ReactNode;
}

/**
 * Loading Provider component
 */
export const LoadingProvider = ({ children }: LoadingProviderProps) => {
	const [loadingStates, setLoadingStates] = useState<LoadingState[]>(() => loadingService.getLoadingStates());

	useEffect(() => {
		// Subscribe to loading state changes
		const unsubscribe = loadingService.subscribe(setLoadingStates);

		return unsubscribe;
	}, []);

	const isLoading = loadingStates.length > 0;
	const isGlobalLoading = loadingStates.some(state => state.type === 'global');
	const isInlineLoading = loadingStates.some(state => state.type === 'inline');
	const isButtonLoading = loadingStates.some(state => state.type === 'button');
	const isOverlayLoading = loadingStates.some(state => state.type === 'overlay');

	const startLoading = useCallback((type?: LoadingType, message?: string) => {
		return loadingService.start(type || 'global', message);
	}, []);

	const stopLoading = useCallback((id: string) => {
		loadingService.stop(id);
	}, []);

	const stopAllLoading = useCallback(() => {
		loadingService.stopAll();
	}, []);

	const value: LoadingContextValue = {
		isLoading,
		isGlobalLoading,
		isInlineLoading,
		isButtonLoading,
		isOverlayLoading,
		startLoading,
		stopLoading,
		stopAllLoading
	};

	return <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>;
};

/**
 * Hook to use loading context
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useLoadingContext = (): LoadingContextValue => {
	const context = useContext(LoadingContext);
	if (!context) {
		throw new Error('useLoadingContext must be used within LoadingProvider');
	}
	return context;
};
