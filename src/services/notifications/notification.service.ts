/**
 * Notification service implementation
 */

import type { Notification, NotificationConfig, NotificationService } from './notification.types';

/**
 * Default notification duration (in milliseconds)
 */
const DEFAULT_DURATION = 5000;

/**
 * Default notification position
 */
const DEFAULT_POSITION: NotificationConfig['position'] = 'top-right';

/**
 * Notification service class
 */
class NotificationServiceImpl implements NotificationService {
	private notifications: Notification[] = [];
	private listeners: Set<(notifications: Notification[]) => void> = new Set();

	/**
	 * Show a notification
	 */
	show(config: NotificationConfig): string {
		const id = config.id || `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
		const notification: Notification = {
			...config,
			id,
			timestamp: new Date(),
			duration: config.duration ?? DEFAULT_DURATION,
			position: config.position ?? DEFAULT_POSITION
		};

		this.notifications.push(notification);
		this.notifyListeners();

		// Auto-dismiss if duration is set
		if (notification.duration && notification.duration > 0) {
			setTimeout(() => {
				this.dismiss(id);
			}, notification.duration);
		}

		return id;
	}

	/**
	 * Show a success notification
	 */
	success(message: string, title?: string): string {
		return this.show({
			type: 'success',
			message,
			title
		});
	}

	/**
	 * Show an error notification
	 */
	error(message: string, title?: string): string {
		return this.show({
			type: 'error',
			message,
			title
		});
	}

	/**
	 * Show a warning notification
	 */
	warning(message: string, title?: string): string {
		return this.show({
			type: 'warning',
			message,
			title
		});
	}

	/**
	 * Show an info notification
	 */
	info(message: string, title?: string): string {
		return this.show({
			type: 'info',
			message,
			title
		});
	}

	/**
	 * Dismiss a notification by ID
	 */
	dismiss(id: string): void {
		const notification = this.notifications.find(n => n.id === id);
		if (notification) {
			this.notifications = this.notifications.filter(n => n.id !== id);
			if (notification.onClose) {
				notification.onClose();
			}
			this.notifyListeners();
		}
	}

	/**
	 * Dismiss all notifications
	 */
	dismissAll(): void {
		this.notifications.forEach(notification => {
			if (notification.onClose) {
				notification.onClose();
			}
		});
		this.notifications = [];
		this.notifyListeners();
	}

	/**
	 * Get all notifications
	 */
	getNotifications(): Notification[] {
		return [...this.notifications];
	}

	/**
	 * Subscribe to notification changes
	 */
	subscribe(listener: (notifications: Notification[]) => void): () => void {
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
			listener([...this.notifications]);
		});
	}
}

/**
 * Create notification service instance
 */
export const createNotificationService = (): NotificationService => {
	return new NotificationServiceImpl();
};

/**
 * Default notification service instance
 */
export const notificationService = createNotificationService();
