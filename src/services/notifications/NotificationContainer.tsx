/**
 * Notification Container component
 */

import { Snackbar, Alert, AlertTitle, IconButton } from '@mui/material';
import { MdClose as CloseIcon } from 'react-icons/md';
import { useNotificationContext } from './NotificationProvider';
import type { NotificationPosition, Notification as NotificationType } from './notification.types';

/**
 * Map notification position to Material-UI anchor origin
 */
const getAnchorOrigin = (position: NotificationPosition) => {
	const vertical = position.startsWith('top') ? 'top' : 'bottom';
	const horizontal = position.includes('left') ? 'left' : position.includes('center') ? 'center' : 'right';

	return { vertical, horizontal };
};

/**
 * Notification Container component
 */
export const NotificationContainer = () => {
	const { notifications } = useNotificationContext();

	return (
		<>
			{notifications.map(notification => (
				<NotificationItem key={notification.id} notification={notification} />
			))}
		</>
	);
};

/**
 * Individual notification item component
 */
interface NotificationItemProps {
	notification: NotificationType;
}

const NotificationItem = ({ notification }: NotificationItemProps) => {
	const { service } = useNotificationContext();
	const anchorOrigin = getAnchorOrigin(notification.position || 'top-right');

	const handleClose = () => {
		service.dismiss(notification.id);
	};

	return (
		<Snackbar
			open={true}
			anchorOrigin={{
				vertical: anchorOrigin.vertical as 'top' | 'bottom',
				horizontal: anchorOrigin.horizontal as 'left' | 'center' | 'right'
			}}
			autoHideDuration={notification.duration === 0 ? null : (notification.duration ?? null)}
			onClose={handleClose}
		>
			<Alert
				severity={notification.type}
				onClose={handleClose}
				action={
					<IconButton size="small" aria-label="close" color="inherit" onClick={handleClose}>
						<CloseIcon />
					</IconButton>
				}
				sx={{ minWidth: '300px' }}
			>
				{notification.title && <AlertTitle>{notification.title}</AlertTitle>}
				{notification.message}
			</Alert>
		</Snackbar>
	);
};
