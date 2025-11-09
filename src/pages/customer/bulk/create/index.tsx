// src/screens/customers/BulkUploadUsers.tsx
import React, { useState, useRef } from "react";
import {
  Box,
  Container,
  Breadcrumbs,
  Link,
  Typography,
  Paper,
  Stack,
  Button,
  LinearProgress,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

import {
  useLazyDownloadCustomersTemplateQuery,
  useBulkUploadCustomersMutation,
} from "../../../../store/api/customers/customer.api";

type Props = {
  onBack?: () => void;
  userId?: string;
};

const ACCEPTED_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "text/csv",
];

export default function BulkUploadUsers({ onBack, userId }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const [triggerDownloadTemplate, { isFetching: isDownloading }] =
    useLazyDownloadCustomersTemplateQuery();
  const [bulkUpload, { isLoading: isUploading }] =
    useBulkUploadCustomersMutation();

  const handleSelectFile = () => inputRef.current?.click();

  const isAcceptedFile = (f: File | null) =>
    !!f &&
    (ACCEPTED_TYPES.includes(f.type) ||
      f.name.toLowerCase().endsWith(".xlsx") ||
      f.name.toLowerCase().endsWith(".xls") ||
      f.name.toLowerCase().endsWith(".csv"));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0] || null;
    if (uploadedFile && isAcceptedFile(uploadedFile)) setFile(uploadedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0] || null;
    if (dropped && isAcceptedFile(dropped)) setFile(dropped);
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await triggerDownloadTemplate().unwrap();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "customers_template.xlsx";
      link.click();
      window.URL.revokeObjectURL(url);
    } catch {
      Swal.fire("Download Failed", "Unable to download template.", "error");
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    try {
      const res: any = await bulkUpload({ file, userId }).unwrap();
      const { totalRows, createdCount, skippedCount, errors } = res.data;

      // ✅ All Success
      if (createdCount === totalRows) {
        Swal.fire({
          icon: "success",
          title: "Upload Successful",
          text: `${createdCount} users created successfully.`,
          timer: 5000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
        setTimeout(() => navigate("/customer"), 5000);
        return;
      }

      // ⚠ Partial Success
      if (createdCount > 0 && skippedCount > 0) {
        const skippedList = errors.map((e) => e.email).slice(0, 5);
        let html = `<p>${skippedCount} user(s) skipped due to duplicate email:</p><ul>`;
        skippedList.forEach((email) => (html += `<li>${email}</li>`));
        html += `</ul>`;

        if (skippedCount > 5) html += `<p style="color:#888;">... and more</p>`;

        Swal.fire({
          icon: "warning",
          title: "Partial Upload",
          html,
          confirmButtonText: "OK",
        });
        return;
      }

      // ❌ All Failed
      if (createdCount === 0) {
        const list = errors.map((e) => e.email).join("<br>");
        Swal.fire({
          icon: "error",
          title: "Upload Failed",
          html: `<p>No users were created.</p><p style="margin-top:8px;">${list}</p>`,
        });
      }
    } catch {
      Swal.fire("Upload Failed", "Something went wrong during upload.", "error");
    }
  };

  return (
    <Box sx={{   height: "100%",
          overflowY: "auto",
          overflowX: "hidden",
          bgcolor: "#FAFAFB",
          py: 2,}}>
      <Container maxWidth="md">
 

        <Typography sx={{ fontSize: 32, fontWeight: 700, mb: 1 }}>
          Bulk Upload Users
        </Typography>
        <Typography sx={{ fontSize: 15, color: "#6B7280", mb: 3 }}>
          Upload multiple users at once using a CSV or Excel file.
        </Typography>

        {/* Step 1 */}
        <Paper sx={{ p: 3, borderRadius: 3, border: "1px solid #EAEAEA", mb: 3 }}>
          <Typography sx={{ fontWeight: 700, mb: 1 }}>Step 1: Download Template</Typography>
          <Typography sx={{ fontSize: 13, color: "#B45309", mb: 2 }}>
            Use the template to ensure proper formatting.
          </Typography>
          <Button
            variant="contained"
            startIcon={<DownloadRoundedIcon />}
            onClick={handleDownloadTemplate}
            disabled={isDownloading}
            sx={{ borderRadius: 2, fontWeight: 600 }}
          >
            {isDownloading ? "Preparing..." : "Download CSV Template"}
          </Button>
          {isDownloading && <LinearProgress sx={{ mt: 1 }} />}
        </Paper>

        {/* Step 2 */}
        <Paper sx={{ p: 3, borderRadius: 3, border: "1px solid #EAEAEA", mb: 3 }}>
          <Typography sx={{ fontWeight: 700, mb: 1 }}>Step 2: Upload Your File</Typography>
          <Typography sx={{ fontSize: 13, color: "#B45309", mb: 2 }}>
            Drag and drop your CSV/Excel file or click to browse.
          </Typography>

          <Box
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={handleSelectFile}
            sx={{
              border: "2px dashed #D1D5DE",
              borderRadius: 2,
              py: 8,
              textAlign: "center",
              cursor: "pointer",
            }}
          >
            <CloudUploadIcon sx={{ fontSize: 45, color: "#9CA3AF" }} />
            <Typography sx={{ fontSize: 15, mt: 1 }}>
              {file ? file.name : "Drag and drop your CSV file here"}
            </Typography>
            <Typography sx={{ fontSize: 12, color: "#9CA3AF", mt: 1 }}>
              Accepted formats: CSV / Excel • Max size: 10MB
            </Typography>
          </Box>

          <input
            type="file"
            ref={inputRef}
            style={{ display: "none" }}
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
          />
        </Paper>

        {/* Actions */}
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            disabled={!file || isUploading}
            onClick={handleUpload}
            sx={{ borderRadius: 2, fontWeight: 600, px: 3 }}
          >
            {isUploading ? "Uploading..." : "Create Bulk Customer"}
          </Button>

          <Button variant="outlined" sx={{ borderRadius: 2 }} onClick={onBack}>
            Cancel
          </Button>
        </Stack>

        {isUploading && <LinearProgress sx={{ mt: 2 }} />}
      </Container>
    </Box>
  );
}
