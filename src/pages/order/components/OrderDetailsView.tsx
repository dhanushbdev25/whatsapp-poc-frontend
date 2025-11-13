import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Button,
  useTheme,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { useGetOrderByIdQuery } from "../../../store/api/orders/orders.api";
import dayjs from "dayjs";

export default function OrderDetailsView() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useGetOrderByIdQuery(id!);
  const theme = useTheme();

  if (isLoading)
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ height: "80vh" }}>
        <CircularProgress />
      </Stack>
    );

  const order = data?.data?.order ?? data?.order;
  const loyalty = data?.data?.loyaltyAccount ?? data?.loyaltyAccount;

  if (!order)
    return (
      <Typography sx={{ p: 3, color: "text.secondary" }}>
        No order data found.
      </Typography>
    );

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        backgroundColor: theme.palette.background.default,
        minHeight: "100vh",
      }}
    >
      {/* Back Button */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate("/order")}
        variant="text"
        sx={{
          mb: 3,
          textTransform: "none",
          fontWeight: 600,
          color: theme.palette.primary.main,
        }}
      >
        Back to Orders
      </Button>

      {/* Hero Header */}
      <Card
        elevation={4}
        sx={{
          borderRadius: 3,
          mb: 4,
          backgroundColor: "#fff",
          p: 3,
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={3}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#212121" }}>
              Order #{order.orderNo}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
              Placed on {dayjs(order.orderCreatedAt).format("DD MMM YYYY, hh:mm A")}
            </Typography>
          </Box>

          <Stack direction="row" spacing={2} alignItems="center">
            <Chip
              label={order.status.toUpperCase()}
              sx={{
                fontWeight: 600,
                backgroundColor:
                  order.status === "completed"
                    ? "#E8F5E9"
                    : order.status === "inprogress"
                    ? "#FFF8E1"
                    : "#E3F2FD",
                color:
                  order.status === "completed"
                    ? "#2E7D32"
                    : order.status === "inprogress"
                    ? "#F57C00"
                    : "#1976D2",
              }}
            />
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#212121" }}>
              {order.metadata?.formattedTotal ||
                `${order.metadata?.totalAmount || 0} ${
                  order.metadata?.currency || ""
                }`}
            </Typography>
          </Stack>
        </Stack>
      </Card>

      {/* Info Cards */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={3}
        sx={{ mb: 4, flexWrap: "wrap" }}
      >
        {/* Order Info */}
        <Card
          elevation={2}
          sx={{
            flex: 1,
            borderRadius: 3,
            p: 1,
            transition: "all 0.2s ease",
            "&:hover": { boxShadow: "0 6px 20px rgba(0,0,0,0.08)" },
          }}
        >
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5 }}>
              Order Info
            </Typography>
            <Stack spacing={1} sx={{ color: "text.secondary" }}>
              <Typography variant="body2">
                <strong>Payment Type:</strong> {order.paymentType}
              </Typography>
              <Typography variant="body2">
                <strong>Tracking No:</strong> {order.trackingNo || "-"}
              </Typography>
              <Typography variant="body2">
                <strong>Carrier:</strong> {order.carrier || "-"}
              </Typography>
              <Typography variant="body2">
                <strong>Created At:</strong>{" "}
                {dayjs(order.createdAt).format("DD MMM YYYY, hh:mm A")}
              </Typography>
            </Stack>
          </CardContent>
        </Card>

        {/* Customer Info */}
        <Card
          elevation={2}
          sx={{
            flex: 1,
            borderRadius: 3,
            p: 1,
            transition: "all 0.2s ease",
            "&:hover": { boxShadow: "0 6px 20px rgba(0,0,0,0.08)" },
          }}
        >
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5 }}>
              Customer Info
            </Typography>
            <Stack spacing={1} sx={{ color: "text.secondary" }}>
              <Typography variant="body2">
                <strong>Name:</strong> {order.customer?.name}
              </Typography>
              <Typography variant="body2">
                <strong>Email:</strong> {order.customer?.email || "-"}
              </Typography>
              <Typography variant="body2">
                <strong>Phone:</strong> {order.customer?.phone}
              </Typography>
              <Typography variant="body2">
                <strong>Address:</strong> {order.customer?.address || "-"}
              </Typography>
              <Typography variant="body2">
                <strong>State:</strong> {order.customer?.state || "-"}
              </Typography>
            </Stack>
          </CardContent>
        </Card>

        {/* Loyalty Info */}
        {loyalty && (
          <Card
            elevation={2}
            sx={{
              flex: 1,
              borderRadius: 3,
              p: 1,
              transition: "all 0.2s ease",
              "&:hover": { boxShadow: "0 6px 20px rgba(0,0,0,0.08)" },
            }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5 }}>
                Loyalty Summary
              </Typography>
              <Stack spacing={1} sx={{ color: "text.secondary" }}>
                <Typography variant="body2">
                  <strong>Balance:</strong> {loyalty.points_balance}
                </Typography>
                <Typography variant="body2">
                  <strong>Redeemed:</strong> {loyalty.points_redeemed}
                </Typography>
                <Typography variant="body2">
                  <strong>Lifetime Points:</strong> {loyalty.lifetime_points}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        )}
      </Stack>

      {/* Order Items */}
      <Card
        elevation={3}
        sx={{
          borderRadius: 3,
          p: 2,
          boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Order Items
        </Typography>
        <Paper
          variant="outlined"
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            "& .MuiTableRow-root:hover": {
              backgroundColor: "#fff7ed",
            },
          }}
        >
          <Table>
            <TableHead sx={{ backgroundColor: "#fff3e0" }}>
              <TableRow>
                {[
                  "Product",
                  "SKU",
                  "Amount",
                  "Currency",
                  "Points",
                  "Qty",
                ].map((head) => (
                  <TableCell key={head} sx={{ fontWeight: 700 }}>
                    {head}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {order.orderItems?.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell>{item.product?.productName}</TableCell>
                  <TableCell>{item.product?.sku}</TableCell>
                  <TableCell>{item.product?.amount}</TableCell>
                  <TableCell>{item.product?.currency}</TableCell>
                  <TableCell>{item.product?.points}</TableCell>
                  <TableCell>{item.qty}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Card>
    </Box>
  );
}
