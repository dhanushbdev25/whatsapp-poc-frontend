/**
 * Loading service implementation
 */

import type { LoadingState, LoadingService, LoadingType } from './loading.types';

/**
 * Default loading type
 */
const DEFAULT_LOADING_TYPE: LoadingType = 'global';

/**
 * Loading service class
 */
class LoadingServiceImpl implements LoadingService {
	private loadingStates: LoadingState[] = [];
	private listeners: Set<(states: LoadingState[]) => void> = new Set();

	/**
	 * Start loading with optional type and message
	 */
	start(type: LoadingType = DEFAULT_LOADING_TYPE, message?: string): string {
		const id = `loading-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
		const state: LoadingState = {
			id,
			type,
			message,
			timestamp: new Date()
		};

		this.loadingStates.push(state);
		this.notifyListeners();

		return id;
	}

	/**
	 * Stop loading by ID
	 */
	stop(id: string): void {
		this.loadingStates = this.loadingStates.filter(state => state.id !== id);
		this.notifyListeners();
	}

	/**
	 * Stop all loading states
	 */
	stopAll(): void {
		this.loadingStates = [];
		this.notifyListeners();
	}

	/**
	 * Check if loading is active (optionally filtered by type)
	 */
	isLoading(type?: LoadingType): boolean {
		if (type) {
			return this.loadingStates.some(state => state.type === type);
		}
		return this.loadingStates.length > 0;
	}

	/**
	 * Get all loading states
	 */
	getLoadingStates(): LoadingState[] {
		return [...this.loadingStates];
	}

	/**
	 * Subscribe to loading state changes
	 * Note: This is used internally by the service
	 */
	subscribe(listener: (states: LoadingState[]) => void): () => void {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	}

	/**
	 * Notify all listeners
	 */
	private notifyListeners(): void {
		this.listeners.forEach(listener => {
			listener([...this.loadingStates]);
		});
	}
}

/**
 * Create loading service instance
 */
export const createLoadingService = (): LoadingService => {
	return new LoadingServiceImpl();
};

/**
 * Default loading service instance
 */
export const loadingService = createLoadingService();

// Export utilities for easier usage
export * from './loading.utils';
