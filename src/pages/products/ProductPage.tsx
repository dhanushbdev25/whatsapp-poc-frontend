import * as React from "react";
import { Container, Stack, Typography, Paper, TextField, InputAdornment, Button, Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";

import ProductTable from "../products/components/ProductTable";
import ProductDialog from "../products/components/ProductDialog";
import { useProducts } from "../products/hooks/useProducts";
import { Product } from "../products/types/product.types";

export default function ProductManagementPage() {
    const initialProducts: Product[] = [
        {
            id: 1,
            name: "Green Tea",
            productType: "Beverage",
            productCode: "GT001",
            amount: "120",
            loyaltyPoints: 20,
            image: "https://cdn.pixabay.com/photo/2023/04/12/15/06/tea-7920574_1280.jpg",
        },
        {
            id: 2,
            name: "Black Coffee",
            productType: "Beverage",
            productCode: "BC002",
            amount: "150",
            loyaltyPoints: 25,
            image: "https://cdn.pixabay.com/photo/2023/04/12/15/06/tea-7920574_1280.jpg",
        },
    ];

    const { products, paged, filtered, checked, toggleRow, selectAll, page, setPage, rowsPerPage, setRowsPerPage, search, setSearch } = useProducts(initialProducts);

    const [menuAnchor, setMenuAnchor] = React.useState<null | HTMLElement>(null);
    const [selectedRow, setSelectedRow] = React.useState<Product | null>(null);
    const [editOpen, setEditOpen] = React.useState(false);
    const [editModel, setEditModel] = React.useState<Product | null>(null);
    const [isAddMode, setIsAddMode] = React.useState(false);

    const handleMenuOpen = (e: React.MouseEvent<HTMLButtonElement>, row: Product) => {
        setMenuAnchor(e.currentTarget);
        setSelectedRow(row);
    };
    const handleMenuClose = () => {
        setMenuAnchor(null);
        setSelectedRow(null);
    };

    const handleEditOpen = () => {
        handleMenuClose();
        setEditModel(selectedRow);
        setIsAddMode(false);
        setEditOpen(true);
    };

    const handleAddOpen = () => {
        setEditModel({} as Product);
        setIsAddMode(true);
        setEditOpen(true);
    };

    const handleEditSave = () => {
        if (!editModel) return;
        if (isAddMode) {
            const newProduct = { ...editModel, id: products.length ? Math.max(...products.map((p) => p.id)) + 1 : 1 };
            products.push(newProduct);
        } else {
            const index = products.findIndex((p) => p.id === editModel.id);
            if (index !== -1) products[index] = editModel;
        }
        setEditOpen(false);
    };

    return (
        <Container maxWidth="xl" sx={{ pt: 0.2, pb: 1 }}>
            {/* <Stack direction="row" justifyContent="space-between" sx={{ mt: 2 }}>
                <Stack>
                    <Typography sx={{ fontSize: 28, fontWeight: 800 }}>Product Management</Typography>
                    <Typography sx={{ fontSize: 14, color: "#6B7280" }}>Manage and track all your products in one place</Typography>
                </Stack>

            </Stack> */}


            <ProductTable
                paged={paged}
                checked={checked}
                toggleRow={toggleRow}
                selectAll={selectAll}
                page={page}
                setPage={setPage}
                rowsPerPage={rowsPerPage}
                setRowsPerPage={setRowsPerPage}
                onMenuClick={handleMenuOpen}
                filteredLength={filtered.length}
                products={products}
            />

            <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
                <MenuItem>
                    <ListItemIcon><VisibilityRoundedIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>View</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleEditOpen}>
                    <ListItemIcon><EditRoundedIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>Edit</ListItemText>
                </MenuItem>
                <MenuItem>
                    <ListItemIcon><DeleteOutlineRoundedIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>Delete</ListItemText>
                </MenuItem>
            </Menu>

            <ProductDialog open={editOpen} isAddMode={isAddMode} editModel={editModel} setEditModel={setEditModel} onClose={() => setEditOpen(false)} onSave={handleEditSave} />
        </Container>
    );
}
