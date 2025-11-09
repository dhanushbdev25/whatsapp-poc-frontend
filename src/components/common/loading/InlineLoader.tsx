/**
 * Inline loading indicator component with skeleton loading
 */

import { Box, Skeleton, Stack, Typography } from '@mui/material';
import { useLoadingContext } from '../../../services/loading/LoadingProvider';

/**
 * Inline loader component props
 */
interface InlineLoaderProps {
	message?: string;
	/** Number of skeleton rows to show */
	rows?: number;
	/** Show table skeleton instead of list */
	variant?: 'list' | 'table';
}

/**
 * Inline loader component with professional skeleton loading
 */
export const InlineLoader = ({ message, rows = 3, variant = 'list' }: InlineLoaderProps) => {
	const { isInlineLoading } = useLoadingContext();

	if (!isInlineLoading) {
		return null;
	}

	if (variant === 'table') {
		return (
			<Box py={2}>
				{message && (
					<Typography variant="body2" color="text.secondary" mb={2}>
						{message}
					</Typography>
				)}
				<Stack spacing={1}>
					{/* Table header skeleton */}
					<Box display="flex" gap={2}>
						<Skeleton variant="rectangular" width="20%" height={40} />
						<Skeleton variant="rectangular" width="30%" height={40} />
						<Skeleton variant="rectangular" width="25%" height={40} />
						<Skeleton variant="rectangular" width="25%" height={40} />
					</Box>
					{/* Table rows */}
					{Array.from({ length: rows }).map((_, index) => (
						<Box key={index} display="flex" gap={2}>
							<Skeleton variant="rectangular" width="20%" height={48} />
							<Skeleton variant="rectangular" width="30%" height={48} />
							<Skeleton variant="rectangular" width="25%" height={48} />
							<Skeleton variant="rectangular" width="25%" height={48} />
						</Box>
					))}
				</Stack>
			</Box>
		);
	}

	return (
		<Box py={2}>
			{message && (
				<Typography variant="body2" color="text.secondary" mb={2}>
					{message}
				</Typography>
			)}
			<Stack spacing={2}>
				{Array.from({ length: rows }).map((_, index) => (
					<Box key={index} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 2 }}>
						<Stack spacing={1}>
							<Skeleton variant="text" width="60%" height={24} />
							<Skeleton variant="text" width="100%" height={20} />
							<Skeleton variant="text" width="80%" height={20} />
						</Stack>
					</Box>
				))}
			</Stack>
		</Box>
	);
};
