/**
 * Notification Provider component
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Notification } from './notification.types';
import { notificationService } from './notification.service';
import type { NotificationService } from './notification.types';

/**
 * Notification context type
 */
interface NotificationContextType {
	notifications: Notification[];
	service: NotificationService;
}

/**
 * Notification context
 */
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

/**
 * Notification Provider props
 */
interface NotificationProviderProps {
	children: ReactNode;
}

/**
 * Notification Provider component
 */
export const NotificationProvider = ({ children }: NotificationProviderProps) => {
	const [notifications, setNotifications] = useState<Notification[]>(() => notificationService.getNotifications());

	useEffect(() => {
		// Subscribe to notification changes
		const unsubscribe = notificationService.subscribe(setNotifications);

		return unsubscribe;
	}, []);

	const value: NotificationContextType = {
		notifications,
		service: notificationService
	};

	return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

/**
 * Hook to use notification context
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useNotificationContext = (): NotificationContextType => {
	const context = useContext(NotificationContext);
	if (!context) {
		throw new Error('useNotificationContext must be used within NotificationProvider');
	}
	return context;
};
