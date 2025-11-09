/**
 * Global loading indicator component with skeleton loading
 */

import { Box, Skeleton, Stack } from '@mui/material';
import { useLoadingContext } from '../../../services/loading/LoadingProvider';

/**
 * Global loader component with professional skeleton loading
 */
export const GlobalLoader = () => {
	const { isGlobalLoading } = useLoadingContext();

	if (!isGlobalLoading) {
		return null;
	}

	return (
		<Box
			position="absolute"
			top={0}
			left={0}
			right={0}
			bottom={0}
			bgcolor="background.paper"
			zIndex={100}
			sx={{
				overflow: 'auto',
				p: 3,
				width: '100%',
				height: '100%',
				boxSizing: 'border-box'
			}}
		>
			{/* Header skeleton with breadcrumbs */}
			<Stack spacing={2} mb={4}>
				<Box display="flex" alignItems="center" gap={1}>
					<Skeleton variant="circular" width={8} height={8} />
					<Skeleton variant="text" width={80} height={20} />
					<Skeleton variant="text" width={12} height={20} />
					<Skeleton variant="text" width={100} height={20} />
				</Box>
				<Skeleton variant="text" width="35%" height={36} sx={{ fontSize: '1.5rem' }} />
				<Skeleton variant="text" width="50%" height={20} />
			</Stack>

			{/* Stats cards row */}
			<Box display="flex" gap={2} mb={3} flexWrap="wrap">
				{[1, 2, 3, 4].map(index => (
					<Box
						key={index}
						sx={{
							flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 12px)' },
							border: 1,
							borderColor: 'divider',
							borderRadius: 2,
							p: 2.5
						}}
					>
						<Stack spacing={1.5}>
							<Skeleton variant="text" width="60%" height={16} />
							<Skeleton variant="text" width="40%" height={32} sx={{ fontSize: '1.75rem' }} />
							<Skeleton variant="rectangular" width="100%" height={4} sx={{ borderRadius: 1 }} />
						</Stack>
					</Box>
				))}
			</Box>

			{/* Content skeleton */}
			<Stack spacing={3}>
				{/* Main content card */}
				<Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 3 }}>
					<Stack spacing={2.5}>
						<Box display="flex" justifyContent="space-between" alignItems="center">
							<Skeleton variant="text" width="25%" height={28} />
							<Box display="flex" gap={1.5}>
								<Skeleton variant="rectangular" width={120} height={36} sx={{ borderRadius: 1 }} />
								<Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1 }} />
							</Box>
						</Box>
						<Skeleton variant="rectangular" width="100%" height={1} />
						<Stack spacing={1.5}>
							<Skeleton variant="text" width="100%" height={22} />
							<Skeleton variant="text" width="95%" height={22} />
							<Skeleton variant="text" width="88%" height={22} />
							<Skeleton variant="text" width="92%" height={22} />
						</Stack>
						<Box display="flex" gap={2} mt={1}>
							<Skeleton variant="rectangular" width={110} height={38} sx={{ borderRadius: 1 }} />
							<Skeleton variant="rectangular" width={110} height={38} sx={{ borderRadius: 1 }} />
						</Box>
					</Stack>
				</Box>

				{/* Table skeleton */}
				<Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
					{/* Table header */}
					<Box
						sx={{
							bgcolor: 'action.hover',
							p: 2,
							borderBottom: 1,
							borderColor: 'divider'
						}}
					>
						<Box display="flex" gap={2}>
							<Skeleton variant="text" width="15%" height={20} />
							<Skeleton variant="text" width="25%" height={20} />
							<Skeleton variant="text" width="20%" height={20} />
							<Skeleton variant="text" width="20%" height={20} />
							<Skeleton variant="text" width="20%" height={20} />
						</Box>
					</Box>
					{/* Table rows */}
					<Stack spacing={0}>
						{[1, 2, 3, 4, 5, 6].map(row => (
							<Box
								key={row}
								sx={{
									p: 2,
									borderBottom: row < 6 ? 1 : 0,
									borderColor: 'divider',
									bgcolor: row % 2 === 0 ? 'transparent' : 'action.hover'
								}}
							>
								<Box display="flex" gap={2} alignItems="center">
									<Skeleton variant="rectangular" width="15%" height={24} sx={{ borderRadius: 0.5 }} />
									<Skeleton variant="text" width="25%" height={20} />
									<Skeleton variant="text" width="20%" height={20} />
									<Skeleton variant="text" width="20%" height={20} />
									<Box display="flex" gap={1} width="20%">
										<Skeleton variant="circular" width={32} height={32} />
										<Skeleton variant="rectangular" width={60} height={28} sx={{ borderRadius: 1 }} />
									</Box>
								</Box>
							</Box>
						))}
					</Stack>
				</Box>
			</Stack>
		</Box>
	);
};
