import { Paper, Box, Typography } from "@mui/material";

const SalesChart = ({ data }: any) => (
  <Paper sx={{ p: 3, borderRadius: 3 }}>
    <Typography sx={{ fontWeight: 700, mb: 2 }}>Sales Trend</Typography>
    <Box sx={{ height: 260, display: "flex", alignItems: "center", justifyContent: "center", color: "text.disabled" }}>
      Chart goes here
    </Box>
  </Paper>
);

export default SalesChart;
