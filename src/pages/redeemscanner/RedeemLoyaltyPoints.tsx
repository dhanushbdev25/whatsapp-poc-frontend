import { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Button, Paper } from '@mui/material';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

function RedeemLoyaltyPoints() {
	const { id } = useParams();
	const navigate = useNavigate();

	const [loading, setLoading] = useState(true);
	const [success, setSuccess] = useState(false);
	const [earnedPoints, setEarnedPoints] = useState<number>(0);
	const [newBalance, setNewBalance] = useState<number>(0);
	const [errorMsg, setErrorMsg] = useState('');

	const USER_ID = '264553f1-3ca9-4cc1-bb87-c0972b691e19';
	const productID = '941ccf12-8dff-40f7-be15-94111e4a4445';

	useEffect(() => {
		if (!id || !productID) {
			setLoading(false);
			setErrorMsg('Customer ID or Product ID missing.');
			return;
		}

		const addPoints = async () => {
			try {
				const response = await axios.post(`${process.env.API_BASE_URL}webhook/earn-loyalty?userId=${USER_ID}`, {
					productID,
					customerID: id
				});

				const data = response?.data?.data;
				const points = data?.transaction?.manipulatedPoint ?? 0;
				const balance = data?.account?.points_balance ?? 0;

				setEarnedPoints(points);
				setNewBalance(balance);
				setSuccess(true);
			} catch (error: any) {
				setErrorMsg(error?.response?.data?.message || 'Failed to add points.');
			} finally {
				setLoading(false);
			}
		};

		addPoints();
	}, [id, productID]);

	return (
		<Box
			sx={{
				minHeight: '100vh',
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				px: 2
			}}
		>
			<Paper
				elevation={4}
				sx={{
					p: 4,
					width: '100%',
					maxWidth: 420,
					borderRadius: 3,
					textAlign: 'center'
				}}
			>
				{/* LOADING VIEW */}
				{loading && (
					<>
						<CircularProgress size={55} />
						<Typography mt={2} fontSize={18} fontWeight={500}>
							Please wait...
						</Typography>
					</>
				)}

				{/* ERROR VIEW */}
				{!loading && errorMsg && (
					<>
						<Typography mt={1} color="error" fontSize={17} fontWeight={600}>
							{errorMsg}
						</Typography>

						<Button variant="contained" fullWidth sx={{ mt: 3, borderRadius: 2 }} onClick={() => navigate('/customer')}>
							Go Back
						</Button>
					</>
				)}

				{/* SUCCESS VIEW */}
				{success && (
					<>
						<Box sx={{ width: 120, height: 120, mx: 'auto', mb: 1 }}>
							<svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
								<circle cx="50" cy="50" r="45" stroke="#34A853" strokeWidth="5" fill="none" />
								<path
									d="M30 52 L45 67 L72 35"
									stroke="#34A853"
									strokeWidth="7"
									fill="none"
									strokeLinecap="round"
									strokeLinejoin="round"
									style={{
										strokeDasharray: 100,
										strokeDashoffset: 100,
										animation: 'checkmark 0.8s ease forwards'
									}}
								/>
							</svg>
						</Box>

						<Typography fontSize={20} fontWeight={600} color="#34A853">
							{earnedPoints} Points Added Successfully
						</Typography>

						<Typography mt={1} fontSize={16} color="text.secondary">
							New Balance: <b>{newBalance} Points</b>
						</Typography>

						<Button
							variant="contained"
							fullWidth
							sx={{ mt: 4, py: 1.4, borderRadius: 2 }}
							onClick={() => navigate('/customer')}
						>
							Go to Customers
						</Button>
					</>
				)}

				<style>
					{`
            @keyframes checkmark {
              to { stroke-dashoffset: 0; }
            }
          `}
				</style>
			</Paper>
		</Box>
	);
}

export default RedeemLoyaltyPoints;
