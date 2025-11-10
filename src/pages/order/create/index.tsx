import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import {
	Container,
	Paper,
	Stack,
	Typography,
	Button,
	Divider,
	CircularProgress,
	Alert,
	TextField,
	Box,
	Grid,
	FormControlLabel,
	Checkbox
} from '@mui/material';
import Swal from 'sweetalert2';

const CARD_OPTIONS: any = {
	style: {
		base: {
			fontSize: '16px',
			color: '#111827',
			fontWeight: 500,
			'::placeholder': { color: '#9CA3AF' }
		},
		invalid: { color: '#DC2626' }
	}
};

type OrderResponse = any;

function currency(amount: number, code: string) {
	try {
		return new Intl.NumberFormat(undefined, {
			style: 'currency',
			currency: code || 'INR',
			maximumFractionDigits: 2
		}).format(amount);
	} catch {
		return `${code} ${amount.toFixed(2)}`;
	}
}

type LoyaltyState = {
	points_balance: number;
	points_redeemed: number;
	lifetime_points: number;
};

const PaymentForm = ({
	order,
	apiBaseUrl,
	totals,
	loyaltyState,
	onLoyaltyApplied
}: {
	order: OrderResponse;
	apiBaseUrl: string;
	totals: {
		subTotal: number;
		tax: number;
		fee: number;
		discount: number;
		totalBeforeDiscount: number;
		totalToPay: number;
		currencyCode: string;
	};
	loyaltyState: LoyaltyState;
	onLoyaltyApplied: (appliedPoints: number) => void;
}) => {
	const stripe = useStripe();
	const elements = useElements();
	const navigate = useNavigate();

	const [email, setEmail] = useState(order?.customer?.email ?? '');
	const [status, setStatus] = useState<'idle' | 'validating' | 'confirming'>('idle');
	const [error, setError] = useState<string | null>(null);

	// Loyalty UI states (checkbox + input + apply)
	const [usePoints, setUsePoints] = useState<boolean>(false);
	const [inputPoints, setInputPoints] = useState<string>('');
	const [appliedPoints, setAppliedPoints] = useState<number>(0);
	const [applyErr, setApplyErr] = useState<string | null>(null);
	const [cardComplete, setCardComplete] = useState(false);

	const { totalToPay, currencyCode, totalBeforeDiscount } = totals;

	const handleApplyPoints = () => {
		setApplyErr(null);
		if (!usePoints) {
			setAppliedPoints(0);
			onLoyaltyApplied(0);
			return;
		}
		const raw = inputPoints.trim();
		if (!raw) {
			setApplyErr('Enter points to redeem.');
			return;
		}
		const num = Number(raw);
		if (!Number.isInteger(num) || num < 0) {
			setApplyErr('Points must be a whole number.');
			return;
		}
		// 1 point = 1 INR. Limit by available balance and by amount payable.
		const maxByBalance = loyaltyState.points_balance;
		const maxByPayable = Math.floor(totalBeforeDiscount); // do not exceed order total
		const allowedMax = Math.max(0, Math.min(maxByBalance, maxByPayable));
		if (num === 0) {
			setApplyErr('Points must be greater than 0.');
			return;
		}
		if (num > allowedMax) {
			setApplyErr(`You can redeem up to ${allowedMax} points.`);
			return;
		}
		setAppliedPoints(num);
		onLoyaltyApplied(num);
	};

	const handleClearPoints = () => {
		setUsePoints(false);
		setInputPoints('');
		setAppliedPoints(0);
		setApplyErr(null);
		onLoyaltyApplied(0);
	};

	const handlePay = async () => {
		if (!stripe || !elements) return;

		setError(null);
		setStatus('validating');

		const card = elements.getElement(CardElement);
		if (!card) {
			setStatus('idle');
			setError('Payment form is not ready. Please try again.');
			return;
		}

		const pm: any = await stripe.createPaymentMethod({
			type: 'card',
			card,
			billing_details: { email: email || undefined }
		});

		if (pm.error || !pm.paymentMethod?.id) {
			setStatus('idle');
			setError(pm.error?.message || 'Card creation failed.');
			return;
		}

		// Amount to charge is AFTER discount
		const amountToCharge = Math.max(0, Math.round(totals.totalToPay));

		const payload = {
			paymentMethodId: pm.paymentMethod.id,
			order: {
				orderId: order.orderNo,
				customerID: String(order.customerID ?? order.customer?.customerID ?? ''),
				amount: amountToCharge,
				currency: currencyCode
			},
			email: email || order?.customer?.email || undefined,
			// Extra loyalty context for backend (optional, harmless if ignored)
			loyalty: {
				points_applied: appliedPoints,
				discount_in_inr: appliedPoints, // 1 pt = ₹1
				previous_balance: loyaltyState.points_balance + appliedPoints, // because UI shows reduced balance already
				new_balance: loyaltyState.points_balance,
				new_points_redeemed_total: loyaltyState.points_redeemed,
				lifetime_points: loyaltyState.lifetime_points // unchanged on redeem
			}
		};

		try {
			const { data } = await axios.post(`${apiBaseUrl}orders/payments/validate-and-intent`, payload);

			if (!data?.data?.valid) {
				setStatus('idle');
				setError(data?.reason || 'Card validation failed.');
				return;
			}

			setStatus('confirming');
			//   const confirm: any = await stripe.confirmCardPayment(data?.data.clientSecret, {
			//     payment_method: pm.paymentMethod.id
			//   });

			//   if (confirm.error) {
			//     setStatus("idle");
			//     setError(confirm.error.message || "Payment failed.");
			//     return;
			//   }

			//   if (confirm.paymentIntent?.status === "succeeded") {
			//     navigate("/order/success", {
			//       replace: true,
			//       state: {
			//         orderNo: order.orderNo,
			//         amount: currency(amountToCharge, currencyCode),
			//         last4: data?.data?.last4,
			//         brand: data?.data?.brand,
			//         pointsApplied: appliedPoints,
			//         discount: currency(appliedPoints, currencyCode)
			//       }
			//     });
			//   } else {
			//     setStatus("idle");
			//   }

			navigate('/order/success', {
				replace: true,
				state: {
					orderNo: order.orderNo,
					amount: currency(amountToCharge, currencyCode),
					last4: data?.data?.last4,
					brand: data?.data?.brand,
					pointsApplied: appliedPoints,
					discount: currency(appliedPoints, currencyCode)
				}
			});
		} catch (err: any) {
			setStatus('idle');
			setError(err?.response?.data?.message || 'Server error. Please try again.');
		}
	};
	const isLoyaltyValid = !usePoints || appliedPoints > 0;


	return (
		<Stack spacing={2}>
			{/* Loyalty Section */}
			<Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
				<Stack spacing={1}>
					<Stack direction="row" justifyContent="space-between" alignItems="center">
						<Typography fontWeight={700}>Loyalty</Typography>
						<Typography variant="body2" color="text.secondary">
							Balance: <b>{loyaltyState.points_balance}</b> pts
						</Typography>
					</Stack>

					<FormControlLabel
						control={
							<Checkbox
								checked={usePoints}
								onChange={e => {
									setUsePoints(e.target.checked);
									if (!e.target.checked) {
										handleClearPoints();
									}
								}}
							/>
						}
						label={
							<Typography variant="body2" color="text.secondary">
								Redeem loyalty points for this purchase (1 point = {currency(1, currencyCode)})
							</Typography>
						}
					/>

					{usePoints && (
						<Stack spacing={1}>
							<Stack direction="row" spacing={1} alignItems="center">
								<TextField
									type="number"
									inputProps={{ min: 0, step: 1 }}
									label="Points to redeem"
									size="small"
									value={inputPoints}
									onChange={e => {
										let v = e.target.value;

										// allow empty
										if (v === "") {
											setInputPoints("");
											return;
										}

										// only digits
										if (!/^\d+$/.test(v)) return;

										// prevent leading zero unless the number is exactly "0"
										if (v.length > 1 && v.startsWith("0")) {
											v = v.replace(/^0+/, ""); // remove leading zeros
											if (v === "") v = "0"; // fallback if all zeros
										}

										setInputPoints(v);

									}}
									fullWidth
								/>
								<Button
									variant="outlined"
									onClick={() => {
										// Pre-fill max available (capped by payable total)
										const maxByBalance = loyaltyState.points_balance + appliedPoints; // if re-opening
										const maxByPayable = Math.floor(totalBeforeDiscount);
										const allowedMax = Math.max(0, Math.min(maxByBalance, maxByPayable));
										setInputPoints(String(allowedMax));

									}}
								>
									Max
								</Button>
								<Button variant="contained" onClick={handleApplyPoints}>
									Apply
								</Button>
							</Stack>
							{applyErr && <Alert severity="warning">{applyErr}</Alert>}

							{appliedPoints > 0 && (
								<Alert severity="success">
									Applied <b>{appliedPoints}</b> pts (discount {currency(appliedPoints, currencyCode)}).
								</Alert>
							)}
						</Stack>
					)}
				</Stack>
			</Paper>

			{/* Email + Card */}
			<TextField
				label="Email for receipt (optional)"
				value={email}
				onChange={e => setEmail(e.target.value)}
				fullWidth
				size="small"
			/>

			<Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
				<CardElement onChange={(e) => {
					setCardComplete(e.complete);
					if (e.error) {
						setError(e.error.message);
					} else {
						setError(null);
					}
				}} options={CARD_OPTIONS} />
			</Paper>

			<Stack spacing={0.5}>
				<Stack direction="row" justifyContent="space-between">
					<Typography color="text.secondary">Amount to Pay</Typography>
					<Typography fontWeight={700}>{currency(totalToPay, currencyCode)}</Typography>
				</Stack>
				{totals.discount > 0 && (
					<Typography variant="caption" color="text.secondary">
						Includes discount {currency(totals.discount, currencyCode)} from {totals.discount} pts.
					</Typography>
				)}
			</Stack>

			{error && <Alert severity="error">{error}</Alert>}

			<Button
				fullWidth
				variant="contained"
				onClick={handlePay}
				disabled={status !== 'idle' || !cardComplete || !isLoyaltyValid }
				sx={{ height: 44, fontWeight: 600 }}
			>
				{status !== 'idle' ? <CircularProgress size={20} /> : `Pay ${currency(totalToPay, currencyCode)}`}
			</Button>

			<Typography variant="caption" color="text.secondary" textAlign="center">
				Your card details are securely processed. We never store full card numbers.
			</Typography>
		</Stack>
	);
};

const CreateOrder = ({ apiBaseUrl = `${process.env.API_BASE_URL}` }) => {
	const { id } = useParams();
	const [order, setOrder] = useState<OrderResponse | null>(null);
	const [loading, setLoading] = useState(true);
	const [publishableKey, setPublishableKey] = useState<string | null>(null);


	// Track loyalty (local UI copy we can mutate after apply)
	const [loyalty, setLoyalty] = useState<LoyaltyState>({
		points_balance: 0,
		points_redeemed: 0,
		lifetime_points: 0
	});

	// Track applied discount (in points/INR)
	const [appliedDiscountPts, setAppliedDiscountPts] = useState<number>(0);

	useEffect(() => {
		let mounted = true;

		const fetchOrder = async () => {
			try {
				const { data } = await axios.get(`${apiBaseUrl}orders/${id}/get-order-details`);
				if (!mounted) return;
				const orderData = data?.data?.data?.order ?? null;
				setOrder(orderData);

				// initialize loyalty state from API response (if present)
				const la = data?.data?.data?.loyaltyAccount;
				setLoyalty({
					points_balance: Number(la?.points_balance ?? 0),
					points_redeemed: Number(la?.points_redeemed ?? 0),
					lifetime_points: Number(la?.lifetime_points ?? 0)
				});
			} catch {
				Swal.fire('Order Not Found', 'Unable to load order details.', 'error');
			} finally {
				mounted && setLoading(false);
			}
		};

		const fetchPK = async () => {
			try {
				const { data } = await axios.get(`${apiBaseUrl}orders/payments/pk`);
				setPublishableKey(data?.data?.publishableKey ?? null);
			} catch {
				// silently ignore; UI will show spinner in payment pane
			}
		};

		fetchOrder();
		fetchPK();

		return () => {
			mounted = false;
		};
	}, [id, apiBaseUrl]);

	const stripePromise = useMemo<Promise<Stripe | null> | null>(
		() => (publishableKey ? loadStripe(publishableKey) : null),
		[publishableKey]
	);

	// derive monetary amounts from the order
	const computeTotals = (o: OrderResponse, discountPts: number) => {
		const item = o.orderItems?.[0];
		const product = item?.product;
		const subTotal = (product?.amount ?? 0) * (item?.qty ?? 0);
		const tax = Math.round(subTotal * 0.18); // 18% GST (demo)
		const fee = Math.max(5, Math.round(subTotal * 0.012)); // convenience fee (demo)
		const totalBeforeDiscount = subTotal + tax + fee;

		// Discount = redeemed points (1:1 INR), capped to totalBeforeDiscount
		const discount = Math.min(Math.max(0, discountPts), totalBeforeDiscount);

		const totalToPay = Math.max(0, totalBeforeDiscount - discount);
		const currencyCode = product?.currency ?? 'INR';
		return { subTotal, tax, fee, discount, totalBeforeDiscount, totalToPay, currencyCode, item, product };
	};

	const totals = useMemo(() => (order ? computeTotals(order, appliedDiscountPts) : null), [order, appliedDiscountPts]);

	// when user hits "Apply" in child, we set discount pts here and update loyalty local snapshot
	const handleLoyaltyApplied = (appliedPts: number) => {
		if (!order) return;
		// Calculate how this affects local loyalty view:
		// Redeeming decreases balance, increases redeemed total, lifetime stays same.
		setAppliedDiscountPts(appliedPts);

		setLoyalty(prev => {
			const previousBalance = prev.points_balance + (appliedDiscountPts || 0); // rebuild real previous if re-applying
			const newBalance = Math.max(0, previousBalance - appliedPts);
			const redeemedDelta = appliedPts - (appliedDiscountPts || 0); // difference from any prior applied
			return {
				points_balance: newBalance,
				points_redeemed: Math.max(0, prev.points_redeemed + redeemedDelta),
				lifetime_points: prev.lifetime_points // unchanged on redeem
			};
		});
	};

	if (loading || !order || !totals) {
		return (
			<Container maxWidth="md" sx={{ py: 3 }}>
				<Stack alignItems="center" sx={{ py: 6 }}>
					<CircularProgress />
					<Typography sx={{ mt: 2 }} color="text.secondary">
						Loading checkout…
					</Typography>
				</Stack>
			</Container>
		);
	}

	const { item, product } = totals;

	return (
		/**
		 * IMPORTANT for mobile scroll:
		 * - No fixed heights here.
		 * - No overflow rules here (let the parent layout scroll).
		 * - Use natural document flow with padding at bottom.
		 */
		<Container maxWidth="md" sx={{ py: { xs: 2, md: 3 }, pb: { xs: 6, md: 6 } }}>
			<Stack spacing={2}>
				{/* Page Title */}
				<Box>
					<Typography variant="h6" fontWeight={700}>
						Review & Pay
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Order <b>{order.orderNo}</b> • Created {new Date(order.orderCreatedAt).toLocaleString()}
					</Typography>
				</Box>

				<Grid container spacing={2}>
					{/* LEFT – Order details */}
					<Grid>
						<Paper variant="outlined" sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 2 }}>
							<Typography fontWeight={700}>Order Summary</Typography>
							<Divider sx={{ my: 1.5 }} />

							<Stack spacing={1}>
								<Typography variant="body2">
									<b>Status:</b> {order.status}
								</Typography>
								<Typography variant="body2">
									<b>Tracking No:</b> {order.trackingNo || '—'}
								</Typography>
								<Typography variant="body2">
									<b>Payment Type:</b> {order.paymentType || 'Card'}
								</Typography>
							</Stack>

							<Divider sx={{ my: 1.5 }} />

							<Typography variant="subtitle2" sx={{ mb: 0.5 }}>
								Customer
							</Typography>
							<Stack spacing={0.25}>
								<Typography variant="body2">{order.customer?.name}</Typography>
								<Typography variant="body2" color="text.secondary">
									{order.customer?.email}
								</Typography>
								<Typography variant="body2" color="text.secondary">
									{order.customer?.phone}
								</Typography>
							</Stack>

							<Divider sx={{ my: 1.5 }} />

							<Typography variant="subtitle2" sx={{ mb: 0.5 }}>
								Shipping Address
							</Typography>
							<Typography variant="body2" color="text.secondary">
								{order.shipToAddress || '—'}
							</Typography>

							<Divider sx={{ my: 1.5 }} />

							<Typography variant="subtitle2" sx={{ mb: 1 }}>
								Items
							</Typography>
							<Stack spacing={0.5}>
								<Typography variant="body2">
									{product?.productName} × {item?.qty}
								</Typography>
								<Typography variant="body2" color="text.secondary">
									SKU: {product?.sku} • Type: {product?.type}
								</Typography>
							</Stack>

							<Divider sx={{ my: 1.5 }} />

							<Stack spacing={0.5}>
								<Stack direction="row" justifyContent="space-between">
									<Typography color="text.secondary">Subtotal</Typography>
									<Typography>{currency(totals.subTotal, totals.currencyCode)}</Typography>
								</Stack>
								<Stack direction="row" justifyContent="space-between">
									<Typography color="text.secondary">Tax (18%)</Typography>
									<Typography>{currency(totals.tax, totals.currencyCode)}</Typography>
								</Stack>
								<Stack direction="row" justifyContent="space-between">
									<Typography color="text.secondary">Convenience Fee</Typography>
									<Typography>{currency(totals.fee, totals.currencyCode)}</Typography>
								</Stack>

								{/* Discount line (if any) */}
								{totals.discount > 0 && (
									<Stack direction="row" justifyContent="space-between">
										<Typography color="text.secondary">Loyalty Discount</Typography>
										<Typography>-{currency(totals.discount, totals.currencyCode)}</Typography>
									</Stack>
								)}

								<Divider sx={{ my: 1 }} />
								<Stack direction="row" justifyContent="space-between">
									<Typography fontWeight={700}>Total</Typography>
									<Typography fontWeight={700}>{currency(totals.totalToPay, totals.currencyCode)}</Typography>
								</Stack>
							</Stack>

							<Divider sx={{ my: 1.5 }} />

							{/* Loyalty snapshot */}
							<Stack spacing={0.25}>
								<Typography variant="subtitle2" sx={{ mb: 0.5 }}>
									Loyalty
								</Typography>
								<Typography variant="body2" color="text.secondary">
									Balance: <b>{loyalty.points_balance}</b> pts • Redeemed total: <b>{loyalty.points_redeemed}</b> pts •
									Lifetime: <b>{loyalty.lifetime_points}</b> pts
								</Typography>
							</Stack>

							<Divider sx={{ my: 1.5 }} />

							<Typography variant="caption" color="text.secondary">
								By proceeding you accept our terms and acknowledge the charge for the items above.
							</Typography>
						</Paper>
					</Grid>

					{/* RIGHT – Payment */}
					<Grid>
						<Paper variant="outlined" sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 2 }}>
							<Typography fontWeight={700}>Payment</Typography>
							<Divider sx={{ my: 1.5 }} />

							{publishableKey && stripePromise ? (
								<Elements stripe={stripePromise}>
									<PaymentForm
										order={order}
										apiBaseUrl={apiBaseUrl}
										totals={totals}
										loyaltyState={loyalty}
										onLoyaltyApplied={handleLoyaltyApplied}
									/>
								</Elements>
							) : (
								<Stack alignItems="center" sx={{ py: 2 }}>
									<CircularProgress />
									<Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
										Initializing secure payment…
									</Typography>
								</Stack>
							)}
						</Paper>

						{/* Little footer section for help/notes */}
						<Paper variant="outlined" sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 2, mt: 2 }}>
							<Typography fontWeight={700}>Need help?</Typography>
							<Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
								If you face issues, retry your card or contact support with your Order No: {order.orderNo}.
							</Typography>
						</Paper>
					</Grid>
				</Grid>
			</Stack>
		</Container>
	);
};

export default CreateOrder;
