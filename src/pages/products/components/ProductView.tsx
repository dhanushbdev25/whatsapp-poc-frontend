import * as React from "react";
import {
  Box,
  Typography,
  Paper,
  Divider,
  Stack,
  Button,
  CircularProgress,
  useTheme,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import { useGetProductByIdQuery } from "../../../store/api/products/products.api";

export default function ProductView() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data: product, isLoading, isError } = useGetProductByIdQuery(id || "");

  if (isLoading)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
        <CircularProgress />
      </Box>
    );

  if (isError || !product)
    return (
      <Typography color="error" textAlign="center" mt={5}>
        Failed to load product details.
      </Typography>
    );

  return (
    <Box
      sx={{
        maxWidth: 900,
        mx: "auto",
        p: { xs: 2, md: 4 },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: "100%",
          borderRadius: 3,
          borderTop: `5px solid #FFD580`,
          p: { xs: 3, md: 5 },
          boxShadow: theme.shadows[3],
          backgroundColor: theme.palette.background.paper,
        }}
      >
        {/* Header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h5" fontWeight={700} color="primary">
            Product Details
          </Typography>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate("/products")}
            sx={{
              textTransform: "none",
              fontWeight: 500,
              borderColor: theme.palette.primary.main,
              color: theme.palette.primary.main,
              "&:hover": {
                borderColor: theme.palette.primary.dark,
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            Back to Products
          </Button>
        </Stack>

        <Typography variant="body2" color="text.secondary" mb={3}>
          Below are the details for this product.
        </Typography>

        <Divider sx={{ mb: 4, borderColor: theme.palette.divider }} />

        {/* Product Image */}
        <Box textAlign="center" mb={4}>
          {product.metadata?.[0] ? (
            <Box
              component="img"
              src={product.metadata[0]}
              alt={product.productName}
              sx={{
                width: 160,
                height: 160,
                objectFit: "cover",
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
              }}
            />
          ) : (
            <Typography color="text.secondary">No image available</Typography>
          )}
        </Box>

        {/* Product Info Section */}
        <Stack spacing={2.5}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <InfoField label="Content ID" value={product.contentId} />
            <InfoField label="Product Name" value={product.productName} />
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <InfoField label="Product Type" value={product.productType} />
            <InfoField label="SKU" value={product.sku} />
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <InfoField label="Weight (g)" value={product.weight} />
            <InfoField label="Dimensions" value={product.dimensions} />
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <InfoField label="Warranty Period (years)" value={product.warrantyPeriod} />
            <InfoField label="Return Period (days)" value={product.returnPeriodDays} />
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <InfoField label="Quantity" value={product.qty} />
            <InfoField label="Amount" value={`${product.amount} ${product.currency}`} />
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <InfoField label="Type" value={product.type} />
            <InfoField label="Loyalty Points" value={product.points} />
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}

/**
 * Reusable InfoField component for displaying label-value pairs in view mode.
 */
function InfoField({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        flex: 1,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        p: 2,
        bgcolor: theme.palette.background.default,
      }}
    >
      <Typography
        variant="caption"
        sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}
      >
        {label}
      </Typography>
      <Typography
        variant="body1"
        sx={{
          fontWeight: 600,
          color: theme.palette.text.primary,
          mt: 0.5,
          wordBreak: "break-word",
        }}
      >
        {value || "—"}
      </Typography>
    </Box>
  );
}
