import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Grid,
    Paper,
    Stack,
    IconButton,
    InputBase,
    Button,
    Chip,
    Menu,
    MenuItem,
    Breadcrumbs,
    Link,
    Select,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Alert,
    Snackbar,
} from "@mui/material";
import {
    MoreVert,
    Search,
    Send,
    Add,
    NavigateNext,
    Close,
} from "@mui/icons-material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = `${process.env.API_BASE_URL}webhook/fetchTemplates`;

interface Template {
    label: string;
    value: string;
    data: {
        body: string;
        category?: string;
        image?: string;
        status?: string;
        language?: string;
    };
    createdDate?: string;
    usedDate?: string;
}

export default function MessageTemplates() {
    const navigate = useNavigate();

    const [templates, setTemplates] = useState<Template[]>([]);
    const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

    // Dialog states
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [sendDialogOpen, setSendDialogOpen] = useState(false);

    // Snackbar state
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success" as "success" | "error" | "info",
    });

    // New template form
    const [newTemplate, setNewTemplate] = useState({
        label: "",
        body: "",
        category: "MARKETING",
    });

    useEffect(() => {
        fetchTemplates();
    }, []);

    useEffect(() => {
        filterTemplates();
    }, [templates, searchQuery, categoryFilter]);

    const fetchTemplates = () => {
        axios
            .get(API_URL)
            .then((res) => {
                if (res.data.success) {
                    const formatted = res.data.data.map((t: any) => ({
                        ...t,
                        label: t.label
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (x: string) => x.toUpperCase()),
                        createdDate: generateRandomDate(2024, 1, 7),
                        usedDate: generateRandomDate(2025, 1, 11),
                    }));
                    setTemplates(formatted);
                    setFilteredTemplates(formatted);
                }
            })
            .catch(() => {
                // Mock data for demo
                const mockTemplates = [
                    {
                        label: "Order Placed",
                        value: "order_placed",
                        data: {
                            body: "Hey {{1}} 🌸\n\nThank you for shopping with Lush & Addmie! 💖\nWe've received your order #{{2}} and it's now being prepared with care.",
                            category: "MARKETING",
                            status: "APPROVED",
                        },
                        createdDate: "01/07/2024",
                        usedDate: "04/11/2025",
                    },
                    {
                        label: "Order Confirmation",
                        value: "order_confirmation",
                        data: {
                            body: "Hey {{1}} 🌸\nYou're almost there! ✨\n\nYour selected items are waiting to be processed.",
                            category: "MARKETING",
                            status: "APPROVED",
                        },
                        createdDate: "01/08/2024",
                        usedDate: "03/11/2025",
                    },
                    {
                        label: "Lush Catalogue",
                        value: "lush_catalouge",
                        data: {
                            body: "Hey {{1}} 💖\nWelcome to your Lush Collection Preview!",
                            category: "MARKETING",
                            status: "APPROVED",
                        },
                        createdDate: "15/09/2024",
                        usedDate: "28/10/2025",
                    },
                    {
                        label: "Hello World",
                        value: "hello_world",
                        data: {
                            body: "Welcome and congratulations!! This message demonstrates your ability to send a WhatsApp message notification.",
                            category: "UTILITY",
                            status: "APPROVED",
                        },
                        createdDate: "20/07/2024",
                        usedDate: "04/11/2025",
                    },
                ];
                setTemplates(mockTemplates);
                setFilteredTemplates(mockTemplates);
            });
    };

    const generateRandomDate = (year: number, month: number, day: number) => {
        const randomDay = Math.floor(Math.random() * 28) + 1;
        const randomMonth = Math.floor(Math.random() * 12) + 1;
        return `${randomDay.toString().padStart(2, "0")}/${randomMonth
            .toString()
            .padStart(2, "0")}/${year}`;
    };

    const filterTemplates = () => {
        let filtered = [...templates];

        // Search filter
        if (searchQuery.trim()) {
            filtered = filtered.filter(
                (t) =>
                    t.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    t.data.body.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Category filter
        if (categoryFilter !== "all") {
            filtered = filtered.filter((t) => {
                const category = t.data.category?.toUpperCase();
                if (categoryFilter === "welcome") return category === "MARKETING";
                if (categoryFilter === "promotional") return category === "PROMOTIONAL";
                if (categoryFilter === "transactional") return category === "UTILITY";
                return true;
            });
        }

        setFilteredTemplates(filtered);
    };

    const getBadgeStyle = (category?: string) => {
        const c = category?.toUpperCase();
        if (c === "MARKETING") {
            return { bg: "#D1FAE5", color: "#065F46", text: "Welcome" };
        }
        if (c === "PROMOTIONAL") {
            return { bg: "#FCE7F3", color: "#BE185D", text: "Promotional" };
        }
        return { bg: "#DBEAFE", color: "#1E40AF", text: "Transactional" };
    };

    const handleMenuOpen = (
        event: React.MouseEvent<HTMLElement>,
        template: Template
    ) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
        setSelectedTemplate(template);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleEdit = () => {
        if (selectedTemplate) {
            setNewTemplate({
                label: selectedTemplate.label,
                body: selectedTemplate.data.body,
                category: selectedTemplate.data.category || "MARKETING",
            });
            setEditDialogOpen(true);
        }
        handleMenuClose();
    };

    const handleDuplicate = () => {
        if (selectedTemplate) {
            const duplicated = {
                ...selectedTemplate,
                label: `${selectedTemplate.label} (Copy)`,
                value: `${selectedTemplate.value}_copy_${Date.now()}`,
                createdDate: new Date().toLocaleDateString("en-GB"),
                usedDate: "-",
            };
            setTemplates([duplicated, ...templates]);
            showSnackbar("Template duplicated successfully", "success");
        }
        handleMenuClose();
    };

    const handleDelete = () => {
        if (selectedTemplate) {
            setTemplates(templates.filter((t) => t.value !== selectedTemplate.value));
            showSnackbar("Template deleted successfully", "success");
        }
        handleMenuClose();
    };

    const handleCreateTemplate = () => {
        if (!newTemplate.label.trim() || !newTemplate.body.trim()) {
            showSnackbar("Please fill in all required fields", "error");
            return;
        }

        const template: Template = {
            label: newTemplate.label,
            value: newTemplate.label.toLowerCase().replace(/\s+/g, "_"),
            data: {
                body: newTemplate.body,
                category: newTemplate.category,
                status: "PENDING",
            },
            createdDate: new Date().toLocaleDateString("en-GB"),
            usedDate: "-",
        };

        setTemplates([template, ...templates]);
        setCreateDialogOpen(false);
        setNewTemplate({ label: "", body: "", category: "MARKETING" });
        showSnackbar("Template created successfully", "success");
    };

    const handleUpdateTemplate = () => {
        if (!newTemplate.label.trim() || !newTemplate.body.trim()) {
            showSnackbar("Please fill in all required fields", "error");
            return;
        }

        if (selectedTemplate) {
            const updated = templates.map((t) =>
                t.value === selectedTemplate.value
                    ? {
                        ...t,
                        label: newTemplate.label,
                        data: {
                            ...t.data,
                            body: newTemplate.body,
                            category: newTemplate.category,
                        },
                    }
                    : t
            );
            setTemplates(updated);
            setEditDialogOpen(false);
            setNewTemplate({ label: "", body: "", category: "MARKETING" });
            showSnackbar("Template updated successfully", "success");
        }
    };

    const handleSendMessage = () => {
        setSendDialogOpen(true);
    };

    const handleConfirmSend = () => {
        // In a real app, this would send the message via API
        setSendDialogOpen(false);
        showSnackbar("Message sent successfully", "success");
    };

    const showSnackbar = (
        message: string,
        severity: "success" | "error" | "info"
    ) => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <Box
            sx={{
                background: "#F9FAFB",
                minHeight: "100vh",
                fontFamily: "Inter, -apple-system, sans-serif",
            }}
        >
            <Box sx={{ maxWidth: 1440, mx: "auto", p: 3 }}>
                {/* Breadcrumbs */}
                <Breadcrumbs
                    separator={<NavigateNext sx={{ fontSize: 16, color: "#9CA3AF" }} />}
                    sx={{ mb: 2 }}
                >
                    <Link
                        href="#"
                        underline="hover"
                        sx={{
                            color: "#F97316",
                            fontSize: 13,
                            fontWeight: 500,
                            cursor: "pointer",
                        }}
                        onClick={() => showSnackbar("Navigating to Dashboard", "info")}
                    >
                        Dashboard
                    </Link>
                    <Typography sx={{ color: "#111827", fontSize: 13, fontWeight: 500 }}>
                        Message Templates
                    </Typography>
                </Breadcrumbs>

                {/* Header */}
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    sx={{ mb: 3 }}
                >
                    <Box>
                        <Typography
                            sx={{ fontSize: 30, fontWeight: 700, color: "#111827", mb: 0.5 }}
                        >
                            Message Templates
                        </Typography>
                        <Typography sx={{ fontSize: 14, color: "#6B7280" }}>
                            Create and manage WhatsApp message templates
                        </Typography>
                    </Box>

                    <Stack direction="row" spacing={1.5}>
                        <Button
                            startIcon={<Send sx={{ fontSize: 18 }} />}
                            onClick={() => navigate('/send/message')} sx={{
                                textTransform: "none",
                                borderRadius: "8px",
                                height: 40,
                                fontSize: 14,
                                fontWeight: 500,
                                color: "#374151",
                                background: "#FFFFFF",
                                border: "1px solid #D1D5DB",
                                px: 2,
                                "&:hover": {
                                    background: "#F9FAFB",
                                    borderColor: "#9CA3AF",
                                },
                            }}
                        >
                            Send Message
                        </Button>

                        <Button
                            startIcon={<Add sx={{ fontSize: 20 }} />}
                            variant="contained"
                            onClick={() => setCreateDialogOpen(true)}
                            sx={{
                                textTransform: "none",
                                borderRadius: "8px",
                                height: 40,
                                fontSize: 14,
                                fontWeight: 500,
                                background: "#0EA5E9",
                                px: 2.5,
                                boxShadow: "none",
                                "&:hover": {
                                    background: "#0284C7",
                                    boxShadow: "none",
                                },
                            }}
                        >
                            Create New Template
                        </Button>
                    </Stack>
                </Stack>

                {/* Search and Filter Bar */}
                <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                    <Box
                        sx={{
                            flex: 1,
                            border: "1px solid #E5E7EB",
                            background: "#FFFFFF",
                            borderRadius: "8px",
                            px: 2,
                            height: 44,
                            display: "flex",
                            alignItems: "center",
                        }}
                    >
                        <Search sx={{ fontSize: 20, color: "#9CA3AF", mr: 1 }} />
                        <InputBase
                            placeholder="Search templates..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            sx={{
                                fontSize: 14,
                                flex: 1,
                                color: "#111827",
                                "::placeholder": { color: "#9CA3AF" },
                            }}
                        />
                        {searchQuery && (
                            <IconButton
                                size="small"
                                onClick={() => setSearchQuery("")}
                                sx={{ p: 0.5 }}
                            >
                                <Close sx={{ fontSize: 18 }} />
                            </IconButton>
                        )}
                    </Box>

                    <Select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        displayEmpty
                        sx={{
                            minWidth: 180,
                            height: 44,
                            background: "#FFFFFF",
                            borderRadius: "8px",
                            fontSize: 14,
                            border: "1px solid #E5E7EB",
                            "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                            "&:hover": {
                                borderColor: "#D1D5DB",
                            },
                        }}
                    >
                        <MenuItem value="all">All Categories</MenuItem>
                        <MenuItem value="welcome">Welcome</MenuItem>
                        <MenuItem value="promotional">Promotional</MenuItem>
                        <MenuItem value="transactional">Transactional</MenuItem>
                    </Select>
                </Stack>

                {/* Results Count */}
                <Typography sx={{ fontSize: 14, color: "#6B7280", mb: 2 }}>
                    Showing {filteredTemplates.length} of {templates.length} templates
                </Typography>

                {/* Template Cards Grid */}
                <Grid container spacing={2.5}>
                    {filteredTemplates.length === 0 ? (
                        <Grid size={12}>
                            <Box
                                sx={{
                                    textAlign: "center",
                                    py: 8,
                                    px: 2,
                                }}
                            >
                                <Typography
                                    sx={{ fontSize: 18, fontWeight: 600, color: "#111827", mb: 1 }}
                                >
                                    No templates found
                                </Typography>
                                <Typography sx={{ fontSize: 14, color: "#6B7280", mb: 3 }}>
                                    {searchQuery || categoryFilter !== "all"
                                        ? "Try adjusting your search or filters"
                                        : "Get started by creating your first template"}
                                </Typography>
                                {!searchQuery && categoryFilter === "all" && (
                                    <Button
                                        variant="contained"
                                        startIcon={<Add />}
                                        onClick={() => setCreateDialogOpen(true)}
                                        sx={{
                                            textTransform: "none",
                                            background: "#0EA5E9",
                                            "&:hover": { background: "#0284C7" },
                                        }}
                                    >
                                        Create Template
                                    </Button>
                                )}
                            </Box>
                        </Grid>
                    ) : (
                        filteredTemplates.map((tpl) => {
                            const badge = getBadgeStyle(tpl.data.category);

                            return (
                                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={tpl.value}>
                                    <Paper
                                        elevation={0}
                                        onClick={() => {
                                            setSelectedTemplate(tpl);
                                            showSnackbar(`Opened ${tpl.label}`, "info");
                                        }}
                                        sx={{
                                            borderRadius: "8px",
                                            border: "1px solid #E5E7EB",
                                            background: "#FFFFFF",
                                            p: 2.5,
                                            height: "100%",
                                            display: "flex",
                                            flexDirection: "column",
                                            transition: "all 0.15s ease",
                                            cursor: "pointer",
                                            "&:hover": {
                                                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                                                borderColor: "#D1D5DB",
                                            },
                                        }}
                                    >
                                        {/* Category Badge and Menu */}
                                        <Stack
                                            direction="row"
                                            justifyContent="space-between"
                                            alignItems="center"
                                            sx={{ mb: 1.5 }}
                                        >
                                            <Chip
                                                label={badge.text}
                                                sx={{
                                                    background: badge.bg,
                                                    color: badge.color,
                                                    fontSize: 11,
                                                    fontWeight: 600,
                                                    borderRadius: "4px",
                                                    height: 22,
                                                    "& .MuiChip-label": {
                                                        px: 1.2,
                                                        py: 0,
                                                    },
                                                }}
                                            />

                                            <IconButton
                                                size="small"
                                                onClick={(e) => handleMenuOpen(e, tpl)}
                                                sx={{
                                                    p: 0.25,
                                                    "&:hover": {
                                                        background: "#F3F4F6",
                                                    },
                                                }}
                                            >
                                                <MoreVert sx={{ fontSize: 18, color: "#6B7280" }} />
                                            </IconButton>
                                        </Stack>

                                        {/* Template Title */}
                                        <Typography
                                            sx={{
                                                fontSize: 15,
                                                fontWeight: 600,
                                                color: "#111827",
                                                mb: 1.25,
                                                lineHeight: 1.3,
                                            }}
                                        >
                                            {tpl.label}
                                        </Typography>

                                        {/* Template Body Preview */}
                                        <Typography
                                            sx={{
                                                fontSize: 13,
                                                color: "#6B7280",
                                                lineHeight: 1.5,
                                                display: "-webkit-box",
                                                WebkitLineClamp: 3,
                                                WebkitBoxOrient: "vertical",
                                                overflow: "hidden",
                                                mb: "auto",
                                                flex: 1,
                                                minHeight: 60,
                                            }}
                                        >
                                            {tpl.data.body.replace(/\n/g, " ")}
                                        </Typography>

                                        {/* Footer with Dates */}
                                        <Stack
                                            direction="row"
                                            justifyContent="space-between"
                                            sx={{
                                                borderTop: "1px solid #E5E7EB",
                                                pt: 1.5,
                                                mt: 2,
                                                fontSize: 11,
                                                color: "#9CA3AF",
                                            }}
                                        >
                                            <span>Created {tpl.createdDate}</span>
                                            <span>Used {tpl.usedDate}</span>
                                        </Stack>
                                    </Paper>
                                </Grid>
                            );
                        })
                    )}
                </Grid>

                {/* Context Menu */}
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    sx={{
                        "& .MuiPaper-root": {
                            borderRadius: "8px",
                            border: "1px solid #E5E7EB",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                            minWidth: 160,
                        },
                    }}
                >
                    <MenuItem
                        onClick={handleEdit}
                        sx={{
                            fontSize: 14,
                            py: 1.2,
                            "&:hover": { background: "#F9FAFB" },
                        }}
                    >
                        Edit Template
                    </MenuItem>
                    <MenuItem
                        onClick={handleDuplicate}
                        sx={{
                            fontSize: 14,
                            py: 1.2,
                            "&:hover": { background: "#F9FAFB" },
                        }}
                    >
                        Duplicate
                    </MenuItem>
                    <MenuItem
                        onClick={handleDelete}
                        sx={{
                            fontSize: 14,
                            py: 1.2,
                            color: "#DC2626",
                            "&:hover": { background: "#FEF2F2" },
                        }}
                    >
                        Delete
                    </MenuItem>
                </Menu>

                {/* Create Template Dialog */}
                <Dialog
                    open={createDialogOpen}
                    onClose={() => setCreateDialogOpen(false)}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle sx={{ fontWeight: 600, fontSize: 18 }}>
                        Create New Template
                    </DialogTitle>
                    <DialogContent>
                        <Stack spacing={2.5} sx={{ mt: 2 }}>
                            <TextField
                                label="Template Name"
                                fullWidth
                                value={newTemplate.label}
                                onChange={(e) =>
                                    setNewTemplate({ ...newTemplate, label: e.target.value })
                                }
                                placeholder="e.g., Welcome Message"
                            />
                            <FormControl fullWidth>
                                <InputLabel>Category</InputLabel>
                                <Select
                                    value={newTemplate.category}
                                    label="Category"
                                    onChange={(e) =>
                                        setNewTemplate({ ...newTemplate, category: e.target.value })
                                    }
                                >
                                    <MenuItem value="MARKETING">Welcome</MenuItem>
                                    <MenuItem value="PROMOTIONAL">Promotional</MenuItem>
                                    <MenuItem value="UTILITY">Transactional</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField
                                label="Message Body"
                                fullWidth
                                multiline
                                rows={6}
                                value={newTemplate.body}
                                onChange={(e) =>
                                    setNewTemplate({ ...newTemplate, body: e.target.value })
                                }
                                placeholder="Enter your message template..."
                            />
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2.5 }}>
                        <Button
                            onClick={() => setCreateDialogOpen(false)}
                            sx={{ textTransform: "none" }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreateTemplate}
                            variant="contained"
                            sx={{
                                textTransform: "none",
                                background: "#0EA5E9",
                                "&:hover": { background: "#0284C7" },
                            }}
                        >
                            Create Template
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Edit Template Dialog */}
                <Dialog
                    open={editDialogOpen}
                    onClose={() => setEditDialogOpen(false)}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle sx={{ fontWeight: 600, fontSize: 18 }}>
                        Edit Template
                    </DialogTitle>
                    <DialogContent>
                        <Stack spacing={2.5} sx={{ mt: 2 }}>
                            <TextField
                                label="Template Name"
                                fullWidth
                                value={newTemplate.label}
                                onChange={(e) =>
                                    setNewTemplate({ ...newTemplate, label: e.target.value })
                                }
                            />
                            <FormControl fullWidth>
                                <InputLabel>Category</InputLabel>
                                <Select
                                    value={newTemplate.category}
                                    label="Category"
                                    onChange={(e) =>
                                        setNewTemplate({ ...newTemplate, category: e.target.value })
                                    }
                                >
                                    <MenuItem value="MARKETING">Welcome</MenuItem>
                                    <MenuItem value="PROMOTIONAL">Promotional</MenuItem>
                                    <MenuItem value="UTILITY">Transactional</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField
                                label="Message Body"
                                fullWidth
                                multiline
                                rows={6}
                                value={newTemplate.body}
                                onChange={(e) =>
                                    setNewTemplate({ ...newTemplate, body: e.target.value })
                                }
                            />
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2.5 }}>
                        <Button
                            onClick={() => setEditDialogOpen(false)}
                            sx={{ textTransform: "none" }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpdateTemplate}
                            variant="contained"
                            sx={{
                                textTransform: "none",
                                background: "#0EA5E9",
                                "&:hover": { background: "#0284C7" },
                            }}
                        >
                            Update Template
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Send Message Dialog */}
                <Dialog
                    open={sendDialogOpen}
                    onClose={() => setSendDialogOpen(false)}
                    maxWidth="xs"
                    fullWidth
                >
                    <DialogTitle sx={{ fontWeight: 600, fontSize: 18 }}>
                        Send Message
                    </DialogTitle>
                    <DialogContent>
                        <Typography sx={{ color: "#6B7280", fontSize: 14, mb: 2 }}>
                            Select a template to send a WhatsApp message to your customers.
                        </Typography>
                        <FormControl fullWidth>
                            <InputLabel>Select Template</InputLabel>
                            <Select
                                value={selectedTemplate?.value || ""}
                                label="Select Template"
                                onChange={(e) => {
                                    const tpl = templates.find((t) => t.value === e.target.value);
                                    setSelectedTemplate(tpl || null);
                                }}
                            >
                                {templates.map((tpl) => (
                                    <MenuItem key={tpl.value} value={tpl.value}>
                                        {tpl.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2.5 }}>
                        <Button
                            onClick={() => setSendDialogOpen(false)}
                            sx={{ textTransform: "none" }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirmSend}
                            variant="contained"
                            disabled={!selectedTemplate}
                            sx={{
                                textTransform: "none",
                                background: "#0EA5E9",
                                "&:hover": { background: "#0284C7" },
                            }}
                        >
                            Send Message
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Snackbar for notifications */}
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={3000}
                    onClose={handleCloseSnackbar}
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                >
                    <Alert
                        onClose={handleCloseSnackbar}
                        severity={snackbar.severity}
                        sx={{ width: "100%" }}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Box>
        </Box>
    );
}