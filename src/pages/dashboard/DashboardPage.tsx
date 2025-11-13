import { Box, Container, Stack } from "@mui/material";
import StatsHeader from "./components/StatsHeader";
import OverviewCards from "./components/OverviewCards";
import SalesChart from "./components/SalesChart";
import TopCustomersTable from "./components/TopCustomersTable";
import { useDashboardData } from "./hooks/useDashboardData";

const DashboardPage = () => {
  const { loading, stats, salesData, topCustomers } = useDashboardData();

  return (
    <Box sx={{ background: "#F7F8FA", minHeight: "100vh", py: 4 }}>
      <Container maxWidth="lg">
        <Stack spacing={3}>
          <StatsHeader />
          <OverviewCards stats={stats} loading={loading} />
          <SalesChart data={salesData} loading={loading} />
          <TopCustomersTable rows={topCustomers} loading={loading} />
        </Stack>
      </Container>
    </Box>
  );
};

export default DashboardPage;
