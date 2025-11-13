import { Stack, Typography, Box } from "@mui/material";
import { CheckCircle2, Circle, Truck } from "lucide-react";

export default function CustomerOrderStatus({
    title,
    subtitle,
    active,
    completed,
    isLast,
}: {
    title: string;
    subtitle?: string;
    active?: boolean;
    completed?: boolean;
    isLast?: boolean; // 👈 we'll use this to hide the line for the last item
}) {
    const getIconColor = () => {
        if (completed) return "#22c55e"; // green
        if (active) return "#f59e0b"; // amber
        return "#d1d5db"; // gray
    };

    const getIcon = () => {
        if (completed)
            return <CheckCircle2 size={20} color={getIconColor()} />;
        return <Circle size={20} color={getIconColor()} />;
    };

    return (
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
            {/* Icon + Line */}
            <Box sx={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
                {getIcon()}
                {/* 👇 Connecting line */}
                {!isLast && (
                    <Box
                        sx={{
                            position: "absolute",
                            top: 22,
                            left: "50%",
                            transform: "translateX(-50%)",
                            width: 2,
                            height: 32,
                            bgcolor: "#e0e0e0",
                            zIndex: 0,
                        }}
                    />
                )}
            </Box>

            {/* Text Content */}
            <Box>
                <Typography
                    fontWeight={completed || active ? 700 : 400}
                    variant="body2"
                    color={completed || active ? "text.primary" : "text.secondary"}
                >
                    {title}
                </Typography>
                {subtitle && (
                    <Typography
                        variant="caption"
                        color={completed || active ? "text.primary" : "text.secondary"}
                    >
                        {subtitle}
                    </Typography>
                )}
            </Box>
        </Stack>
    );
}

// ✅ Usage Example
export function OrderTracking() {
    return (
        <Stack spacing={2}>
            {/* Header */}
            <Box sx={{ background: "#F0F5FD", textAlign: "center", py: 2, borderRadius: 2 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                    <span
                        style={{
                            background: "#DBE8F4",
                            padding: "8px 6px",
                            borderRadius: "50%",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Truck size={18} />
                    </span>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Your package is on the way!
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                    Estimated delivery: 14/11/2025
                </Typography>
            </Box>

            {/* Tracking Steps */}
            <Stack sx={{ mt: 1 }} spacing={2}>
                <CustomerOrderStatus title="Order Placed" subtitle="02/11/2025" completed />
                <CustomerOrderStatus title="Processing" subtitle="Preparing your order" completed />
                <CustomerOrderStatus title="Shipped" subtitle="Package is in transit" active />
                <CustomerOrderStatus title="Out for Delivery" subtitle="Package arriving today" isLast />
            </Stack>
        </Stack>
    );
}
