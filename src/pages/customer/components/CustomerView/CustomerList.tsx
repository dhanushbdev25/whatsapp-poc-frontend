import { Stack, Typography } from '@mui/material';
import React from 'react'

function CustomerList({
    name,
    qty,
    unit,
    total,
}: {
    name: string;
    qty: number;
    unit: string;
    total: string;
}) {
    return (
        <Stack direction="row" alignItems="center" sx={{ p: 1.25 }}>
            <Typography sx={{ flex: 1, fontWeight: 600 }}>{name}</Typography>
            <Typography sx={{ width: 80 }} align="center">
                {qty}
            </Typography>
            <Typography sx={{ width: 120 }} align="center">
                {unit}
            </Typography>
            <Typography sx={{ width: 120 }} align="right" fontWeight={700}>
                {total}
            </Typography>
        </Stack>
    );
}

export default CustomerList


