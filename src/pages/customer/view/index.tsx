import * as React from "react";
import {
  Avatar,
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Container,
  Divider,
  Grid,
  IconButton,
  Link,
  Paper,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
  Switch,
} from "@mui/material";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DoNotDisturbAltOutlinedIcon from "@mui/icons-material/DoNotDisturbAltOutlined";
import MessageOutlinedIcon from "@mui/icons-material/MessageOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import LocalMallOutlinedIcon from "@mui/icons-material/LocalMallOutlined";
import StarOutlineOutlinedIcon from "@mui/icons-material/StarOutlineOutlined";
import CircleIcon from "@mui/icons-material/Circle";

/* ---------------------------------- Types --------------------------------- */

type StatusType = "Active" | "Pending" | "Inactive";

export interface NotificationPreferences {
  orderUpdates: boolean;
  loyaltyRewards: boolean;
  promotionalMessages: boolean;
}

export interface UserDetails {
  id: string; // e.g., "USR001"
  name: string; // "John Doe"
  status: StatusType; // "Active"
  email: string;
  phone: string;
  address: string; // multiline allowed with \n
  enrollmentDate: string; // "15/08/2024"
  lastActive: string; // "03/11/2025"
  gender: string; // "Male"
  enrollmentMethod: string; // "Admin Enrolled"
  tier: string; // "Gold Member"
  totalOrders: number; // 1
  totalSpent: string; // "₹249.99"
  loyaltyPoints: number; // 2450
  notificationPreferences: NotificationPreferences;
}

interface UserDetailsViewProps {
  user?: UserDetails; // safe default applied below
  onBack?: () => void;
  onEdit?: (user: UserDetails) => void;
  onDeactivate?: (user: UserDetails) => void;
  onMessage?: (user: UserDetails) => void;
  onDelete?: (user: UserDetails) => void;
  onPrefChange?: (
    key: keyof NotificationPreferences,
    value: boolean,
    user: UserDetails
  ) => void;
}

/* ------------------------------ Helper Pieces ----------------------------- */

const STATUS_STYLES: Record<
  StatusType,
  { bg: string; text: string; dot: string }
> = {
  Active: { bg: "#E7F7EE", text: "#12A150", dot: "#12A150" },
  Pending: { bg: "#FFF2DD", text: "#C77800", dot: "#F59E0B" },
  Inactive: { bg: "#ECECEF", text: "#51535A", dot: "#51535A" },
};

function StatusChip({ status }: { status: StatusType }) {
  const s = STATUS_STYLES[status];
  return (
    <Chip
      size="small"
      icon={<CircleIcon sx={{ fontSize: 10, color: s.dot }} />}
      label={status}
      sx={{
        bgcolor: s.bg,
        color: s.text,
        height: 22,
        borderRadius: "10px",
        px: 1,
        "& .MuiChip-icon": { mr: 0.5 },
        fontWeight: 600,
        fontSize: 11.5,
      }}
    />
  );
}

// screenshot shows a soft orange switch
const OrangeSwitch = (props: React.ComponentProps<typeof Switch>) => (
  <Switch
    {...props}
    sx={{
      width: 44,
      height: 26,
      padding: 0.5,
      "& .MuiSwitch-switchBase": {
        padding: 0.5,
        "&.Mui-checked": {
          transform: "translateX(18px)",
          color: "#fff",
          "& + .MuiSwitch-track": {
            bgcolor: "#F59E0B",
            opacity: 1,
          },
        },
      },
      "& .MuiSwitch-thumb": { width: 20, height: 20 },
      "& .MuiSwitch-track": {
        borderRadius: 13,
        bgcolor: "#EDE9FE1A",
        border: "1px solid #F4E7D3",
        opacity: 1,
      },
    }}
  />
);

/* --------------------------------- Tabs UI -------------------------------- */

function SectionTabs({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <Box
      sx={{
        mt: 2,
        px: 2,
      }}
    >
      <Box
        sx={{
          position: "relative",
          bgcolor: "#FEF4E6",
          borderRadius: 10,
          height: 26,
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        {/* indicator background */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: `${(value * 100) / 3}%`,
            width: "33.3333%",
            transition: "left 220ms ease",
            bgcolor: "#FBE8CF",
            borderRadius: 10,
          }}
        />
        <Tabs
          value={value}
          onChange={(_, v) => onChange(v)}
          variant="fullWidth"
          sx={{
            minHeight: 26,
            height: 26,
            "& .MuiTabs-flexContainer": { position: "relative", zIndex: 1 },
            "& .MuiTab-root": {
              minHeight: 26,
              height: 26,
              textTransform: "none",
              fontWeight: 600,
              fontSize: 12.5,
              color: "#825B2B",
            },
            "& .MuiTabs-indicator": { display: "none" },
          }}
        >
          <Tab label="Basic Details" />
          <Tab label="Loyalty Details" />
          <Tab label="Order Tracking" />
        </Tabs>
      </Box>
    </Box>
  );
}

/* ------------------------------ Reusable cards ---------------------------- */

function CardShell({
  children,
  sx,
}: React.PropsWithChildren<{ sx?: any }>) {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2.5,
        border: "1px solid #F3E9D9",
        bgcolor: "#FFFFFF",
        p: 2,
        ...sx,
      }}
    >
      {children}
    </Paper>
  );
}

function LabeledItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Box sx={{ color: "#9CA3AF" }}>{icon}</Box>
        <Typography sx={{ color: "#6B7280", fontSize: 12.5 }}>
          {label}
        </Typography>
      </Stack>
      <Typography sx={{ fontSize: 14.5, color: "#111827" }}>{value}</Typography>
    </Box>
  );
}

/* -------------------------------- Main View ------------------------------- */

export default function UserDetailsView({
  user,
  onBack,
  onEdit,
  onDeactivate,
  onMessage,
  onDelete,
  onPrefChange,
}: UserDetailsViewProps) {
  // safety fallback to avoid undefined reads
  const u: UserDetails = user ?? {
    id: "USR001",
    name: "John Doe",
    status: "Active",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main Street\nNew York, NY 10001\nUnited States",
    enrollmentDate: "15/08/2024",
    lastActive: "03/11/2025",
    gender: "Male",
    enrollmentMethod: "Admin Enrolled",
    tier: "Gold Member",
    totalOrders: 1,
    totalSpent: "₹249.99",
    loyaltyPoints: 2450,
    notificationPreferences: {
      orderUpdates: true,
      loyaltyRewards: true,
      promotionalMessages: false,
    },
  };

  const [tab, setTab] = React.useState(0);
  const [prefs, setPrefs] = React.useState<NotificationPreferences>(
    u.notificationPreferences
  );

  const handlePref = (key: keyof NotificationPreferences, val: boolean) => {
    const next = { ...prefs, [key]: val };
    setPrefs(next);
    onPrefChange?.(key, val, u);
  };

  return (
    <Box sx={{ bgcolor: "#FAFAFB", minHeight: "100vh" }}>
      <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 } }}>
        {/* Breadcrumbs */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{ color: "#6B7280" }}
        >
          <Breadcrumbs aria-label="breadcrumb" sx={{ fontSize: 13.5 }}>
            <Link underline="hover" color="inherit" onClick={onBack} sx={{ cursor: "pointer" }}>
              Dashboard
            </Link>
            <Link underline="hover" color="inherit" sx={{ cursor: "pointer" }}>
              Customer Management
            </Link>
            <Typography color="text.primary">{u.name}</Typography>
          </Breadcrumbs>
        </Stack>

        {/* Header Row */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mt: 1.5 }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <IconButton onClick={onBack} size="small">
              <ArrowBackIosNewRoundedIcon fontSize="small" />
            </IconButton>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: "#2563EB1A",
                color: "#2563EB",
                fontWeight: 700,
              }}
            >
              {u.name
                .split(" ")
                .map((s) => s[0])
                .join("")
                .substring(0, 2)
                .toUpperCase()}
            </Avatar>
            <Box>
              <Typography
                sx={{
                  fontSize: 18,
                  fontWeight: 700,
                  letterSpacing: "-0.01em",
                  color: "#111827",
                  lineHeight: 1.2,
                }}
              >
                {u.name}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                <Typography sx={{ color: "#6B7280", fontSize: 12.5 }}>
                  Customer ID: {u.id}
                </Typography>
                <StatusChip status={u.status} />
              </Stack>
            </Box>
          </Stack>

          {/* Actions */}
          <Stack direction="row" spacing={1}>
            <Tooltip title="Edit">
              <Button
                variant="outlined"
                size="small"
                startIcon={<EditOutlinedIcon />}
                onClick={() => onEdit?.(u)}
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  borderColor: "#E5E7EB",
                  color: "#111827",
                  fontWeight: 600,
                  bgcolor: "#fff",
                  "&:hover": { borderColor: "#D1D5DB", bgcolor: "#fff" },
                  px: 1.25,
                }}
              >
                Edit
              </Button>
            </Tooltip>
            <Tooltip title="Deactivate">
              <Button
                variant="outlined"
                size="small"
                startIcon={<DoNotDisturbAltOutlinedIcon />}
                onClick={() => onDeactivate?.(u)}
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  borderColor: "#E5E7EB",
                  color: "#111827",
                  fontWeight: 600,
                  bgcolor: "#fff",
                  "&:hover": { borderColor: "#D1D5DB", bgcolor: "#fff" },
                  px: 1.25,
                }}
              >
                Deactivate
              </Button>
            </Tooltip>
            <Tooltip title="Message">
              <Button
                variant="outlined"
                size="small"
                startIcon={<MessageOutlinedIcon />}
                onClick={() => onMessage?.(u)}
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  borderColor: "#D1FAE5",
                  color: "#059669",
                  fontWeight: 700,
                  bgcolor: "#ECFDF5",
                  "&:hover": { borderColor: "#A7F3D0", bgcolor: "#ECFDF5" },
                  px: 1.25,
                }}
              >
                Message
              </Button>
            </Tooltip>
            <Tooltip title="Delete">
              <Button
                variant="outlined"
                size="small"
                startIcon={<DeleteOutlineOutlinedIcon />}
                onClick={() => onDelete?.(u)}
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  borderColor: "#FEE2E2",
                  color: "#B91C1C",
                  fontWeight: 600,
                  bgcolor: "#FEF2F2",
                  "&:hover": { borderColor: "#FECACA", bgcolor: "#FEF2F2" },
                  px: 1.25,
                }}
              >
                Delete
              </Button>
            </Tooltip>
          </Stack>
        </Stack>

        {/* Tabs */}
        <SectionTabs value={tab} onChange={setTab} />

        {/* Content: Split grid */}
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {/* LEFT COLUMN */}
          <Grid >
            {/* Contact Information */}
            <CardShell>
              <Typography sx={{ fontWeight: 700, mb: 1 }}>
                Contact Information
              </Typography>
              <Typography sx={{ color: "#6B7280", fontSize: 12.5, mb: 2 }}>
                User’s contact details and address
              </Typography>

              <Grid container spacing={2}>
                <Grid >
                  <CardShell sx={{ p: 1.5 }}>
                    <LabeledItem
                      icon={<EmailOutlinedIcon fontSize="small" />}
                      label="Email"
                      value={u.email}
                    />
                  </CardShell>
                </Grid>
                <Grid >
                  <CardShell sx={{ p: 1.5 }}>
                    <LabeledItem
                      icon={<PhoneOutlinedIcon fontSize="small" />}
                      label="Phone"
                      value={u.phone}
                    />
                  </CardShell>
                </Grid>

                <Grid >
                  <CardShell sx={{ p: 1.5 }}>
                    <LabeledItem
                      icon={<LocationOnOutlinedIcon fontSize="small" />}
                      label="Address"
                      value={
                        <Box sx={{ whiteSpace: "pre-line" }}>{u.address}</Box>
                      }
                    />
                  </CardShell>
                </Grid>

                <Grid>
                  <CardShell sx={{ p: 1.5 }}>
                    <LabeledItem
                      icon={<EventOutlinedIcon fontSize="small" />}
                      label="Enrollment Date"
                      value={u.enrollmentDate}
                    />
                  </CardShell>
                </Grid>
                <Grid >
                  <CardShell sx={{ p: 1.5 }}>
                    <LabeledItem
                      icon={<AccessTimeOutlinedIcon fontSize="small" />}
                      label="Last Active"
                      value={u.lastActive}
                    />
                  </CardShell>
                </Grid>
              </Grid>
            </CardShell>

            {/* Additional Information */}
            <CardShell sx={{ mt: 2 }}>
              <Typography sx={{ fontWeight: 700, mb: 1.5 }}>
                Additional Information
              </Typography>

              <Grid container spacing={2}>
                <Grid >
                  <Typography sx={{ color: "#6B7280", fontSize: 12.5 }}>
                    Gender
                  </Typography>
                  <Typography sx={{ mt: 0.5 }}> {u.gender} </Typography>
                </Grid>
                <Grid >
                  <Typography sx={{ color: "#6B7280", fontSize: 12.5 }}>
                    Enrollment Method
                  </Typography>
                  <Typography sx={{ mt: 0.5 }}> {u.enrollmentMethod} </Typography>
                </Grid>
                <Grid >
                  <Typography sx={{ color: "#6B7280", fontSize: 12.5 }}>
                    Customer Tier
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      size="small"
                      label={u.tier}
                      sx={{
                        bgcolor: "#FFF2DD",
                        color: "#C77800",
                        borderRadius: "8px",
                        height: 22,
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </CardShell>

            {/* Notification Preferences */}
            <CardShell sx={{ mt: 2 }}>
              <Typography sx={{ fontWeight: 700 }}>Notification Preferences</Typography>
              <Typography sx={{ color: "#6B7280", fontSize: 12.5, mb: 1.5 }}>
                Manage how this user receives notifications
              </Typography>

              {/* Row 1 */}
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  borderTop: "1px solid #F3E9D9",
                  py: 1.25,
                }}
              >
                <Box>
                  <Typography sx={{ fontWeight: 600, fontSize: 14.5 }}>
                    Order Updates
                  </Typography>
                  <Typography sx={{ color: "#6B7280", fontSize: 12.5 }}>
                    Receive notifications about order status
                  </Typography>
                </Box>
                <OrangeSwitch
                  checked={prefs.orderUpdates}
                  onChange={(_, v) => handlePref("orderUpdates", v)}
                />
              </Stack>

              {/* Row 2 */}
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  borderTop: "1px solid #F3E9D9",
                  py: 1.25,
                }}
              >
                <Box>
                  <Typography sx={{ fontWeight: 600, fontSize: 14.5 }}>
                    Loyalty Rewards
                  </Typography>
                  <Typography sx={{ color: "#6B7280", fontSize: 12.5 }}>
                    Get notified about points and rewards
                  </Typography>
                </Box>
                <OrangeSwitch
                  checked={prefs.loyaltyRewards}
                  onChange={(_, v) => handlePref("loyaltyRewards", v)}
                />
              </Stack>

              {/* Row 3 */}
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  borderTop: "1px solid #F3E9D9",
                  py: 1.25,
                }}
              >
                <Box>
                  <Typography sx={{ fontWeight: 600, fontSize: 14.5 }}>
                    Promotional Messages
                  </Typography>
                  <Typography sx={{ color: "#6B7280", fontSize: 12.5 }}>
                    Receive offers and promotions
                  </Typography>
                </Box>
                <OrangeSwitch
                  checked={prefs.promotionalMessages}
                  onChange={(_, v) => handlePref("promotionalMessages", v)}
                />
              </Stack>
            </CardShell>
          </Grid>

          {/* RIGHT COLUMN */}
          <Grid >
            <CardShell>
              <Typography sx={{ fontWeight: 700, mb: 1 }}>
                Quick Stats
              </Typography>
              <Typography sx={{ color: "#6B7280", fontSize: 12.5, mb: 1.5 }}>
                User activity summary
              </Typography>

              <Stack spacing={1.25}>
                {/* Total Orders */}
                <Paper
                  variant="outlined"
                  sx={{
                    borderColor: "#E7EEF6",
                    bgcolor: "#EEF5FC",
                    p: 1.5,
                    borderRadius: 2,
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <LocalMallOutlinedIcon sx={{ color: "#6B7280" }} fontSize="small" />
                    <Typography sx={{ color: "#6B7280", fontSize: 12.5 }}>
                      Total Orders
                    </Typography>
                  </Stack>
                  <Typography sx={{ mt: 0.5, fontSize: 18, fontWeight: 700 }}>
                    {u.totalOrders}
                  </Typography>
                </Paper>

                {/* Total Spent */}
                <Paper
                  variant="outlined"
                  sx={{
                    borderColor: "#DCF6EA",
                    bgcolor: "#EFFFF6",
                    p: 1.5,
                    borderRadius: 2,
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <MonetizationOnOutlinedIcon sx={{ color: "#10B981" }} fontSize="small" />
                    <Typography sx={{ color: "#6B7280", fontSize: 12.5 }}>
                      Total Spent
                    </Typography>
                  </Stack>
                  <Typography sx={{ mt: 0.5, fontSize: 18, fontWeight: 700 }}>
                    {u.totalSpent}
                  </Typography>
                </Paper>

                {/* Loyalty Points */}
                <Paper
                  variant="outlined"
                  sx={{
                    borderColor: "#FDEFD7",
                    bgcolor: "#FFF7EA",
                    p: 1.5,
                    borderRadius: 2,
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <StarOutlineOutlinedIcon sx={{ color: "#F59E0B" }} fontSize="small" />
                    <Typography sx={{ color: "#6B7280", fontSize: 12.5 }}>
                      Loyalty Points
                    </Typography>
                  </Stack>
                  <Typography sx={{ mt: 0.5, fontSize: 18, fontWeight: 700 }}>
                    {u.loyaltyPoints}
                  </Typography>
                </Paper>
              </Stack>
            </CardShell>
          </Grid>
        </Grid>

        {/* Optional divider below entire page */}
        <Divider sx={{ mt: 3, borderColor: "transparent" }} />
      </Container>
    </Box>
  );
}
