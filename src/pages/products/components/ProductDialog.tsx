import * as React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Stack, TextField, Button, Box } from "@mui/material";
import { Product } from "../types/product.types";

interface ProductDialogProps {
  open: boolean;
  isAddMode: boolean;
  editModel: Product | null;
  setEditModel: React.Dispatch<React.SetStateAction<Product | null>>;
  onClose: () => void;
  onSave: () => void;
}

export default function ProductDialog({ open, isAddMode, editModel, setEditModel, onClose, onSave }: ProductDialogProps) {
  if (!editModel) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setEditModel((s) => ({ ...s!, metadata: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: "bold", fontSize: 18, bgcolor: "#f5f5f5", borderBottom: "1px solid #eee" }}>
        {isAddMode ? "Add Product" : "Edit Product"}
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            fullWidth
            label="Product Name"
            value={editModel?.name || ""}
            onChange={(e) => setEditModel((s) => ({ ...s!, name: e.target.value }))}
            sx={{ backgroundColor: "#FFF8EE" }}
          />
          <TextField
            fullWidth
            label="Product Type"
            value={editModel?.productType || ""}
            onChange={(e) => setEditModel((s) => ({ ...s!, productType: e.target.value }))}
            sx={{ backgroundColor: "#FFF8EE" }}
          />
          <TextField
            fullWidth
            label="Amount"
            type="number"
            value={editModel?.amount || ""}
            onChange={(e) => setEditModel((s) => ({ ...s!, amount: e.target.value }))}
            sx={{ backgroundColor: "#FFF8EE" }}
          />
          <TextField
            fullWidth
            label="Loyalty Points"
            type="number"
            value={editModel?.loyaltyPoints || ""}
            onChange={(e) => setEditModel((s) => ({ ...s!, loyaltyPoints: Number(e.target.value) }))}
            sx={{ backgroundColor: "#FFF8EE" }}
          />

          <Button variant="contained" component="label">
            Upload Image
            <input type="file" hidden onChange={handleImageUpload} />
          </Button>

          {editModel?.metadata && (
            <Box mt={1}>
              <img
                src={editModel.metadata}
                alt="Preview"
                width="100%"
                height={120}
                style={{ borderRadius: "8px", objectFit: "cover", border: "1px solid #ddd" }}
              />
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "flex-end", px: 3, py: 2, backgroundColor: "#f9f9f9", borderTop: "1px solid #eee" }}>
        <Button variant="outlined" onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onSave}>{isAddMode ? "Add Product" : "Save Changes"}</Button>
      </DialogActions>
    </Dialog>
  );
}
