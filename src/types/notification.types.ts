/**
 * Notification-related types
 */

/**
 * Notification types
 */
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

/**
 * Notification position
 */
export type NotificationPosition =
	| 'top-left'
	| 'top-center'
	| 'top-right'
	| 'bottom-left'
	| 'bottom-center'
	| 'bottom-right';

/**
 * Notification configuration
 */
export interface NotificationConfig {
	id?: string;
	type: NotificationType;
	title?: string;
	message: string;
	duration?: number; // in milliseconds, 0 means no auto-dismiss
	position?: NotificationPosition;
	action?: {
		label: string;
		onClick: () => void;
	};
	onClose?: () => void;
}

/**
 * Notification instance
 */
export interface Notification extends NotificationConfig {
	id: string;
	timestamp: Date;
}

/**
 * Notification service methods
 */
export interface NotificationService {
	show: (config: NotificationConfig) => string;
	success: (message: string, title?: string) => string;
	error: (message: string, title?: string) => string;
	warning: (message: string, title?: string) => string;
	info: (message: string, title?: string) => string;
	dismiss: (id: string) => void;
	dismissAll: () => void;
	getNotifications: () => Notification[];
	subscribe: (listener: (notifications: Notification[]) => void) => () => void;
}
