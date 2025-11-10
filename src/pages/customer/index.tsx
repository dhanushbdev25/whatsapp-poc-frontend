import * as React from "react";
import {
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Container,
  Divider,
  IconButton,
  InputAdornment,
  Link,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  Checkbox,
  FormControl,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  FormControlLabel,
  Radio,
  Switch,
  Snackbar,
  Alert,
  Menu,
  ListItemIcon,
  ListItemText,
  SelectChangeEvent,
  Grid,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import CircleIcon from "@mui/icons-material/Circle";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { useNavigate } from "react-router-dom";

// ✅ SINGLE source of hooks — ensure this path matches your store registration
import {
  useGetAllCustomersQuery,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
} from "../../store/api/customers/customer.api";

type StatusType = "Active" | "Pending Enrollment" | "Inactive";

export interface UserRow {
  /** Keep a numeric id internally, but we’ll render it as text */
  customerID: number;
  id: string; // stringified for table/checkbox map
  name: string;
  email: string;
  phone: string;
  status: StatusType;
  enrollmentDate: string;
  lastActive: string;
  method?: string;
  gender?: "Male" | "Female" | "Other" | "Prefer not to say";
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  loyalty?: {
    enrolled?: boolean;
    initialPoints?: number;
  };
  notifications?: {
    whatsapp?: boolean;
    emailUpdates?: boolean;
  };
  /** Local-only flag to simulate active toggle on frontend */
  _isActiveLocal?: boolean;
}

const STATUS_COLORS: Record<
  StatusType,
  { bg: string; text: string; dot: string }
> = {
  Active: { bg: "#E7F7EE", text: "#12A150", dot: "#12A150" },
  "Pending Enrollment": { bg: "#FFF2DD", text: "#C77800", dot: "#F59E0B" },
  Inactive: { bg: "#ECECEF", text: "#51535A", dot: "#51535A" },
};

function StatusChip({ status }: { status: StatusType }) {
  const s = STATUS_COLORS[status];
  return (
    <Chip
      size="small"
      icon={<CircleIcon sx={{ fontSize: 10, color: s.dot }} />}
      label={status}
      sx={{
        bgcolor: s.bg,
        color: s.text,
        px: 1.25,
        height: 26,
        borderRadius: "10px",
        "& .MuiChip-icon": { mr: 0.5 },
        fontWeight: 600,
        fontSize: 12,
      }}
    />
  );
}

type ViewMode = "list" | "create" | "details";

export default function UserManagement() {
  const navigate = useNavigate();

  // 🔌 API hooks
  const {
    data: apiCustomers = [],
    isLoading,
    isFetching,
    isSuccess,
    isError,
    error,
  } = useGetAllCustomersQuery(undefined, { refetchOnMountOrArgChange: true });
  const [updateCustomer, { isLoading: isSaving }] = useUpdateCustomerMutation();
  const [deleteCustomer] = useDeleteCustomerMutation();

  // 🔁 Map API → view rows (no mutation of apiCustomers; keep a derived array)
  const users = React.useMemo<UserRow[]>(
    () =>
      (apiCustomers || []).map((c: any) => {
        const status: StatusType = c.isActive ? "Active" : "Inactive";
        return {
          customerID: c.customerID,
          id: String(c.id),
          name: c.name,
          email: c.email,
          phone: c.phone ?? "-",
          status,
          enrollmentDate: c.createdAt
            ? new Date(c.createdAt).toLocaleDateString()
            : "-",
          lastActive: c.latestActive
            ? new Date(c.latestActive).toLocaleDateString()
            : "-",
          gender:
            (c.gender &&
              (c.gender[0].toUpperCase() + c.gender.slice(1).toLowerCase())) as
            | UserRow["gender"]
            | undefined,
          // Backend has single address string + state + pincode; keep view-friendly split if needed.
          address: {
            street: c.address || "",
            city: "",
            state: c.state || "",
            postalCode: c.pincode || "",
            country: "",
          },
          notifications: c.notificationPreferences
            ? {
              whatsapp: !!c.notificationPreferences.promotionalMessages, // pick any mapping you want
              emailUpdates: !!c.notificationPreferences.orderUpdates,
            }
            : { whatsapp: false, emailUpdates: false },
          _isActiveLocal: c.isActive,
        };
      }),
    [apiCustomers]
  );

  // ====== Local UI state (filters, pagination, selection, menus, feedback) ======
  const [view, setView] = React.useState<ViewMode>("list");
  const [selected, setSelected] = React.useState<UserRow | null>(null);

  const methodOptions = React.useMemo(() => {
    const vals = new Set<string>();
    users.forEach((u) => u.method && vals.add(u.method));
    return Array.from(vals);
  }, [users]);

  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<
    "All Status" | StatusType
  >("All Status");
  const [methodFilter, setMethodFilter] = React.useState("All Methods");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [checked, setChecked] = React.useState<Record<string, boolean>>({});
  const [snack, setSnack] = React.useState<{
    open: boolean;
    msg: string;
    type: "success" | "info" | "error";
  }>({ open: false, msg: "", type: "success" });

  // Row menu
  const [menuAnchor, setMenuAnchor] = React.useState<null | HTMLElement>(null);
  const [menuRow, setMenuRow] = React.useState<UserRow | null>(null);
  const openMenu = Boolean(menuAnchor);

  // ====== Filtering & paging ======
  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      const matchText =
        !q ||
        [u.id, u.name, u.email, u.phone]
          .filter(Boolean)
          .some((v) => v!.toLowerCase().includes(q));
      const matchStatus =
        statusFilter === "All Status" ? true : u.status === statusFilter;
      const matchMethod =
        methodFilter === "All Methods" ? true : (u.method || "") === methodFilter;
      return matchText && matchStatus && matchMethod;
    });
  }, [users, search, statusFilter, methodFilter]);

  const paged = React.useMemo(
    () => filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filtered, page, rowsPerPage]
  );

  const allOnPageChecked = paged.length > 0 && paged.every((r) => checked[r.id]);
  const someOnPageChecked =
    paged.some((r) => checked[r.id]) && !allOnPageChecked;

  const handleToggleAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = { ...checked };
    paged.forEach((r) => (next[r.id] = e.target.checked));
    setChecked(next);
  };
  const handleToggleRow = (id: string) =>
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));

  // ====== Edit popup state ======
  const [editOpen, setEditOpen] = React.useState(false);
  const [editModel, setEditModel] = React.useState<UserRow | null>(null);

  const openEdit = (row: UserRow) => {
    // deep-ish clone for safe editing
    setEditModel({
      ...row,
      address: { ...(row.address || {}) },
      loyalty: { ...(row.loyalty || { enrolled: false, initialPoints: 0 }) },
      notifications: {
        ...(row.notifications || { whatsapp: false, emailUpdates: false }),
      },
    });
    setEditOpen(true);
  };

  // ====== Actions ======
  const handleDelete = async (row: UserRow) => {
    try {
      await deleteCustomer(row.id).unwrap();
      setSnack({ open: true, msg: "User deleted", type: "info" });
    } catch {
      setSnack({ open: true, msg: "Failed to delete user", type: "error" });
    }
  };

  // Frontend-only toggle active/inactive (no backend)
  const toggleActiveLocal = (row: UserRow) => {
    const nextActive = !(row._isActiveLocal ?? row.status === "Active");
    const nextStatus: StatusType = nextActive ? "Active" : "Inactive";
    setEditModel((s) => (s?.id === row.id ? { ...s, status: nextStatus, _isActiveLocal: nextActive } : s));
    setSnack({ open: true, msg: `Marked as ${nextStatus}`, type: "success" });
  };

  const saveEdit = async () => {
    if (!editModel) return;

    // Build PATCH body for backend fields only
    const body = {
      name: editModel.name,
      email: editModel.email,
      phone: editModel.phone,
      gender: (editModel.gender || "").toString().toLowerCase() || undefined,
      address: editModel.address?.street || "",
      state: editModel.address?.state || "",
      pincode: editModel.address?.postalCode || "",
      // NOTE: isActive is NOT sent (frontend-only toggle per your instruction)
      notificationPreferences: undefined as
        | {
          orderUpdates?: boolean;
          loyaltyRewards?: boolean;
          promotionalMessages?: boolean;
        }
        | undefined,
    };
console.log(editModel.id,'editModel.id',editModel);

    try {
      // Call API to persist editable backend fields (excluding local-only status)
      await updateCustomer({
        customerID: editModel.id,
        data: body,
      }).unwrap();

      setSnack({ open: true, msg: "Changes saved", type: "success" });
      setEditOpen(false);
      setEditModel(null);
      // RTK invalidates "Customers" LIST tag in the slice → grid refetches fresh data
    } catch (e) {
      setSnack({ open: true, msg: "Failed to save", type: "error" });
    }
  };

  // ====== Create view state (kept for parity; still navigate to your create page) ======
  const [createModel, setCreateModel] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "Male" as UserRow["gender"],
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    loyalty: true,
    loyaltyPoints: 0,
    notifyWhatsapp: true,
    notifyEmail: true,
    method: "WhatsApp",
  });

  // ====== UI pieces ======
  const ListHeader = (
    <Stack direction="row" justifyContent="space-between" sx={{ mt: 2 }}>
      <Box>
        <Typography sx={{ fontSize: 28, fontWeight: 800 }}>
          Customer Management
        </Typography>
        <Typography sx={{ fontSize: 14, color: "#6B7280" }}>
          Manage and track all your customers in one place
        </Typography>
      </Box>

      <Stack direction="row" spacing={1.5}>
        <Button
          variant="outlined"
          startIcon={<CloudUploadOutlinedIcon />}
          sx={{
            borderRadius: 1.5,
            fontSize: 12,
            padding: "1px 6px",
            minHeight: 20,
            lineHeight: 1,
            height: 40,
            fontWeight: "600",
          }}
          onClick={() => navigate("/customer/bulk/create")}
        >
          Bulk Upload
        </Button>
        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          sx={{
            borderRadius: 1.5,
           fontWeight: "600",
            fontSize: 12,
            padding: "1px 6px",
            minHeight: 20,
            lineHeight: 1,
            height: 40
          }}
          onClick={() => navigate("/customer/create")}
        >
          Add New User
        </Button>
      </Stack>
    </Stack>
  );

  const ListFilters = (
    <Paper sx={{ mt: 3, p: 2, borderRadius: 3 }}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        <TextField
         size="small"
          fullWidth
          placeholder="Search by customer ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon />
              </InputAdornment>
            ),
          }}
        />

        <FormControl fullWidth>
          <Select
           size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <MenuItem value="All Status">All Status</MenuItem>
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Pending Enrollment">Pending Enrollment</MenuItem>
            <MenuItem value="Inactive">Inactive</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <Select
           size="small"
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
          >
            <MenuItem value="All Methods">All Methods</MenuItem>
            {methodOptions.map((m) => (
              <MenuItem key={m} value={m}>
                {m}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
    </Paper>
  );

  const ListTable = (
    <TableContainer
      component={Paper}
      sx={{
        mt: 3,
        borderRadius: 3,
        maxHeight: { xs: 420, md: 560 }, // ✅ keeps footer visible
        overflow: "auto",
      }}
    >
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                indeterminate={someOnPageChecked}
                checked={allOnPageChecked}
                onChange={handleToggleAll}
              />
            </TableCell>
            <TableCell>Customer ID</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Enrollment Date</TableCell>
            <TableCell>Last Active</TableCell>
            <TableCell align="right">Action</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {paged.map((row) => (
            <TableRow key={row.id} hover>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={!!checked[row.id]}
                  onChange={() => handleToggleRow(row.id)}
                />
              </TableCell>
              <TableCell>{row.id}</TableCell>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.email}</TableCell>
              <TableCell>{row.phone}</TableCell>
              <TableCell>
                <StatusChip status={row.status} />
              </TableCell>
              <TableCell>{row.enrollmentDate}</TableCell>
              <TableCell>{row.lastActive}</TableCell>
              <TableCell align="right">
                <IconButton
                  onClick={(e) => {
                    setMenuAnchor(e.currentTarget);
                    setMenuRow(row);
                  }}
                >
                  <MoreVertRoundedIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Divider />

      <TablePagination
        component="div"
        count={filtered.length}
        page={page}
        onPageChange={(_, p) => setPage(p)}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[10, 25, 50]}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(Number(e.target.value));
          setPage(0);
        }}
      />
    </TableContainer>
  );

  const EnrollmentStepsCard = (
    <Paper
      sx={{
        borderRadius: 2,
        p: 2,
        mb: 2,
        border: "1px solid #E5E7EB",
        bgcolor: "#F9FAFB",
      }}
    >
      <Typography sx={{ fontWeight: 700, mb: 1.5 }}>
        Enrollment Process:
      </Typography>
      <Stack spacing={1.25}>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Chip size="small" label="Step 1" />
          <Typography sx={{ fontSize: 14, color: "#374151" }}>
            User will be created with <b>"Pending Enrollment"</b> status
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Chip size="small" label="Step 2" />
          <Typography sx={{ fontSize: 14, color: "#374151" }}>
            Enrollment link sent via <b>WhatsApp</b> to user's phone
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Chip size="small" label="Step 3" />
          <Typography sx={{ fontSize: 14, color: "#374151" }}>
            Status changes to <b>"Active"</b> once user accepts enrollment
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  );

  const CreateForm = (
    <Container maxWidth="md" sx={{ pt: 2, pb: 6 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <IconButton onClick={() => setView("list")} sx={{ mr: 0.5 }}>
          <ArrowBackRoundedIcon />
        </IconButton>
        <Breadcrumbs sx={{ color: "#6B7280", fontSize: 14 }}>
          <Link underline="hover" color="inherit" onClick={() => setView("list")}>
            Customer Management
          </Link>
          <Typography>Add New User</Typography>
        </Breadcrumbs>
      </Stack>

      <Typography sx={{ fontSize: 24, fontWeight: 800, mb: 2 }}>
        Add New User
      </Typography>

      {EnrollmentStepsCard}

      {/* (form fields kept as-is — this screen still navigates to your dedicated /customer/create) */}
    </Container>
  );

  const DetailsView = selected && (
    <Container maxWidth="md" sx={{ pt: 2, pb: 6 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <IconButton
          onClick={() => {
            setView("list");
            setSelected(null);
          }}
          sx={{ mr: 0.5 }}
        >
          <ArrowBackRoundedIcon />
        </IconButton>
        <Breadcrumbs sx={{ color: "#6B7280", fontSize: 14 }}>
          <Link underline="hover" color="inherit" onClick={() => setView("list")}>
            Customer Management
          </Link>
          <Typography>View User</Typography>
        </Breadcrumbs>
      </Stack>

      <Typography sx={{ fontSize: 24, fontWeight: 800, mb: 2 }}>
        {selected.name}
      </Typography>

      <Paper sx={{ p: 2.5, borderRadius: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid>
            <Typography variant="body2" color="text.secondary">
              Customer ID
            </Typography>
            <Typography fontWeight={700}>{selected.id}</Typography>
          </Grid>
          <Grid>
            <Typography variant="body2" color="text.secondary">
              Status
            </Typography>
            <StatusChip status={selected.status} />
          </Grid>

          <Grid>
            <Typography variant="body2" color="text.secondary">
              Email
            </Typography>
            <Typography>{selected.email}</Typography>
          </Grid>
          <Grid>
            <Typography variant="body2" color="text.secondary">
              Phone
            </Typography>
            <Typography>{selected.phone}</Typography>
          </Grid>

          <Grid>
            <Typography variant="body2" color="text.secondary">
              Enrollment Date
            </Typography>
            <Typography>{selected.enrollmentDate}</Typography>
          </Grid>
          <Grid>
            <Typography variant="body2" color="text.secondary">
              Last Active
            </Typography>
            <Typography>{selected.lastActive}</Typography>
          </Grid>

          <Grid>
            <Divider sx={{ my: 1 }} />
          </Grid>

          <Grid>
            <Typography variant="body2" color="text.secondary">
              Gender
            </Typography>
            <Typography>{selected.gender || "-"}</Typography>
          </Grid>
          <Grid>
            <Typography variant="body2" color="text.secondary">
              Preferred Method
            </Typography>
            <Typography>{selected.method || "-"}</Typography>
          </Grid>

          <Grid>
            <Typography variant="body2" color="text.secondary">
              Address
            </Typography>
            <Typography>
              {selected.address?.street || "-"}
              {selected.address?.city ? `, ${selected.address.city}` : ""}
              {selected.address?.state ? `, ${selected.address.state}` : ""}
              {selected.address?.postalCode ? `, ${selected.address.postalCode}` : ""}
              {selected.address?.country ? `, ${selected.address.country}` : ""}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Stack direction="row" spacing={1.5}>
        <Button
          variant="contained"
          onClick={() => openEdit(selected)}
          sx={{ borderRadius: 2, fontWeight: 600 }}
        >
          Edit User
        </Button>
        <Button
          variant="outlined"
          color="error"
          onClick={() => {
            handleDelete(selected);
            setView("list");
            setSelected(null);
          }}
        >
          Delete
        </Button>
      </Stack>
    </Container>
  );

  // ====== Render ======
  if (isLoading) return <Typography sx={{ p: 4 }}>Loading…</Typography>;
  if (isError)
    return (
      <Container sx={{ py: 6 }}>
        <Typography color="error" fontWeight={700}>
          Failed to load customers
        </Typography>
        {/* <Typography variant="body2">{JSON.stringify(error)}</Typography> */}
      </Container>
    );

  return (
    <Box sx={{ bgcolor: "#FAFAFB", minHeight: "100vh" }}>
      {view === "list" ? (
        <Container maxWidth="lg" sx={{ pt: 4, pb: 6 }}>
          <Breadcrumbs sx={{ color: "#6B7280", fontSize: 14 }}>
            <Link underline="hover" color="inherit">
              Dashboard
            </Link>
            <Typography>Customer Management</Typography>
          </Breadcrumbs>

          {ListHeader}
          {ListFilters}
          {ListTable}
        </Container>
      ) : view === "create" ? (
        CreateForm
      ) : (
        DetailsView
      )}

      {/* Row Actions Menu — stays inside the list view */}
      <Menu
        anchorEl={menuAnchor}
        open={openMenu}
        onClose={() => setMenuAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem
          onClick={() => {
            if (menuRow) {
              setSelected(menuRow);
              setView("details");
            }
            setMenuAnchor(null);
          }}
        >
          <ListItemIcon>
            <VisibilityRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            if (menuRow) openEdit(menuRow);
            setMenuAnchor(null);
          }}
        >
          <ListItemIcon>
            <EditRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            if (menuRow) handleDelete(menuRow);
            setMenuAnchor(null);
          }}
        >
          <ListItemIcon>
            <DeleteOutlineRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Edit Modal — NO navigation; saves via PATCH and refetches list */}
      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ pb: 0 }}>
          Edit User Profile
          <Typography sx={{ fontSize: 12, color: "#6B7280", mt: 0.5 }}>
            Update user information. Click save when you're done.
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          {editModel && (
            <Stack spacing={2}>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField
                  fullWidth
                  label="First Name *"
                  value={editModel.name.split(" ")[0] || ""}
                  onChange={(e) =>
                    setEditModel((s) =>
                      s
                        ? {
                          ...s,
                          name: `${e.target.value} ${s.name
                            .split(" ")
                            .slice(1)
                            .join(" ")}`.trim(),
                        }
                        : s
                    )
                  }
                />
                <TextField
                  fullWidth
                  label="Last Name *"
                  value={editModel.name.split(" ").slice(1).join(" ") || ""}
                  onChange={(e) =>
                    setEditModel((s) =>
                      s
                        ? {
                          ...s,
                          name: `${s.name.split(" ")[0] || ""} ${e.target.value
                            }`.trim(),
                        }
                        : s
                    )
                  }
                />
              </Stack>

              <TextField
                fullWidth
                label="Email *"
                value={editModel.email}
                onChange={(e) =>
                  setEditModel((s) => (s ? { ...s, email: e.target.value } : s))
                }
              />

              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField
                  fullWidth
                  label="Phone *"
                  value={editModel.phone}
                  onChange={(e) =>
                    setEditModel((s) =>
                      s ? { ...s, phone: e.target.value } : s
                    )
                  }
                />

                <FormControl fullWidth>
                  <Typography sx={{ fontSize: 12, color: "#6B7280", mb: 0.5 }}>
                    Gender
                  </Typography>
                  <Select
                    value={editModel.gender || "Male"}
                    onChange={(e: SelectChangeEvent) =>
                      setEditModel((s) =>
                        s ? { ...s, gender: e.target.value as any } : s
                      )
                    }
                  >
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                    <MenuItem value="Prefer not to say">Prefer not to say</MenuItem>
                  </Select>
                </FormControl>
              </Stack>

              <Typography sx={{ fontWeight: 700, mt: 1 }}>Address</Typography>
              <TextField
                fullWidth
                label="Street Address"
                value={editModel.address?.street || ""}
                onChange={(e) =>
                  setEditModel((s) =>
                    s
                      ? {
                        ...s,
                        address: {
                          ...(s.address || {}),
                          street: e.target.value,
                        },
                      }
                      : s
                  )
                }
              />
              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField
                  fullWidth
                  label="City"
                  value={editModel.address?.city || ""}
                  onChange={(e) =>
                    setEditModel((s) =>
                      s
                        ? {
                          ...s,
                          address: { ...(s.address || {}), city: e.target.value },
                        }
                        : s
                    )
                  }
                />
                <TextField
                  fullWidth
                  label="State"
                  value={editModel.address?.state || ""}
                  onChange={(e) =>
                    setEditModel((s) =>
                      s
                        ? {
                          ...s,
                          address: { ...(s.address || {}), state: e.target.value },
                        }
                        : s
                    )
                  }
                />
              </Stack>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField
                  fullWidth
                  label="Postal Code"
                  value={editModel.address?.postalCode || ""}
                  onChange={(e) =>
                    setEditModel((s) =>
                      s
                        ? {
                          ...s,
                          address: {
                            ...(s.address || {}),
                            postalCode: e.target.value,
                          },
                        }
                        : s
                    )
                  }
                />
                <TextField
                  fullWidth
                  label="Country"
                  value={editModel.address?.country || ""}
                  onChange={(e) =>
                    setEditModel((s) =>
                      s
                        ? {
                          ...s,
                          address: {
                            ...(s.address || {}),
                            country: e.target.value,
                          },
                        }
                        : s
                    )
                  }
                />
              </Stack>

              {/* Frontend-only Active/Inactive toggle */}
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                <Typography sx={{ flexGrow: 1 }}>Active (frontend only)</Typography>
                <Switch
                  checked={!!editModel._isActiveLocal || editModel.status === "Active"}
                  onChange={() => toggleActiveLocal(editModel)}
                />
              </Stack>
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button variant="outlined" onClick={() => setEditOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={saveEdit}
            disabled={isSaving}
            sx={{ fontWeight: 600 }}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={2500}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          severity={snack.type}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
