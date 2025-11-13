import * as React from "react";
import {
  Box,
  Button,
  Stack,
  Typography,
  TextField,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  Paper,
  Breadcrumbs,
  Link,
  InputAdornment,
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import {
  Visibility,
  Edit,
  Add,
  Share,
  SearchRounded,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useGetAllProductsQuery } from "../../../store/api/products/products.api";

export default function ProductList() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useGetAllProductsQuery();

  const [search, setSearch] = React.useState("");
  const [rows, setRows] = React.useState<any[]>([]);
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);

  // Currency Symbol Mapping
  const getCurrencySymbol = (currency: string) => {
    const map: any = {
      NGN: "₦",
      USD: "$",
      EUR: "€",
      GBP: "£",
    };
    return map[currency] || currency;
  };
  console.log(data,'datadata');
  

  // Prepare table data
  React.useEffect(() => {
    if (data) {
      setRows(
        data.map((p: any, index: number) => ({
          id: p.id,
          sn: index + 1,
          productName: p.productName,
          productType: p.productType || "-",
          sku: p.sku,
          contentId: p.contentId ?? "-",
          stock: p.qty ?? 0,
          amount: p.amount
            ? `${getCurrencySymbol(p.currency)} ${p.amount}`
            : "-",
          points: p.points ?? 0,
          image:
            Array.isArray(p.metadata) && p.metadata.length > 0
              ? p.metadata[0]
              : "https://via.placeholder.com/60x60?text=No+Image",
        }))
      );
    }
  }, [data]);

  // Search filter
  const filteredRows = React.useMemo(() => {
    if (!search.trim()) return rows;
    return rows.filter((row) =>
      Object.values(row)
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [rows, search]);

  // Handlers
  const handleAddProduct = () => navigate("/products/create");
  const handleEdit = (row: any) => navigate(`/products/edit/${row.id}`);
  const handleView = (row: any) => navigate(`/products/view/${row.id}`);

  const handleSNSC = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setSnackbarOpen(true);
    }, 5000);
  };

  // Columns
  const columns: GridColDef[] = [
    { field: "sn", headerName: "S.No", width: 80, sortable: false },

    {
      field: "image",
      headerName: "Image",
      width: 90,
      renderCell: (params) => (
        <img
          src={params.value}
          alt="Product"
          width={45}
          height={45}
          style={{
            borderRadius: 8,
            objectFit: "cover",
            border: "1px solid #eee",
          }}
        />
      ),
      sortable: false,
      filterable: false,
    },

    { field: "productName", headerName: "Product Name", flex: 1.2, minWidth: 180 },
    { field: "productType", headerName: "Product Type", width: 150 },
    { field: "sku", headerName: "SKU", width: 160 },

    // NEW — Show contentId
    { field: "contentId", headerName: "Content ID", width: 150 },

    // NEW — Show stock from qty
    { field: "stock", headerName: "Stock", width: 120 },

    // NEW — Amount with currency symbol
    { field: "amount", headerName: "Amount", width: 140 },

    { field: "points", headerName: "Loyalty Points", width: 150 },

    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <IconButton
            size="small"
            onClick={() => handleView(params.row)}
            sx={{
              bgcolor: "#F3F4F6",
              "&:hover": { bgcolor: "#E5E7EB" },
            }}
          >
            <Visibility fontSize="small" />
          </IconButton>

          <IconButton
            size="small"
            onClick={() => handleEdit(params.row)}
            sx={{
              bgcolor: "#F3F4F6",
              "&:hover": { bgcolor: "#E5E7EB" },
            }}
          >
            <Edit fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  // Error or Loading states
  if (isLoading)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
        <CircularProgress />
      </Box>
    );

  if (isError)
    return (
      <Typography color="error" textAlign="center" mt={5}>
        Failed to load products.
      </Typography>
    );

  return (
    <Box sx={{ bgcolor: "#FAFAFB", minHeight: "100vh", p: { xs: 2, md: 4 } }}>
      
      {/* Breadcrumb */}
      <Breadcrumbs sx={{ color: "#6B7280", fontSize: 14 }}>
        <Link underline="hover" color="inherit">
          Dashboard
        </Link>
        <Typography>Product Management</Typography>
      </Breadcrumbs>

      {/* PAGE HEADER */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={2}
        sx={{ mt: 2 }}
      >
        <Box>
          <Typography sx={{ fontSize: 28, fontWeight: 800 }}>
            Product Management
          </Typography>
          <Typography sx={{ fontSize: 14, color: "#6B7280" }}>
            Manage and monitor all products in one place
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            startIcon={isSyncing ? <CircularProgress size={16} /> : <Share />}
            disabled={isSyncing}
            sx={{
              borderRadius: 1.5,
              fontSize: 12,
              fontWeight: 600,
              height: 40,
              px: 2,
            }}
            onClick={handleSNSC}
          >
            {isSyncing ? "Syncing..." : "Sync"}
          </Button>

          <Button
            variant="contained"
            startIcon={<Add />}
            sx={{
              borderRadius: 1.5,
              fontWeight: "600",
              fontSize: 12,
              height: 40,
              px: 2,
            }}
            onClick={handleAddProduct}
          >
            Add Product
          </Button>
        </Stack>
      </Stack>

      {/* SEARCH BAR */}
      <Paper sx={{ mt: 3, p: 2, borderRadius: 3 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <TextField
            size="small"
            fullWidth
            placeholder="Search by name, type or SKU…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRounded />
                </InputAdornment>
              ),
            }}
          />
        </Stack>
      </Paper>

      {/* DATA GRID */}
      <Paper
        sx={{
          mt: 3,
          p: 0,
          borderRadius: 3,
          overflow: "hidden",
          background: "#FFFFFF",
        }}
      >
        <DataGrid
          autoHeight
          rows={filteredRows}
          columns={columns}
          checkboxSelection
          disableRowSelectionOnClick
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
          // slots={{
          //   toolbar: GridToolbarQuickFilter,
          // }}
          slotProps={{
            toolbar: {
              quickFilterProps: { debounceMs: 300 },
            },
          }}
        />
      </Paper>

      {/* SYNC SUCCESS SNACKBAR */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="success" sx={{ width: "100%" }}>
          Inventory synced successfully from ERP server!
        </Alert>
      </Snackbar>
    </Box>
  );
}
