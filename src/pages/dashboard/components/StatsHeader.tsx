import { Typography, Stack } from "@mui/material";

const StatsHeader = () => (
  <Stack>
    <Typography sx={{ fontSize: 28, fontWeight: 800 }}>
      Dashboard Overview
    </Typography>
    <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
      Monitor key metrics and track performance
    </Typography>
  </Stack>
);

export default StatsHeader;
