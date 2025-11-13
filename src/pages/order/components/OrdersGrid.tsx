// import React, { useState, useEffect, useMemo } from "react";
// import {
//   Box,
//   Typography,
//   TextField,
//   Button,
//   Stack,
//   Chip,
//   CircularProgress,
//   InputAdornment,
//   Paper,
//   useTheme,
// } from "@mui/material";
// import { DataGrid, GridColDef } from "@mui/x-data-grid";
// import { Search as SearchIcon } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import { useGetAllOrdersQuery } from "../../../store/api/orders/orders.api";
// import dayjs from "dayjs";

// export default function OrdersGrid() {
//   const theme = useTheme();
//   const navigate = useNavigate();
//   const { data, isLoading, isFetching }: any = useGetAllOrdersQuery();

//   const [orders, setOrders] = useState<any[]>([]);
//   const [search, setSearch] = useState("");

//   // ✅ Normalize & Flatten API response
//   useEffect(() => {
//     const payload =
//       data?.data?.data ??
//       data?.data ??
//       data ??
//       [];

//     if (Array.isArray(payload)) {
//       const flattened = payload.map((order: any) => ({
//         id: order.id,
//         orderNo: order.orderNo ?? "-",
//         customerName:
//           order?.customer?.name ??
//           order?.metadata?.customerName ??
//           "Unknown",
//         paymentType: order?.paymentType ?? "-",
//         status: order?.status ?? "-",
//         total:
//           order?.metadata?.formattedTotal ??
//           (order?.metadata?.totalAmount
//             ? `${order.metadata.totalAmount} ${order.metadata.currency || ""}`
//             : "-"),
//         date: order?.orderCreatedAt
//           ? dayjs(order.orderCreatedAt).format("DD MMM YYYY, hh:mm A")
//           : "-",
//       }));
//       setOrders(flattened);
//     } else {
//       setOrders([]);
//     }
//   }, [data]);

//   // ✅ Search filter
//   const filtered = useMemo(() => {
//     if (!search.trim()) return orders;
//     return orders.filter((o) =>
//       o.orderNo.toLowerCase().includes(search.toLowerCase())
//     );
//   }, [search, orders]);

//   // ✅ Columns
//   const columns: GridColDef[] = [
//     { field: "orderNo", headerName: "Order No", flex: 1, minWidth: 150 },
//     { field: "customerName", headerName: "Customer Name", flex: 1, minWidth: 180 },
//     { field: "paymentType", headerName: "Payment Type", flex: 1, minWidth: 120 },
//     {
//       field: "status",
//       headerName: "Status",
//       flex: 1,
//       minWidth: 130,
//       renderCell: (params) => (
//         <Chip
//           label={params.value}
//           color={
//             params.value === "completed"
//               ? "success"
//               : params.value === "inprogress"
//               ? "warning"
//               : params.value === "new"
//               ? "info"
//               : "default"
//           }
//           size="small"
//           sx={{ fontWeight: 600, textTransform: "capitalize" }}
//         />
//       ),
//     },
//     { field: "total", headerName: "Total (Currency)", flex: 1, minWidth: 150 },
//     { field: "date", headerName: "Date", flex: 1, minWidth: 180 },
//     {
//       field: "action",
//       headerName: "Action",
//       sortable: false,
//       minWidth: 120,
//       renderCell: (params) => (
//         <Button
//           variant="outlined"
//           size="small"
//           sx={{
//             textTransform: "none",
//             fontWeight: 600,
//             borderRadius: 2,
//             borderColor: theme.palette.primary.main,
//             color: theme.palette.primary.main,
//             "&:hover": {
//               backgroundColor: theme.palette.primary.light,
//               color: "#fff",
//               borderColor: theme.palette.primary.dark,
//             },
//           }}
//           onClick={(e) => {
//             e.stopPropagation();
//             navigate(`view/${params.row.id}`);
//           }}
//         >
//           View
//         </Button>
//       ),
//     },
//   ];

//   return (
//     <Box
//       sx={{
//         maxWidth: 1200,
//         mx: "auto",
//         p: { xs: 2, md: 4 },
//         width: "100%",
//       }}
//     >
//       <Paper
//         elevation={3}
//         sx={{
//           p: { xs: 2, md: 3 },
//           borderRadius: 3,
//           borderTop: `5px solid #FFD580`,
//           boxShadow: theme.shadows[3],
//           backgroundColor: theme.palette.background.paper,
//         }}
//       >
//         {/* ✅ Header Section */}
//         <Stack
//           direction={{ xs: "column", sm: "row" }}
//           justifyContent="space-between"
//           alignItems={{ xs: "stretch", sm: "center" }}
//           spacing={2}
//           mb={3}
//         >
//           <Typography
//             variant="h5"
//             fontWeight={700}
//             color="primary"
//             sx={{ letterSpacing: 0.3 }}
//           >
//             Orders
//           </Typography>

//           <TextField
//             variant="outlined"
//             size="small"
//             type="search"
//             placeholder="Search by Order No"
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             InputProps={{
//               startAdornment: (
//                 <InputAdornment position="start">
//                   <SearchIcon
//                     style={{
//                       color: theme.palette.text.secondary,
//                       fontSize: 20,
//                     }}
//                   />
//                 </InputAdornment>
//               ),
//             }}
//             sx={{
//               width: 260,
//               ml: "auto",
//               "& .MuiOutlinedInput-root": {
//                 borderRadius: 3,
//                 backgroundColor: theme.palette.background.paper,
//                 boxShadow: theme.shadows[1],
//                 "& fieldset": { borderColor: "#ddd" },
//                 "&:hover fieldset": {
//                   borderColor: theme.palette.primary.light,
//                 },
//                 "&.Mui-focused fieldset": {
//                   borderColor: theme.palette.primary.main,
//                   boxShadow: `0 0 3px ${theme.palette.primary.light}`,
//                 },
//               },
//               "& input::placeholder": {
//                 fontSize: "0.9rem",
//                 color: theme.palette.text.secondary,
//               },
//             }}
//           />
//         </Stack>

//         {/* ✅ DataGrid Section */}
//         {isLoading || isFetching ? (
//           <Stack
//             alignItems="center"
//             justifyContent="center"
//             sx={{ height: "60vh" }}
//           >
//             <CircularProgress />
//           </Stack>
//         ) : (
//           <DataGrid
//             rows={filtered}
//             columns={columns}
//             getRowId={(row) => row.id}
//             disableRowSelectionOnClick
//             pageSizeOptions={[5, 10, 20]}
//             initialState={{
//               pagination: { paginationModel: { pageSize: 10 } },
//             }}
//             sx={{
//               backgroundColor: theme.palette.background.paper,
//               borderRadius: 2,
//               "& .MuiDataGrid-columnHeaders": {
//                 backgroundColor: theme.palette.action.hover,
//                 fontWeight: 600,
//                 borderBottom: `1px solid ${theme.palette.divider}`,
//               },
//               "& .MuiDataGrid-cell": {
//                 fontSize: 14,
//                 py: 1,
//               },
//               "& .MuiDataGrid-row:hover": {
//                 backgroundColor: theme.palette.action.hover,
//               },
//             }}
//           />
//         )}
//       </Paper>
//     </Box>
//   );
// }


import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Chip,
  CircularProgress,
  InputAdornment,
  Paper,
  Breadcrumbs,
  Link,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Search as SearchIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGetAllOrdersQuery } from "../../../store/api/orders/orders.api";
import dayjs from "dayjs";

export default function OrdersGrid() {
  const navigate = useNavigate();
  const { data, isLoading, isFetching }: any = useGetAllOrdersQuery();

  const [orders, setOrders] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  // Normalize Data
  useEffect(() => {
    const payload = data?.data?.data ?? data?.data ?? data ?? [];
    if (Array.isArray(payload)) {
      const flattened = payload.map((order: any) => ({
        id: order.id,
        orderNo: order.orderNo ?? "-",
        customerName:
          order?.customer?.name ||
          order?.metadata?.customerName ||
          "Unknown",
        paymentType: order?.paymentType ?? "-",
        status: order?.status ?? "-",
        total:
          order?.metadata?.formattedTotal ??
          (order?.metadata?.totalAmount
            ? `${order.metadata.totalAmount} ${order.metadata.currency || ""}`
            : "-"),
        date: order?.orderCreatedAt
          ? dayjs(order.orderCreatedAt).format("DD MMM YYYY, hh:mm A")
          : "-",
      }));
      setOrders(flattened);
    }
  }, [data]);

  // Search filter
  const filtered = useMemo(() => {
    if (!search.trim()) return orders;
    return orders.filter((o) =>
      o.orderNo.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, orders]);

  // Status chip colors (UserManagement Style)
  const STATUS_COLORS: Record<string, any> = {
    completed: { bg: "#E7F7EE", text: "#12A150" },
    inprogress: { bg: "#FFF2DD", text: "#C77800" },
    new: { bg: "#E0E7FF", text: "#4338CA" },
    default: { bg: "#F3F4F6", text: "#374151" },
  };

  const columns: GridColDef[] = [
    { field: "orderNo", headerName: "Order No", flex: 1, minWidth: 150 },
    { field: "customerName", headerName: "Customer Name", flex: 1.5, minWidth: 200 },
    { field: "paymentType", headerName: "Payment Type", flex: 1, minWidth: 150 },

    {
      field: "status",
      headerName: "Status",
      flex: 1,
      minWidth: 140,
      renderCell: (params) => {
        const clr = STATUS_COLORS[params.value] || STATUS_COLORS.default;
        return (
          <Chip
            label={params.value}
            size="small"
            sx={{
              bgcolor: clr.bg,
              color: clr.text,
              fontWeight: 600,
              textTransform: "capitalize",
              borderRadius: "8px",
            }}
          />
        );
      },
    },

    { field: "total", headerName: "Total", flex: 1, minWidth: 160 },
    { field: "date", headerName: "Date", flex: 1.4, minWidth: 200 },

    {
      field: "action",
      headerName: "Action",
      flex: 0.6,
      sortable: false,
      minWidth: 140,
      renderCell: (params) => (
        <Button
          variant="outlined"
          size="small"
          sx={{
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 1.5,
            px: 2,
            borderColor: "#4338CA",
            color: "#4338CA",
            "&:hover": {
              backgroundColor: "#E0E7FF",
              borderColor: "#3730A3",
              color: "#3730A3",
            },
          }}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`view/${params.row.id}`);
          }}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <Box sx={{ bgcolor: "#FAFAFB", minHeight: "100vh", p: { xs: 2, } }}>
    

      {/* Page Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={2}
        sx={{ mt: 2 }}
      >
        <Box>
          <Typography sx={{ fontSize: 28, fontWeight: 800 }}>
            Orders
          </Typography>
          <Typography sx={{ fontSize: 14, color: "#6B7280" }}>
            Manage and track all customer orders
          </Typography>
        </Box>

        <TextField
          size="small"
          placeholder="Search Order No..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon size={18} color="#6B7280" />
              </InputAdornment>
            ),
          }}
          sx={{
            width: { xs: "100%", sm: 260 },
            minWidth: { xs: "100%", sm: 240 },
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              backgroundColor: "#FFFFFF",
              "& fieldset": { borderColor: "#E5E7EB" },
              "&:hover fieldset": { borderColor: "#4338CA" },
              "&.Mui-focused fieldset": { borderColor: "#4338CA" },
            },
          }}
        />
      </Stack>

      {/* DataGrid Wrapper */}
      <Paper
        sx={{
          mt: 3,
          p: 0,
          borderRadius: 3,
          background: "#FFFFFF",
          border: "1px solid #E5E7EB",
          width: "100%",
          overflow: "hidden",
        }}
      >
        {isLoading || isFetching ? (
          <Stack alignItems="center" justifyContent="center" sx={{ height: "60vh" }}>
            <CircularProgress />
          </Stack>
        ) : (
          <Box
            sx={{
              width: "100%",
              overflowX: "auto",   // ENABLE SCROLL
              overflowY: "hidden",
            }}
          >
            <Box sx={{ minWidth: "1250px" }}>
              <DataGrid
                rows={filtered}
                columns={columns}
                checkboxSelection
                disableRowSelectionOnClick
                autoHeight
                pageSizeOptions={[10, 25, 50]}
                sx={{
                  border: "none",

                  "& .MuiDataGrid-columnHeaders": {
                    bgcolor: "#F3F4F6",
                    fontWeight: 700,
                    fontSize: 13,
                    borderBottom: "1px solid #E5E7EB",
                  },
                  "& .MuiDataGrid-cell": {
                    fontSize: 14,
                    borderBottom: "1px solid #F3F4F6",
                  },
                  "& .MuiDataGrid-row:hover": {
                    backgroundColor: "#F9FAFB",
                  },
                  "& .MuiDataGrid-footerContainer": {
                    borderTop: "1px solid #E5E7EB",
                  },
                }}
              />
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
