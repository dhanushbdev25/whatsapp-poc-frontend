


import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Lottie from "lottie-react";
import { Button, Box, Typography, Paper, Stack } from "@mui/material";

const successAnimationUrl = "https://assets2.lottiefiles.com/packages/lf20_jbrw3hcz.json";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const { state } = useLocation() as { state?: { orderNo?: string; amount?: string; brand?: string; last4?: string } };
  const [animationData, setAnimationData] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    fetch(successAnimationUrl)
      .then((res) => res.json())
      .then((json) => mounted && setAnimationData(json))
      .catch(() => setAnimationData(null));
    return () => { mounted = false; };
  }, []);

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", px: 2, py: 4 }}>
      <Paper sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 2, maxWidth: 520, width: "100%" }}>
        <Stack alignItems="center" spacing={2}>
          {animationData && (
            <Lottie animationData={animationData} loop={false} autoplay style={{ width: 180 }} />
          )}

          <Typography variant="h5" fontWeight={700} textAlign="center">
            Payment Successful
          </Typography>

          <Stack spacing={0.5} sx={{ width: "100%" }}>
            <Typography textAlign="center" color="text.secondary">
              Thank you! Your payment has been received.
            </Typography>
            <Typography textAlign="center" variant="body2">
              Order No: <b>{state?.orderNo || "-"}</b>
            </Typography>
            {state?.amount && (
              <Typography textAlign="center" variant="body2">
                Amount: <b>{state.amount}</b>
              </Typography>
            )}
            {(state?.brand || state?.last4) && (
              <Typography textAlign="center" variant="body2" color="text.secondary">
                Card: {state?.brand ? state.brand.toUpperCase() : "****"} •••• {state?.last4 || "****"}
              </Typography>
            )}
          </Stack>

          <Button variant="contained" onClick={() => navigate("/customer")} sx={{ mt: 1, px: 4, borderRadius: 2 }}>
            Go to Dashboard
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
