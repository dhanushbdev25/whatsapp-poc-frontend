import { Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";

const TopCustomersTable = ({ rows }: any) => (
  <Paper sx={{ p: 3, borderRadius: 3 }}>
    <Typography sx={{ fontWeight: 700, mb: 2 }}>Top Customers</Typography>
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>Orders</TableCell>
          <TableCell>Total Spent</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((r: any, idx: number) => (
          <TableRow key={idx}>
            <TableCell>{r.name}</TableCell>
            <TableCell>{r.orders}</TableCell>
            <TableCell>{r.spent}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </Paper>
);

export default TopCustomersTable;
