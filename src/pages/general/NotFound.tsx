import { Typography, Button, Container } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { MdErrorOutline as ErrorOutlineIcon } from 'react-icons/md';

const NotFound = () => {
	return (
		<Container maxWidth="sm" sx={{ textAlign: 'center', py: 10 }}>
			<ErrorOutlineIcon style={{ color: '#d32f2f', fontSize: 80, marginBottom: 16 }} />
			<Typography variant="h2" gutterBottom>
				404
			</Typography>
			<Typography variant="h5" gutterBottom color="text.secondary">
				Oops! The page you’re looking for doesn’t exist.
			</Typography>
			<Button variant="contained" component={RouterLink} to="/" sx={{ mt: 4 }}>
				Go to Home
			</Button>
		</Container>
	);
};

export default NotFound;
