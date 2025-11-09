import { Backdrop, Box, Skeleton, Stack } from '@mui/material';
import { useLoadingContext } from '../../services/loading/LoadingProvider';

/**
 * Backdrop loader component props
 * @deprecated openStates prop - will be removed. Use loading service instead.
 */
interface BackdropLoaderprops {
	/** Manual override - if provided, will use this instead of loading service */
	openStates?: boolean;
}

/**
 * Backdrop loader component with professional skeleton loading
 * Automatically shows when global loading is active via loading service
 * Can also be controlled manually via openStates prop (backward compatibility)
 *
 * Usage:
 * - Simple: Just import and use - it will automatically show for global loading
 * - Manual: Pass openStates={isLoading} prop for custom control
 */
function BackdropLoader({ openStates }: Readonly<BackdropLoaderprops>) {
	const { isGlobalLoading } = useLoadingContext();
	// If openStates is provided, use it (backward compatibility), otherwise use loading service
	const open = openStates !== undefined ? openStates : isGlobalLoading;

	return (
		<Backdrop
			sx={{
				color: '#fff',
				zIndex: () => 9999,
				backgroundColor: 'rgba(255, 255, 255, 0.95)',
				backdropFilter: 'blur(4px)'
			}}
			open={open}
		>
			<Box
				sx={{
					width: '100%',
					maxWidth: '1200px',
					mx: 'auto',
					px: 3,
					py: 4
				}}
			>
				{/* Header skeleton */}
				<Stack spacing={2} mb={4}>
					<Skeleton variant="rectangular" width="40%" height={48} sx={{ borderRadius: 1 }} />
					<Skeleton variant="text" width="60%" height={28} />
					<Skeleton variant="text" width="45%" height={24} />
				</Stack>

				{/* Content cards skeleton */}
				<Stack spacing={3}>
					{[1, 2].map(index => (
						<Box
							key={index}
							sx={{
								border: 1,
								borderColor: 'divider',
								borderRadius: 2,
								p: 3,
								bgcolor: 'background.paper'
							}}
						>
							<Stack spacing={2}>
								<Skeleton variant="rectangular" width="35%" height={32} sx={{ borderRadius: 1 }} />
								<Skeleton variant="text" width="100%" height={20} />
								<Skeleton variant="text" width="95%" height={20} />
								<Skeleton variant="text" width="75%" height={20} />
								<Box display="flex" gap={2} mt={1}>
									<Skeleton variant="rectangular" width={120} height={36} sx={{ borderRadius: 1 }} />
									<Skeleton variant="rectangular" width={120} height={36} sx={{ borderRadius: 1 }} />
								</Box>
							</Stack>
						</Box>
					))}

					{/* Table skeleton */}
					<Box
						sx={{
							border: 1,
							borderColor: 'divider',
							borderRadius: 2,
							p: 2,
							bgcolor: 'background.paper'
						}}
					>
						<Stack spacing={1.5}>
							{/* Table header */}
							<Box display="flex" gap={2}>
								<Skeleton variant="rectangular" width="20%" height={44} sx={{ borderRadius: 1 }} />
								<Skeleton variant="rectangular" width="30%" height={44} sx={{ borderRadius: 1 }} />
								<Skeleton variant="rectangular" width="25%" height={44} sx={{ borderRadius: 1 }} />
								<Skeleton variant="rectangular" width="25%" height={44} sx={{ borderRadius: 1 }} />
							</Box>
							{/* Table rows */}
							{[1, 2, 3, 4].map(row => (
								<Box key={row} display="flex" gap={2}>
									<Skeleton variant="rectangular" width="20%" height={52} sx={{ borderRadius: 1 }} />
									<Skeleton variant="rectangular" width="30%" height={52} sx={{ borderRadius: 1 }} />
									<Skeleton variant="rectangular" width="25%" height={52} sx={{ borderRadius: 1 }} />
									<Skeleton variant="rectangular" width="25%" height={52} sx={{ borderRadius: 1 }} />
								</Box>
							))}
						</Stack>
					</Box>
				</Stack>
			</Box>
		</Backdrop>
	);
}

export default BackdropLoader;
