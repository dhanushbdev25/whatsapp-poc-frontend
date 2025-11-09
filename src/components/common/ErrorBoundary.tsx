import { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { MdErrorOutline as ErrorOutlineIcon } from 'react-icons/md';
import { logger } from '../../services/logger/logger.service';

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
}

interface State {
	hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
	state: State = { hasError: false };

	static getDerivedStateFromError(): State {
		return { hasError: true };
	}

	componentDidCatch(error: Error, info: ErrorInfo): void {
		// Log error with context
		logger.error('ErrorBoundary caught an error', error, {
			componentStack: info.componentStack,
			route: window.location.pathname
		});
	}

	handleReload = () => {
		window.location.reload();
	};

	render() {
		if (this.state.hasError) {
			return (
				this.props.fallback || (
					<Box
						height="100vh"
						display="flex"
						flexDirection="column"
						alignItems="center"
						justifyContent="center"
						textAlign="center"
						px={2}
					>
						<ErrorOutlineIcon style={{ color: '#d32f2f', fontSize: 80, marginBottom: 16 }} />
						<Typography variant="h5" gutterBottom>
							Something went wrong.
						</Typography>
						<Typography variant="body1" mb={3}>
							An unexpected error occurred. Please try again.
						</Typography>
						<Button variant="contained" color="error" onClick={this.handleReload}>
							Reload Page
						</Button>
					</Box>
				)
			);
		}

		return this.props.children;
	}
}
