import { Stack, Typography } from "@mui/material";

function CustomerOrderTrack({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <Stack direction="row" spacing={1}>
            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 130 }}>
                {label}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {value}
            </Typography>
        </Stack>
    );
}

export default CustomerOrderTrack;