import React, { useState, useEffect } from "react";
import {
    Button,
    Typography,
    Box,
    Paper,
    Stack,
    CircularProgress,
    Fade,
} from "@mui/material";
import { 
    ArrowBack,
    CheckCircle,
    Download
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import { env } from "../../config/env";

const API_BASE_URL = env.API_BASE_URL;

interface LocationState {
    processedImage: string;
    selectedFilter: {
        id: string;
        name: string;
        category: string;
        blob_url: string;
    };
    userId: string;
}

const VirtualTryOnPreview: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as LocationState;

    const [buyLoading, setBuyLoading] = useState(false);

    // Redirect if no state
    useEffect(() => {
        if (!state?.processedImage || !state?.selectedFilter) {
            Swal.fire("Error", "No preview data found", "error").then(() => {
                navigate(-1);
            });
        }
    }, [state, navigate]);

    if (!state?.processedImage || !state?.selectedFilter) {
        return null;
    }

    const { processedImage, selectedFilter, userId } = state;

    const downloadImage = () => {
        const a = document.createElement("a");
        a.href = processedImage;
        a.download = `virtual-try-on-${Date.now()}.jpg`;
        a.click();
    };

    const handleBuy = async () => {
        if (!userId) {
            return Swal.fire("Error", "User ID not found", "error");
        }

        if (!selectedFilter) {
            return Swal.fire("Error", "No hairstyle selected", "error");
        }

        setBuyLoading(true);
        const referMapping: any = {
            "6e1jnqkh31": "068cbb8f-5095-7dda-8000-895db9bac8e7",
            "andj2rsfqq": "068cbb8f-45b8-7abd-8000-4eeaecfa52c4",
            "hqa7i4994u": "068cbb8f-6b7c-7028-8000-091aebc43d15",
            "xgqz6890rv": "068cbb8f-5c54-709f-8000-c2f7d41d8538",
            "xxs5ht4du5": "068cbb8f-61bc-7b8c-8000-3a16a4755d9f",
            "q21hs2an9d": "068cbb8f-76c4-7a1a-8000-150ee6c38e8b"
        };
        const referCode = Object.keys(referMapping).find(
            key => referMapping[key] === selectedFilter.id
        );

        if (!referCode) {
            setBuyLoading(false);
            console.error("Refer code not found for filter ID:", selectedFilter.id);
            return Swal.fire("Error", "Product mapping not found", "error");
        }

        if (!API_BASE_URL) {
            setBuyLoading(false);
            console.error("API_BASE_URL is not defined");
            return Swal.fire("Error", "API configuration error", "error");
        }

        try {
            console.log("Calling API:", `${API_BASE_URL}webhook/orders/engagement/create`, {
                customerID: userId,
                productID: referCode,
                userId: userId
            });

            const response = await axios.post(`${API_BASE_URL}orders/engagement/create`, {
                customerID: userId,
                productID: referCode,
                userId: userId
            });

            console.log("API Response:", response);

            // Close the window and return to WhatsApp
            // Small delay to ensure the request completes
            setTimeout(() => {
                window.close();
                // Fallback: if window.close() doesn't work, try navigating back
                if (window.history.length > 1) {
                    window.history.back();
                }
            }, 300);
        } catch (error: any) {
            setBuyLoading(false);
            console.error("API Error:", error);
            const errorMsg = error.response?.data?.message || error.message || "Failed to record engagement";
            Swal.fire("Error", errorMsg, "error");
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    return (
        <Box 
            sx={{ 
                minHeight: "100vh", 
                display: "flex", 
                flexDirection: "column", 
                alignItems: "center",
                bgcolor: "background.default",
                pt: 3,
                pb: 4,
                px: 2
            }}
        >
            {/* Header */}
            <Box sx={{ width: "100%", maxWidth: 600, mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1.5, mb: 2 }}>
                    <CheckCircle sx={{ fontSize: 28, color: "success.main" }} />
                    <Typography 
                        variant="h5" 
                        sx={{ 
                            fontWeight: 600, 
                            color: "text.primary",
                            letterSpacing: "-0.02em"
                        }}
                    >
                        Your New Look
                    </Typography>
                </Box>
                <Typography 
                    variant="body1" 
                    sx={{ 
                        textAlign: "center", 
                        color: "text.primary",
                        fontWeight: 500,
                        mb: 1.5,
                        lineHeight: 1.6
                    }}
                >
                    Here's how you look with {selectedFilter.name}
                </Typography>
            </Box>

            {/* Preview Image */}
            <Fade in timeout={300}>
                <Paper 
                    elevation={3}
                    sx={{ 
                        width: "90%", 
                        maxWidth: 500, 
                        borderRadius: 2, 
                        overflow: "hidden", 
                        position: "relative",
                        border: "1px solid",
                        borderColor: "divider",
                        mb: 3
                    }}
                >
                    <Box sx={{ 
                        position: "relative",
                        width: "100%",
                        background: "#000",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minHeight: { xs: 400, sm: 500 }
                    }}>
                        <img 
                            src={processedImage} 
                            alt="Virtual Try-On Result"
                            style={{ 
                                width: "100%", 
                                height: "auto",
                                display: "block"
                            }} 
                        />
                    </Box>
                </Paper>
            </Fade>

            {/* Action Buttons */}
            <Box sx={{ width: "90%", maxWidth: 500 }}>
                <Stack spacing={2}>
                    <Button
                        onClick={handleBuy}
                        disabled={buyLoading}
                        variant="contained"
                        fullWidth
                        size="large"
                        sx={{
                            py: 1.5,
                            fontSize: 16,
                            fontWeight: 600,
                            textTransform: "none",
                            borderRadius: 2,
                            boxShadow: 2
                        }}
                    >
                        {buyLoading ? (
                            <CircularProgress size={24} />
                        ) : (
                            "Buy Now"
                        )}
                    </Button>

                    <Stack direction="row" spacing={1.5}>
                        <Button
                            onClick={handleBack}
                            variant="outlined"
                            size="medium"
                            startIcon={<ArrowBack />}
                            sx={{
                                py: 1.25,
                                fontSize: 14,
                                textTransform: "none",
                                borderRadius: 2,
                                minWidth: 120
                            }}
                        >
                            Back
                        </Button>
                        {/* <Button
                            onClick={shareImage}
                            variant="outlined"
                            fullWidth
                            size="medium"
                            startIcon={<Share />}
                            sx={{
                                py: 1.25,
                                fontSize: 14,
                                textTransform: "none",
                                borderRadius: 2
                            }}
                        >
                            Share
                        </Button> */}
                        <Button
                            onClick={downloadImage}
                            variant="outlined"
                            fullWidth
                            size="medium"
                            startIcon={<Download />}
                            sx={{
                                py: 1.25,
                                fontSize: 14,
                                textTransform: "none",
                                borderRadius: 2
                            }}
                        >
                            Download
                        </Button>
                    </Stack>
                </Stack>
            </Box>
        </Box>
    );
};

export default VirtualTryOnPreview;

