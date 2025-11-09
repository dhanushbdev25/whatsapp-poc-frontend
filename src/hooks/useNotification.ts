/**
 * Hook for using notifications
 */

import { useNotificationContext } from '../services/notifications/NotificationProvider';
import type { NotificationConfig } from '../services/notifications/notification.types';

/**
 * Hook to use notification service
 */
export const useNotification = () => {
	const { service } = useNotificationContext();

	return {
		show: (config: NotificationConfig) => service.show(config),
		success: (message: string, title?: string) => service.success(message, title),
		error: (message: string, title?: string) => service.error(message, title),
		warning: (message: string, title?: string) => service.warning(message, title),
		info: (message: string, title?: string) => service.info(message, title),
		dismiss: (id: string) => service.dismiss(id),
		dismissAll: () => service.dismissAll()
	};
};
