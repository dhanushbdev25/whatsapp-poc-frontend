import { Paper, Stack, Typography, Skeleton } from "@mui/material";

const OverviewCards = ({ stats, loading }: any) => {
  const items = [
    { label: "Total Customers", value: stats?.totalCustomers },
    { label: "Total Sales", value: stats?.totalSales },
    { label: "Active Users", value: stats?.activeUsers },
  ];

  return (
    <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
      {items.map((item) => (
        <Paper
          key={item.label}
          sx={{ p: 3, flex: 1, borderRadius: 3, textAlign: "center" }}
        >
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {item.label}
          </Typography>
          <Typography sx={{ fontSize: 24, fontWeight: 700, mt: 1 }}>
            {loading ? <Skeleton width={80} /> : item.value}
          </Typography>
        </Paper>
      ))}
    </Stack>
  );
};

export default OverviewCards;
