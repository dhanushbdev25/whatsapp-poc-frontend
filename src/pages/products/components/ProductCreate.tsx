import * as React from "react";
import {
    Box,
    TextField,
    Typography,
    Button,
    Stack,
    Paper,
    MenuItem,
    CircularProgress,
    ToggleButtonGroup,
    ToggleButton,
    Divider,
    useTheme,
} from "@mui/material";
import { AddPhotoAlternate, Save, Link as LinkIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useCreateProductMutation } from "../../../store/api/products/products.api";
import Swal from "sweetalert2";

export default function ProductCreate() {
    const theme = useTheme();
    const navigate = useNavigate();
    const [createProduct, { isLoading }] = useCreateProductMutation();

    const [formData, setFormData] = React.useState({
        contentId: "",
        productName: "",
        productType: "",
        sku: "",
        weight: "",
        dimensions: "",
        warrantyPeriod: "",
        returnPeriodDays: "",
        qty: "",
        amount: "",
        currency: "INR",
        type: "",
        metadata: [""],
        points: "",
    });

    const [uploadMode, setUploadMode] = React.useState<"file" | "url">("file");

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () =>
                setFormData((prev) => ({ ...prev, metadata: [reader.result as string] }));
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = await createProduct({ data: formData }).unwrap();
            console.log(data, 'datadatadata');

            Swal.fire({
                icon: "success",
                title: `Success`,
                text: `${data.message}`, timer: 5000,
                timerProgressBar: true,
                showConfirmButton: false,
            }).then(() => {
                navigate("/products");
            });
        } catch (error) {
            console.error("Failed to create product:", error);
        }
    };

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
                    borderTop: `5px solid ${theme.palette.primary.main}`,
                    p: { xs: 3, md: 5 },
                    boxShadow: theme.shadows[3],
                    backgroundColor: theme.palette.background.paper,
                }}
            >
                <Typography
                    variant="h5"
                    fontWeight={700}
                    color="primary"
                    mb={0.5}
                    sx={{ letterSpacing: 0.3 }}
                >
                    Create New Product
                </Typography>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    mb={3}
                >
                    Fill in the product details carefully before saving.
                </Typography>

                <Divider sx={{ mb: 4, borderColor: theme.palette.divider }} />

                <form onSubmit={handleSubmit}>
                    <Stack spacing={3}>
                        <Stack
                            direction={{ xs: "column", sm: "row" }}
                            spacing={2.5}
                        >
                            <TextField
                                label="Content ID"
                                name="contentId"
                                value={formData.contentId}
                                onChange={handleChange}
                                fullWidth
                                required
                                variant="outlined"
                            />
                            <TextField
                                label="Product Name"
                                name="productName"
                                value={formData.productName}
                                onChange={handleChange}
                                fullWidth
                                required
                                variant="outlined"
                            />
                        </Stack>

                        <Stack direction={{ xs: "column", sm: "row" }} spacing={2.5}>
                            <TextField
                                label="Product Type"
                                name="productType"
                                value={formData.productType}
                                onChange={handleChange}
                                fullWidth
                                required
                                variant="outlined"
                            />
                            <TextField
                                label="SKU"
                                name="sku"
                                value={formData.sku}
                                onChange={handleChange}
                                fullWidth
                                required
                                variant="outlined"
                            />
                        </Stack>

                        <Stack direction={{ xs: "column", sm: "row" }} spacing={2.5}>
                            <TextField
                                label="Weight (g)"
                                name="weight"
                                value={formData.weight}
                                onChange={handleChange}
                                fullWidth
                                variant="outlined"
                            />
                            <TextField
                                label="Dimensions"
                                name="dimensions"
                                value={formData.dimensions}
                                onChange={handleChange}
                                fullWidth
                                variant="outlined"
                            />
                        </Stack>

                        <Stack direction={{ xs: "column", sm: "row" }} spacing={2.5}>
                            <TextField
                                label="Warranty Period (years)"
                                name="warrantyPeriod"
                                value={formData.warrantyPeriod}
                                onChange={handleChange}
                                fullWidth
                                variant="outlined"
                            />
                            <TextField
                                label="Return Period (days)"
                                name="returnPeriodDays"
                                value={formData.returnPeriodDays}
                                onChange={handleChange}
                                fullWidth
                                variant="outlined"
                            />
                        </Stack>

                        <Stack direction={{ xs: "column", sm: "row" }} spacing={2.5}>
                            <TextField
                                label="Quantity"
                                name="qty"
                                value={formData.qty}
                                onChange={handleChange}
                                fullWidth
                                variant="outlined"
                            />
                            <TextField
                                label="Amount"
                                name="amount"
                                value={formData.amount}
                                onChange={handleChange}
                                fullWidth
                                variant="outlined"
                            />
                        </Stack>

                        <Stack direction={{ xs: "column", sm: "row" }} spacing={2.5}>
                            <TextField
                                select
                                label="Currency"
                                name="currency"
                                value={formData.currency}
                                onChange={handleChange}
                                fullWidth
                                variant="outlined"
                            >
                                <MenuItem value="INR">INR</MenuItem>
                                <MenuItem value="USD">USD</MenuItem>
                                <MenuItem value="NGN">NGN</MenuItem>
                            </TextField>
                            <TextField
                                label="Type"
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                fullWidth
                                variant="outlined"
                            />
                        </Stack>

                        {/* Image Upload Section */}
                        <Box
                            sx={{
                                p: 3,
                                border: `1px dashed ${theme.palette.primary.light}`,
                                borderRadius: 2,
                                backgroundColor: theme.palette.action.hover,
                                mt: 1,
                            }}
                        >
                            <Typography
                                variant="subtitle1"
                                fontWeight={600}
                                mb={2}
                                color="primary"
                            >
                                Product Image
                            </Typography>

                            <Stack direction="row" justifyContent="center" mb={2}>
                                <ToggleButtonGroup
                                    value={uploadMode}
                                    exclusive
                                    onChange={(_, newMode) => newMode && setUploadMode(newMode)}
                                    size="small"
                                >
                                    <ToggleButton value="file">
                                        <AddPhotoAlternate sx={{ mr: 1 }} fontSize="small" />
                                        Upload File
                                    </ToggleButton>
                                    <ToggleButton value="url">
                                        <LinkIcon sx={{ mr: 1 }} fontSize="small" />
                                        Use URL
                                    </ToggleButton>
                                </ToggleButtonGroup>
                            </Stack>

                            <Box
                                sx={{
                                    textAlign: "center",
                                    mb: 2,
                                }}
                            >
                                {formData.metadata[0] ? (
                                    <Box
                                        component="img"
                                        src={formData.metadata[0]}
                                        alt="Preview"
                                        sx={{
                                            width: 140,
                                            height: 140,
                                            borderRadius: 2,
                                            objectFit: "cover",
                                            border: `1px solid ${theme.palette.divider}`,
                                        }}
                                    />
                                ) : (
                                    <Typography color="text.secondary" fontSize="0.9rem">
                                        No image selected
                                    </Typography>
                                )}
                            </Box>

                            {uploadMode === "file" ? (
                                <Button
                                    variant="outlined"
                                    component="label"
                                    startIcon={<AddPhotoAlternate />}
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
                                    Choose Image
                                    <input
                                        type="file"
                                        hidden
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                </Button>
                            ) : (
                                <TextField
                                    label="Image URL"
                                    fullWidth
                                    value={formData.metadata[0]}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            metadata: [e.target.value],
                                        }))
                                    }
                                />
                            )}
                        </Box>

                        <TextField
                            label="Loyalty Points"
                            name="points"
                            value={formData.points}
                            onChange={handleChange}
                            fullWidth
                            variant="outlined"
                        />

                        <Stack direction="row" justifyContent="flex-end">
                            <Button
                                type="submit"
                                variant="contained"
                                startIcon={isLoading ? <CircularProgress size={18} /> : <Save />}
                                disabled={isLoading}
                                sx={{
                                    textTransform: "none",
                                    fontWeight: 600,
                                    minWidth: 180,
                                    py: 1.2,
                                    borderRadius: 2,
                                    boxShadow: theme.shadows[2],
                                }}
                            >
                                {isLoading ? "Saving..." : "Create Product"}
                            </Button>
                        </Stack>
                    </Stack>
                </form>
            </Paper>
        </Box>
    );
}
