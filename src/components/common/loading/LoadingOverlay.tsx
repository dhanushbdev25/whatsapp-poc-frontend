/**
 * Loading overlay component with skeleton loading
 */

import { Box, Skeleton, Stack, Typography } from '@mui/material';
import { useLoadingContext } from '../../../services/loading/LoadingProvider';

/**
 * Loading overlay component props
 */
interface LoadingOverlayProps {
	message?: string;
	zIndex?: number;
	/** Number of skeleton items to show */
	rows?: number;
}

/**
 * Loading overlay component with professional skeleton loading
 */
export const LoadingOverlay = ({ message, zIndex = 1300, rows = 3 }: LoadingOverlayProps) => {
	const { isOverlayLoading } = useLoadingContext();

	if (!isOverlayLoading) {
		return null;
	}

	return (
		<Box
			position="absolute"
			top={0}
			left={0}
			right={0}
			bottom={0}
			bgcolor="rgba(255, 255, 255, 0.95)"
			zIndex={zIndex}
			sx={{
				overflow: 'auto',
				p: 2,
				backdropFilter: 'blur(2px)'
			}}
		>
			{message && (
				<Typography variant="body2" color="text.secondary" mb={2}>
					{message}
				</Typography>
			)}
			<Stack spacing={2}>
				{Array.from({ length: rows }).map((_, index) => (
					<Box
						key={index}
						sx={{
							border: 1,
							borderColor: 'divider',
							borderRadius: 1,
							p: 2,
							bgcolor: 'background.paper'
						}}
					>
						<Stack spacing={1}>
							<Skeleton variant="rectangular" width="40%" height={28} sx={{ borderRadius: 1 }} />
							<Skeleton variant="text" width="100%" height={20} />
							<Skeleton variant="text" width="85%" height={20} />
						</Stack>
					</Box>
				))}
			</Stack>
		</Box>
	);
};
