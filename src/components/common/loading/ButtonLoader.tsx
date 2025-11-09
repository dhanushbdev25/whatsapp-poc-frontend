/**
 * Button loading state component
 */

import { CircularProgress, Button, type ButtonProps } from '@mui/material';
import { useLoadingContext } from '../../../services/loading/LoadingProvider';

/**
 * Button loader component props
 */
interface ButtonLoaderProps extends ButtonProps {
	loadingId?: string;
}

/**
 * Button loader component
 */
export const ButtonLoader = ({ loadingId, children, disabled, ...props }: ButtonLoaderProps) => {
	const { isButtonLoading } = useLoadingContext();
	const isLoading = isButtonLoading || (loadingId !== undefined && disabled);

	return (
		<Button disabled={isLoading || disabled} {...props}>
			{isLoading && <CircularProgress size={16} sx={{ mr: 1 }} />}
			{children}
		</Button>
	);
};
