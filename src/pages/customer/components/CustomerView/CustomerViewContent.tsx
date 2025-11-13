import * as React from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import { Customer, CustomerOrder } from "../../types/customers.type";
import dayjs from "dayjs";


interface MemberDetails {
  currentTier: "Bronze" | "Silver" | "Gold" | "Platinum";
}

interface Props {
  memberDetails: MemberDetails;
}
export function CustomerViewContent({
  tab,
  customer,
  onTrack,
}: {
  tab: "basic" | "loyalty" | "order";
  customer: any;
  onTrack: (order: CustomerOrder) => void;
}) {
  if (!customer) return null;

  // ORDER TRACKING TAB
  if (tab === "order") {
    const ongoingOrders = (customer.orders ?? []).filter((o: any) => o.status !== "completed");
    const pastOrders = (customer.orders ?? []).filter((o: any) => o.status === "completed");

    return (
      <Stack spacing={3}>
        {/* Ongoing Orders */}
        <Section title="Ongoing Orders" subtitle="Track your current shipments" icon="🚚">
          <TableHeader headers={["Order ID", "Date", "Products", "Amount", "Status", "Actions"]} />
          {ongoingOrders.length === 0 ? (
            <EmptyRow text="No ongoing orders" />
          ) : (
            ongoingOrders.map((o: any) => (
              <Row
                key={o.id}
                cells={[
                  <Linkish>{o.orderNo}</Linkish>,
                  new Date(o.orderCreatedAt).toLocaleDateString(),
                  `${o.orderName ?? o.metadata?.productItems?.[0]?.productName ?? "—"}`,
                  o.metadata?.formattedTotal ?? "₹249.99",
                  <Chip
                    size="small"
                    variant="outlined"
                    color="warning"
                    label="Out for Delivery"
                    sx={{
                      borderRadius: "6px",
                      fontSize: "1.4 rem", fontWeight: 700,
                    }}
               
                  />,
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => onTrack(o)}
                    sx={{
                      textTransform: "none",
                      fontWeight: 800,
                      fontSize: "1.4 rem",      
                      py: 0.25,                   
                      px: 1,                     
                      borderRadius: "6px",     
                      minWidth: "auto",           
                      lineHeight: 1.2,       
                    }}
                  >
                    Track
                  </Button>,
                ]}
              />
            ))
          )}
        </Section>

        {/* Past Orders */}
        <Section title="Past Orders" subtitle="Complete order history" icon="✅">
          <TableHeader headers={["Order ID", "Date", "Products", "Amount", "Status", "Actions"]} />
          {pastOrders.length === 0 ? (
            <EmptyRow text="No past orders found" />
          ) : (
            pastOrders.map((o: any) => (
              <Row
                key={o.id}
                cells={[
                  <Linkish>{o.orderNo}</Linkish>,
                  new Date(o.orderCreatedAt).toLocaleDateString(),
                  `${o.orderName ?? o.metadata?.productItems?.[0]?.productName ?? "—"}`,
                  o.metadata?.formattedTotal ?? "₹249.99",
                  <Chip
                    size="small"
                    variant="outlined"
                    color="success"
                    label="Completed"
                    sx={{ borderRadius: "6px", fontWeight: 600 }}
                  />,
                  <Typography variant="body2" color="text.secondary">
                    —
                  </Typography>,
                ]}
              />
            ))
          )}
        </Section>
      </Stack>
    );
  }

  // BASIC DETAILS TAB (Contact Information)
  if (tab === "basic") {
    return (
      <Stack spacing={3}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
          <Paper variant="outlined" sx={{ flex: 1, p: 3, borderRadius: 2 }}>
            <Typography fontWeight={700} sx={{ fontSize: "1rem", mb: 2 }}>
              Contact Information
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: "block" }}>
              User's contact details and address
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Stack spacing={2}>
              <InfoWithIcon icon="📧" label="Email" value={customer.email} />
              <InfoWithIcon icon="📞" label="Phone" value={customer.phone} />
              <InfoWithIcon
                icon="📍"
                label="Address"
                value={`${customer.address}, ${customer.state} ${customer.pincode}`}
              />
              <InfoWithIcon
                icon="📅"
                label="Enrollment Date"
                value={new Date(customer.createdAt).toLocaleDateString()}
              />
              <InfoWithIcon
                icon="🕒"
                label="Last Active"
                value={new Date(customer.latestActive).toLocaleDateString()}
              />
            </Stack>
          </Paper>

          <Paper variant="outlined" sx={{ width: { xs: 1, md: 380 }, p: 3, borderRadius: 2 }}>
            <Typography fontWeight={700} sx={{ fontSize: "1rem", mb: 2 }}>
              Quick Stats
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: "block" }}>
              User activity summary
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Stack spacing={2.5}>
              <StatWithIcon icon="🛍️" label="Total Orders" value={(customer.orders ?? []).length} />
              <StatWithIcon icon="💰" label="Total Spent" value="₹249.99" />
              <StatWithIcon
                icon="⭐"
                label="Loyalty Points"
                value={customer.loyaltyAccounts?.points_balance ?? 0}
              />
            </Stack>
          </Paper>
        </Stack>

        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
          <Typography fontWeight={700} sx={{ fontSize: "1rem", mb: 2 }}>
            Additional Information
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
            <InfoItem label="Gender" value={capitalize(customer.gender)} />
            <InfoItem label="Enrollment Method" value="Admin Enrolled" />
            <InfoItem
              label="Customer Tier"
              value={
                <Chip
                  label="Gold Member"
                  size="small"
                  color="warning"
                  sx={{ borderRadius: "6px", fontWeight: 600 }}
                />
              }
            />
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
          <Typography fontWeight={700} sx={{ fontSize: "1rem", mb: 1 }}>
            Notification Preferences
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: "block" }}>
            Manage how this user receives notifications
          </Typography>
          <Divider sx={{ my: 2 }} />

          <Stack spacing={2}>
            <PrefRow
              label="Order Updates"
              subtitle="Receive notifications about order status"
              enabled={!customer.notificationPreferences?.orderUpdates}
            />
            <PrefRow
              label="Loyalty Rewards"
              subtitle="Get notified about points and rewards"
              enabled={!customer.notificationPreferences?.loyaltyRewards}
            />
            <PrefRow
              label="Promotional Messages"
              subtitle="Receive offers and promotions"
              enabled={!customer.notificationPreferences?.promotionalMessages}
            />
          </Stack>
        </Paper>
      </Stack>
    );
  }
  // LOYALTY DETAILS TAB
  if (tab === "loyalty") {
    const la: any = customer.loyaltyAccounts;
    const memberDetails: any = customer.tierProgress;
    const tier = memberDetails.currentTier;

    const tierStyles: Record<string, any> = {
      Bronze: {
        backgroundColor: "#cd7f32", // Bronze color
        color: "#fff",
      },
      Silver: {
        backgroundColor: "#C0C0C0", // Silver color
        color: "#000",
      },
      Gold: {
        backgroundColor: "#FFD700", // Gold color
        color: "#000",
      },
      Platinum: {
        backgroundColor: "#E5E4E2", // Platinum color
        color: "#000",
      },
    };

    return (
      <Stack spacing={3}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <StatCard
            icon="⭐"
            title="Current Points"
            value={la?.points_balance ?? 2450}
            color="#60a5fa"
          />
          <StatCard
            icon="📈"
            title="Lifetime Points"
            value={la?.lifetime_points ?? 3185}
            color="#34d399"
          />
          <StatCard
            icon="🎁"
            title="Points Redeemed"
            value={la?.points_redeemed ?? 735}
            color="#fbbf24"
          />
          <StatCard
            icon="🛒"
            title="Most Bought"
            value="Premium Widget Pro"
            subtitle="2x purchased"
            color="#f472b6"
          />
        </Stack>

        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
          <Typography fontWeight={700} sx={{ fontSize: "1rem", mb: 1 }}>
            Tier Progress
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: "block" }}>
            Track progress to the next loyalty tier
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1.5 }}>
            {/* <Typography variant="body2" color="text.secondary">
              Current Tier: <Chip
              label={memberDetails.currentTier +" "+ "member"}
              size="small"
              color="warning"
              sx={{ borderRadius: "6px", fontWeight: 600 }}
            />
            </Typography>
            */}
            <Typography variant="body2" color="text.secondary">
              Current Tier:&nbsp;
              <Chip
                label={`${tier} Member`}
                size="small"
                sx={{
                  borderRadius: "6px",
                  fontWeight: 600,
                  ...tierStyles[tier], // 👈 Apply color dynamically
                }}
              />
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Typography variant="caption" color="text.secondary" sx={{ minWidth: 100 }}>
              {memberDetails.currentLoyaltyPoints || 0} /   {memberDetails.nextTierPoints || 0} Points to <b>{memberDetails.nextTier}</b>
            </Typography>
            <Box
              sx={{
                flex: 1,
                height: 8,
                borderRadius: 8,
                bgcolor: "grey.200",
                overflow: "hidden",
              }}
            >
              <Box sx={{ width: "70%", height: 1, bgcolor: "warning.main" }} />
            </Box>
          </Stack>
        </Paper>

        {/* <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
          <Typography fontWeight={700} sx={{ fontSize: "1rem", mb: 1 }}>
            Points History
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: "block" }}>
            Recent loyalty point transactions
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Box>
            <HistoryHeader />
            <HistoryRow
              date="03/11/2025"
              type="Earned"
              desc="Premium Subscription"
              points="+150"
              bal="2450"
            />
            <HistoryRow
              date="28/10/2025"
              type="Redeemed"
              desc="Discount Voucher"
              points="-200"
              bal="2300"
            />
            <HistoryRow
              date="15/10/2025"
              type="Earned"
              desc="Product Purchase"
              points="+350"
              bal="2500"
            />
            <HistoryRow
              date="20/09/2025"
              type="Earned"
              desc="Birthday Bonus"
              points="+200"
              bal="2150"
            />
            <HistoryRow
              date="10/09/2025"
              type="Redeemed"
              desc="Gift Card"
              points="-150"
              bal="1950"
            />
          </Box>
        </Paper> */}
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
          <Typography fontWeight={700} sx={{ fontSize: "1rem", mb: 1 }}>
            Points History
          </Typography>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mb: 2, display: "block" }}
          >
            Recent loyalty point transactions
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Box>
            <HistoryHeader />

            {customer.loyaltyTransactions.length > 0 ? (
              customer.loyaltyTransactions.map((tx: any) => {
                const formattedDate = dayjs(tx.createdAt).format("DD/MM/YYYY");
                const typeLabel =
                  tx.type === "EARN" ? "Earned" : "Redeemed";
                const pointsDisplay =
                  tx.manipulatedPoint > 0
                    ? `+${tx.manipulatedPoint}`
                    : `${tx.manipulatedPoint}`;
                const desc =
                  tx.metadata?.productName ||
                  tx.description ||
                  "Loyalty transaction";

                return (
                  <HistoryRow
                    key={tx.id}
                    date={formattedDate}
                    type={typeLabel}
                    desc={desc}
                    points={pointsDisplay}
                    bal={tx.totalPoint.toString()}
                  />
                );
              })
            ) : (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textAlign: "center", py: 2 }}
              >
                No loyalty transactions found.
              </Typography>
            )}
          </Box>
        </Paper>

      </Stack>
    );
  }

  return null;
}

function Section({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: string;
  children: React.ReactNode;
}) {
  return (
    <Stack spacing={1.5}>
      <Stack direction="row" alignItems="center" spacing={1.5}>
        {icon && <Typography sx={{ fontSize: "1.25rem" }}>{icon}</Typography>}
        <Box>
          <Typography fontWeight={700} sx={{ fontSize: "1rem" }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      </Stack>
      <Paper variant="outlined" sx={{ overflow: "hidden", borderRadius: 2 }}>
        {children}
      </Paper>
    </Stack>
  );
}

function TableHeader({ headers }: { headers: string[] }) {
  return (
    <>
      <Stack direction="row" sx={{ p: 2, bgcolor: "grey.50" }}>
        {headers.map((h, i) => (
          <Cell key={h} idx={i} header>
            {h}
          </Cell>
        ))}
      </Stack>
      <Divider />
    </>
  );
}

function Row({ cells }: { cells: React.ReactNode[] }) {
  return (
    <>
      <Stack direction="row" sx={{ p: 2 }}>
        {cells.map((c, i) => (
          <Cell key={i} idx={i}>
            {c}
          </Cell>
        ))}
      </Stack>
      <Divider />
    </>
  );
}

function EmptyRow({ text = "No past orders found" }: { text?: string }) {
  return (
    <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
      <Typography variant="body2" color="text.secondary">
        {text}
      </Typography>
    </Stack>
  );
}

function Cell({
  children,
  idx,
  header = false,
}: {
  children: React.ReactNode;
  idx: number;
  header?: boolean;
}) {
  const widths = ["16%", "14%", "30%", "16%", "14%", "10%"];
  return (
    <Box sx={{ width: widths[idx] ?? "auto" }}>
      <Typography
        variant="body2"
        color={header ? "text.secondary" : "text.primary"}
        sx={{
          fontWeight: header ? 700 : 500,
          fontSize: header ? "0.8125rem" : "0.875rem"
        }}
      >
        {children}
      </Typography>
    </Box>
  );
}

function InfoWithIcon({
  icon,
  label,
  value
}: {
  icon: string;
  label: string;
  value?: React.ReactNode;
}) {
  return (
    <Stack direction="row" spacing={2} alignItems="flex-start">
      <Typography sx={{ fontSize: "1.25rem" }}>{icon}</Typography>
      <Box sx={{ flex: 1 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mb: 0.25 }}
        >
          {label}
        </Typography>
        <Typography variant="body2" fontWeight={600} sx={{ fontSize: "0.875rem" }}>
          {value ?? "—"}
        </Typography>
      </Box>
    </Stack>
  );
}

function StatWithIcon({
  icon,
  label,
  value
}: {
  icon: string;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <Typography sx={{ fontSize: "1.5rem" }}>{icon}</Typography>
      <Box sx={{ flex: 1 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block" }}
        >
          {label}
        </Typography>
        <Typography variant="h6" fontWeight={800} sx={{ fontSize: "1.5rem" }}>
          {value}
        </Typography>
      </Box>
    </Stack>
  );
}

function InfoItem({
  label,
  value
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <Box sx={{ flex: 1 }}>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", mb: 0.5 }}
      >
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600}>
        {value}
      </Typography>
    </Box>
  );
}

function PrefRow({
  label,
  subtitle,
  enabled
}: {
  label: string;
  subtitle?: string;
  enabled: boolean;
}) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{ py: 1 }}
    >
      <Box>
        <Typography variant="body2" fontWeight={600} sx={{ mb: 0.25 }}>
          {label}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
      <Switch checked={enabled} color="warning" />
    </Stack>
  );
}

function StatCard({
  icon,
  title,
  value,
  subtitle,
  color,
}: {
  icon: string;
  title: string;
  value: React.ReactNode;
  subtitle?: string;
  color: string;
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        flex: 1,
        borderRadius: 2,
        position: "relative",
        overflow: "hidden"
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 60,
          height: 60,
          background: `linear-gradient(135deg, ${color}30, ${color}10)`,
          borderRadius: "0 0 0 100%",
        }}
      />
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
        <Typography sx={{ fontSize: "1.5rem" }}>{icon}</Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontWeight: 600 }}
        >
          {title}
        </Typography>
      </Stack>
      <Typography variant="h5" fontWeight={800} sx={{ fontSize: "1.75rem" }}>
        {value}
      </Typography>
      {subtitle && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 0.5, display: "block" }}
        >
          {subtitle}
        </Typography>
      )}
    </Paper>
  );
}

function HistoryHeader() {
  return (
    <>
      <Stack direction="row" sx={{ py: 1.5, px: 2, bgcolor: "grey.50" }}>
        <Box sx={{ width: "14%" }}>
          <Typography variant="caption" fontWeight={700} color="text.secondary">
            Date
          </Typography>
        </Box>
        <Box sx={{ width: "16%" }}>
          <Typography variant="caption" fontWeight={700} color="text.secondary">
            Type
          </Typography>
        </Box>
        <Box sx={{ width: "38%" }}>
          <Typography variant="caption" fontWeight={700} color="text.secondary">
            Description
          </Typography>
        </Box>
        <Box sx={{ width: "16%" }}>
          <Typography variant="caption" fontWeight={700} color="text.secondary">
            Points
          </Typography>
        </Box>
        <Box sx={{ width: "16%" }}>
          <Typography variant="caption" fontWeight={700} color="text.secondary">
            Balance
          </Typography>
        </Box>
      </Stack>
      <Divider />
    </>
  );
}

function HistoryRow({
  date,
  type,
  desc,
  points,
  bal,
}: {
  date: string;
  type: "Earned" | "Redeemed";
  desc: string;
  points: string;
  bal: string;
}) {
  return (
    <>
      <Stack direction="row" sx={{ py: 1.5, px: 2 }}>
        <Box sx={{ width: "14%" }}>
          <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
            {date}
          </Typography>
        </Box>
        <Box sx={{ width: "16%" }}>
          <Chip
            size="small"
            color={type === "Earned" ? "success" : "error"}
            variant="outlined"
            label={type}
            sx={{ borderRadius: "6px", fontWeight: 600 }}
          />
        </Box>
        <Box sx={{ width: "38%" }}>
          <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
            {desc}
          </Typography>
        </Box>
        <Box sx={{ width: "16%" }}>
          <Typography
            variant="body2"
            fontWeight={700}
            sx={{
              fontSize: "0.875rem",
              color: type === "Earned" ? "success.main" : "error.main"
            }}
          >
            {points}
          </Typography>
        </Box>
        <Box sx={{ width: "16%" }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: "0.875rem" }}
          >
            {bal}
          </Typography>
        </Box>
      </Stack>
      <Divider />
    </>
  );
}

function Linkish({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      variant="body2"
      sx={{
        color: "primary.main",
        textDecoration: "none",
        fontWeight: 600,
        cursor: "pointer"
      }}
    >
      {children}
    </Typography>
  );
}

function capitalize(s?: string) {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}


// import * as React from "react";
// import {
//   Box,
//   Button,
//   Chip,
//   Divider,
//   Paper,
//   Stack,
//   TextField,
//   Typography,
// } from "@mui/material";
// import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
// import dayjs from "dayjs";

// export function CustomerViewContent({
//   tab,
//   customer,
//   onTrack,
// }: {
//   tab: "basic" | "loyalty" | "order";
//   customer: any;
//   onTrack: (order: any) => void;
// }) {
//   if (!customer) return null;

//   // ✅ UNIFIED ORDERS TAB
//   if (tab === "order") {
//     const allOrders = customer.orders ?? [];

//     const [searchText, setSearchText] = React.useState("");
//     const [statusFilter, setStatusFilter] = React.useState("All");
//     const [paginationModel, setPaginationModel] = React.useState({ page: 0, pageSize: 5 });

//     const statusOptions = ["All", "Ongoing", "Completed", "Processing", "Cancelled"];

//     const rows = React.useMemo(() => {
//       return allOrders.map((o: any) => ({
//         id: o.id,
//         orderNo: o.orderNo ?? "—",
//         date: o.orderCreatedAt ? dayjs(o.orderCreatedAt).format("DD/MM/YYYY") : "—",
//         product: o.orderName ?? o.metadata?.productItems?.[0]?.productName ?? "—",
//         amount: o.metadata?.formattedTotal ?? "₹249.99",
//         status: o.status ?? "unknown",
//         raw: o,
//       }));
//     }, [allOrders]);

//     const filteredRows = React.useMemo(() => {
//       return rows.filter((r) => {
//         const matchSearch = [r.orderNo, r.product, r.amount]
//           .join(" ")
//           .toLowerCase()
//           .includes(searchText.trim().toLowerCase());

//         let matchStatus = true;
//         if (statusFilter === "Ongoing") matchStatus = r.status !== "completed";
//         else if (statusFilter === "Completed") matchStatus = r.status === "completed";
//         else if (statusFilter === "Processing") matchStatus = r.status === "processing";
//         else if (statusFilter === "Cancelled") matchStatus = r.status === "cancelled";

//         return matchSearch && matchStatus;
//       });
//     }, [rows, searchText, statusFilter]);

//     const columns: GridColDef[] = [
//       { field: "orderNo", headerName: "Order ID", flex: 1, minWidth: 130, sortable: true },
//       { field: "date", headerName: "Date", width: 120, sortable: true },
//       { field: "product", headerName: "Products", flex: 2, minWidth: 240, sortable: true },
//       { field: "amount", headerName: "Amount", width: 120, sortable: true },
//       {
//         field: "status",
//         headerName: "Status",
//         width: 160,
//         renderCell: (params: GridRenderCellParams<string>) => {
//           const st = params.value?.toLowerCase() ?? "unknown";
//           const color =
//             st === "completed"
//               ? "success"
//               : st.includes("out") || st.includes("deliv") || st === "processing"
//               ? "warning"
//               : st === "cancelled"
//               ? "error"
//               : "default";
//           const label = st.charAt(0).toUpperCase() + st.slice(1);
//           return (
//             <Chip
//               size="small"
//               variant="outlined"
//               color={color as any}
//               label={label}
//               sx={{ borderRadius: "6px", fontWeight: 600 }}
//             />
//           );
//         },
//       },
//       {
//         field: "actions",
//         headerName: "Actions",
//         width: 110,
//         sortable: false,
//         filterable: false,
//         renderCell: (params: GridRenderCellParams) => (
//           <Button
//             variant="outlined"
//             size="small"
//             onClick={() => onTrack(params.row.raw)}
//             sx={{
//               textTransform: "none",
//               fontWeight: 800,
//               py: 0.25,
//               px: 1,
//               borderRadius: "6px",
//               minWidth: "auto",
//               lineHeight: 1.2,
//             }}
//           >
//             Track
//           </Button>
//         ),
//       },
//     ];

//     return (
//       <Stack spacing={3}>
//         <Section title="All Orders" subtitle="Track and manage all orders in one place" icon="📦">
//           <Box sx={{ p: 2, pt: 3 }}>
//             {/* 🔍 Search and Filter Bar */}
//             <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
//               <TextField
//                 size="small"
//                 placeholder="Search by ID, product, or amount..."
//                 value={searchText}
//                 onChange={(e) => setSearchText(e.target.value)}
//                 sx={{ minWidth: 260 }}
//               />

//               <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
//                 {statusOptions.map((status) => (
//                   <Chip
//                     key={status}
//                     label={status}
//                     clickable
//                     color={statusFilter === status ? "warning" : "default"}
//                     variant={statusFilter === status ? "filled" : "outlined"}
//                     onClick={() => setStatusFilter(status)}
//                     sx={{ fontWeight: 600, borderRadius: "6px" }}
//                   />
//                 ))}
//               </Stack>
//             </Stack>
//           </Box>

//           <Divider />

//           {/* 📊 Unified DataGrid */}
//           <Box sx={{ p: 2 }}>
//             <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
//               <DataGrid
//                 autoHeight
//                 disableRowSelectionOnClick
//                 rows={filteredRows}
//                 columns={columns}
//                 pageSizeOptions={[5, 10, 25]}
//                 paginationModel={paginationModel}
//                 onPaginationModelChange={setPaginationModel}
//                 sx={{ border: "none", fontSize: "0.875rem" }}
//               />
//             </Paper>
//           </Box>
//         </Section>
//       </Stack>
//     );
//   }

//   return null;
// }

// function Section({
//   title,
//   subtitle,
//   icon,
//   children,
// }: {
//   title: string;
//   subtitle?: string;
//   icon?: string;
//   children: React.ReactNode;
// }) {
//   return (
//     <Stack spacing={1.5}>
//       <Stack direction="row" alignItems="center" spacing={1.5}>
//         {icon && <Typography sx={{ fontSize: "1.25rem" }}>{icon}</Typography>}
//         <Box>
//           <Typography fontWeight={700} sx={{ fontSize: "1rem" }}>
//             {title}
//           </Typography>
//           {subtitle && (
//             <Typography variant="caption" color="text.secondary">
//               {subtitle}
//             </Typography>
//           )}
//         </Box>
//       </Stack>
//       <Paper variant="outlined" sx={{ overflow: "hidden", borderRadius: 2 }}>
//         {children}
//       </Paper>
//     </Stack>
//   );
// }