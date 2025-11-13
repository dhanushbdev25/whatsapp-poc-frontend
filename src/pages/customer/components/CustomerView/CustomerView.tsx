import * as React from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { CheckCircle2, Edit3, MessageSquare, Power, Trash2, Truck } from "lucide-react";
import { CustomerViewContent } from "./CustomerViewContent";
import { useCustomerById } from "../../hooks/useCustomer";
import { Customer, CustomerOrder } from "../../types/customers.type";
import mock from "../../customerJson.json";
import { useParams } from "react-router-dom";
import CustomerList from "./CustomerList";
import CustomerOrderTrack from "./CustomerOrderTrack";
import CustomerOrderStatus, { OrderTracking } from "./CustomerOrderStatus";

type TabKey = "basic" | "loyalty" | "order";

const tabs: { key: TabKey; label: string }[] = [
  { key: "basic", label: "Basic Details" },
  { key: "loyalty", label: "Loyalty Details" },
  { key: "order", label: "Order Tracking" },
];

const headerCardStyle = {
  p: 2,
  borderRadius: 2,
  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
  border: (t: any) => `1px solid ${t.palette.divider}`,
  bgcolor: "background.paper",
};

export default function CustomerView() {
  const { id } = useParams();
  const customerId: any = id;
  const { data, isLoading, error }: any = useCustomerById(customerId);

  const [tab, setTab] = React.useState<TabKey>("basic");
  const [openTrack, setOpenTrack] = React.useState(false);
  const [selectedOrder, setSelectedOrder] = React.useState<CustomerOrder | null>(null);

  const customer = data as any | undefined;

  const handleOpenTrack = (order: CustomerOrder) => {
    setSelectedOrder(order);
    setOpenTrack(true);
  };

  const handleCloseTrack = () => {
    setOpenTrack(false);
  };

  const initials = React.useMemo(() => {
    if (!customer?.name) return "CU";
    const parts = customer.name.trim().split(/\s+/);
    return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
  }, [customer?.name]);

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* TOP HEADER */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar sx={{ width: 56, height: 56, fontWeight: 600, fontSize: "1.25rem", bgcolor: "primary.main" }}>
            {initials.toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.2, mb: 0.5 }}>
              {customer?.name ?? <Skeleton width={160} />}
            </Typography>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.875rem" }}>
                Customer ID: {customer?.customerID ?? "—"}
              </Typography>
              <Chip
                size="small"
                label={customer?.isActive ? "Active" : "Inactive"}
                color={customer?.isActive ? "success" : "default"}
                variant="outlined"
                sx={{ borderRadius: "6px", height: 24, fontSize: "0.75rem", fontWeight: 600 }}
              />
            </Stack>
          </Box>
        </Stack>

        {/* Header actions */}
        <Stack direction="row" spacing={1}>
          <Tooltip title="Edit">
            <IconButton size="small" sx={{ border: "1px solid", borderColor: "divider" }}>
              <Edit3 size={18} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Deactivate">
            <IconButton size="small" sx={{ border: "1px solid", borderColor: "divider" }}>
              <Power size={18} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Message">
            <Button variant="contained" color="success" size="small" startIcon={<MessageSquare size={16} />} sx={{ textTransform: "none" }}>
              Message
            </Button>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" color="error" sx={{ border: "1px solid", borderColor: "divider" }}>
              <Trash2 size={18} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {/* TABS */}
      <Paper elevation={0} sx={{ borderRadius: 2, overflow: "hidden", mb: 3, border: "1px solid", borderColor: "divider" }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="fullWidth"
          sx={{
            minHeight: 48,
            bgcolor: "background.paper",
            "& .MuiTab-root": {
              textTransform: "none",
              minHeight: 48,
              fontWeight: 600,
              fontSize: "0.9375rem",
              color: "text.secondary",
              "&.Mui-selected": {
                color: "text.primary",
                bgcolor: "rgba(255, 248, 225, 0.5)",
              },
            },
            "& .MuiTabs-indicator": {
              height: 3,
              bgcolor: "warning.main",
            },
          }}
        >
          {tabs.map((t) => (
            <Tab key={t.key} label={t.label} value={t.key} />
          ))}
        </Tabs>
      </Paper>

      {/* SUMMARY CARDS - Only show on Order Tracking tab */}
      {tab === "order" && (
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3 }}>
          <Card sx={headerCardStyle} variant="outlined">
            <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8125rem", mb: 1 }}>
                Total Orders
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, fontSize: "2rem" }}>
                {customer?.orders?.length ?? 0}
              </Typography>
            </CardContent>
          </Card>
          <Card sx={headerCardStyle} variant="outlined">
            <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8125rem", mb: 1 }}>
                Ongoing
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, fontSize: "2rem" }}>
                {(customer?.orders ?? []).filter((o: any) => o.status !== "completed").length}
              </Typography>
            </CardContent>
          </Card>
          <Card sx={headerCardStyle} variant="outlined">
            <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8125rem", mb: 1 }}>
                Completed
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, fontSize: "2rem" }}>
                {(customer?.orders ?? []).filter((o: any) => o.status === "completed").length}
              </Typography>
            </CardContent>
          </Card>
          <Card sx={headerCardStyle} variant="outlined">
            <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8125rem", mb: 1 }}>
                Total Value
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, fontSize: "2rem" }}>
                ₹249.99
              </Typography>
            </CardContent>
          </Card>
        </Stack>
      )}

      {/* CONTENT */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 2,
          border: (t) => `1px solid ${t.palette.divider}`,
          bgcolor: "background.paper",
        }}
      >
        {isLoading && (
          <Stack spacing={2}>
            <Skeleton height={42} />
            <Skeleton height={120} />
            <Skeleton height={240} />
          </Stack>
        )}

        {error && (
          <Stack alignItems="center" spacing={1} sx={{ py: 6 }}>
            <Typography color="error" fontWeight={600}>
              Failed to load customer
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Showing sample data instead.
            </Typography>
          </Stack>
        )}

        {!isLoading && (
          <CustomerViewContent
            tab={tab}
            customer={customer as Customer}
            onTrack={(order) => handleOpenTrack(order)}
          />
        )}
      </Paper>

      {/* ORDER TRACKING DIALOG */}
      <Dialog
        open={openTrack}
        onClose={handleCloseTrack}
        maxWidth="md"
        fullWidth
        slotProps={{
          backdrop: { sx: { bgcolor: "rgba(0,0,0,0.3)" } },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Truck size={18} />
            <Typography variant="subtitle1" fontWeight={700}>
              Order Details
            </Typography>
            <Chip
              size="small"
              color="warning"
              variant="outlined"
              label={(selectedOrder?.status ?? "inprogress") === "inprogress" ? "Out for Delivery" : selectedOrder?.status}
              sx={{ ml: 1, borderRadius: 1 }}
            />
          </Stack>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          {selectedOrder ? (
            <Stack spacing={2}>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <Card variant="outlined" sx={{ flex: 1 }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Order Information
                    </Typography>
                    <Stack spacing={0.5} sx={{ mt: 1 }}>
                      <CustomerOrderTrack label="Order ID" value={selectedOrder.orderNo} />

                      <CustomerOrderTrack
                        label="Order Date"
                        value={new Date(selectedOrder.orderCreatedAt).toLocaleDateString()}
                      />
                      <CustomerOrderTrack label="Payment Method" value={selectedOrder.paymentType ?? "—"} />
                      <CustomerOrderTrack label="Total Amount" value="₹249.99" />
                    </Stack>
                  </CardContent>
                </Card>

                <Card variant="outlined" sx={{ flex: 1 }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Delivery Information
                    </Typography>
                    <Stack spacing={0.5} sx={{ mt: 1 }}>
                      <CustomerOrderTrack label="Shipping Address" value={selectedOrder.shipToAddress ?? "—"} />
                      <CustomerOrderTrack label="Tracking Number" value={selectedOrder.trackingNo ?? "—"} />
                      <CustomerOrderTrack label="Carrier" value={selectedOrder.carrier ?? "FedEx"} />
                      <CustomerOrderTrack
                        label="Last Updated"
                        value={new Date(customer?.loyaltyAccounts?.updatedAt ?? Date.now()).toLocaleString()}
                      />
                    </Stack>
                  </CardContent>
                </Card>
              </Stack>

              <Card variant="outlined">
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Order Items
                  </Typography>
                  <Box sx={{ mt: 1, border: (t) => `1px solid ${t.palette.divider}`, borderRadius: 1 }}>
                    <CustomerList name="Premium Widget Pro" qty={2} unit="₹99.99" total="₹199.98" />
                    <Divider />
                    <CustomerList name="Accessory Kit" qty={1} unit="₹49.99" total="₹49.99" />
                  </Box>
                </CardContent>
              </Card>

              <Card variant="outlined">
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Live Tracking
                  </Typography>

                  <Paper
                    elevation={1}
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      // border: "1px solid",
                      borderColor: "divider"
                    }}
                  >

                    <OrderTracking></OrderTracking>
                  </Paper>

                </CardContent>
              </Card>
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No order selected.
            </Typography>
          )}
        </DialogContent>
        <Divider />
        <DialogActions>
          <Button onClick={handleCloseTrack} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

