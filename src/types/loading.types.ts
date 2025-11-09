/**
 * Loading state-related types
 */

/**
 * Loading indicator types
 */
export type LoadingType = 'global' | 'inline' | 'button' | 'overlay';

/**
 * Loading state
 */
export interface LoadingState {
	id: string;
	type: LoadingType;
	message?: string;
	timestamp: Date;
}

/**
 * Loading service methods
 */
export interface LoadingService {
	start: (type?: LoadingType, message?: string) => string;
	stop: (id: string) => void;
	stopAll: () => void;
	isLoading: (type?: LoadingType) => boolean;
	getLoadingStates: () => LoadingState[];
	subscribe: (listener: (states: LoadingState[]) => void) => () => void;
}

/**
 * Loading context value
 */
export interface LoadingContextValue {
	isLoading: boolean;
	isGlobalLoading: boolean;
	isInlineLoading: boolean;
	isButtonLoading: boolean;
	isOverlayLoading: boolean;
	startLoading: (type?: LoadingType, message?: string) => string;
	stopLoading: (id: string) => void;
	stopAllLoading: () => void;
}
