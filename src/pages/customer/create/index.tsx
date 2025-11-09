import React from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Breadcrumbs,
  Link,
  Stack,
  RadioGroup,
  FormControlLabel,
  Radio,
  Switch,
  Button,
  Chip,
  InputAdornment,
} from "@mui/material";

import { useCreateCustomerMutation } from "../../../store/api/customers/customer.api";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LocalPhoneOutlinedIcon from "@mui/icons-material/LocalPhoneOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";

export default function AddNewUserForm({ onBack }: any) {
  const navigate = useNavigate();
  const [createCustomer, { isLoading }] = useCreateCustomerMutation();

  const [form, setForm] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "Male",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    loyalty: true,
    loyaltyPoints: 0,
    notifyWhatsapp: true,
    notifyEmail: true,
  });

  const update = (field: string, value: any) =>
    setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async () => {
    const payload = {
      name: `${form.firstName} ${form.lastName}`.trim(),
      email: form.email,
      phone: form.phone,
      gender: form.gender.toLowerCase(),
      address: form.street,
      state: form.state,
      pincode: form.postalCode,
      notificationPreferences: {
        orderUpdates: form.notifyWhatsapp,
        loyaltyRewards: form.loyalty,
        promotionalMessages: form.notifyEmail,
      },
    };

    const userId = "264553f1-3ca9-4cc1-bb87-c0972b691e19";

    try {
      await createCustomer({ data: payload, userId }).unwrap();

      Swal.fire({
        icon: "success",
        title: "Customer Created Successfully",
        text: "Enrollment message has been sent!",
        confirmButtonColor: "#16A34A",
      }).then(() => {
        navigate("/customer");
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Failed to Create Customer",
        text: "Please try again.",
        confirmButtonColor: "#dc2626",
      });
    }
  };

  return (
    <>
      <Box
        sx={{
          height: "100%",
          overflowY: "auto",
          overflowX: "hidden",
          bgcolor: "#FAFAFB",
          py: 2,
        }}
      >
        <Container maxWidth="md" sx={{ pb: 4 }}>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
            <ArrowBackRoundedIcon sx={{ cursor: "pointer" }} onClick={onBack} />
            <Breadcrumbs sx={{ fontSize: 14, color: "#6B7280" }}>
              <Link underline="hover" onClick={onBack} sx={{ cursor: "pointer" }}>
                Customer Management
              </Link>
              <Typography>Add New User</Typography>
            </Breadcrumbs>
          </Stack>

          <Typography sx={{ fontSize: 28, fontWeight: 800, mb: 1 }}>
            Add New User
          </Typography>
          <Typography sx={{ color: "#6B7280", mb: 3, fontSize: 14 }}>
            Create a new user account and send them an enrollment invitation via WhatsApp
          </Typography>

          <Paper
            sx={{
              p: 2.5,
              borderRadius: 2,
              border: "1px solid #D9E6FF",
              background: "#E8F2FF",
              mb: 3,
            }}
          >
            <Typography sx={{ fontWeight: 700, mb: 1 }}>Enrollment Process:</Typography>

            <Stack spacing={1.2}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip label="Step 1" size="small" />
                <Typography sx={{ fontSize: 14 }}>
                  User will be created with <b>"Pending Enrollment"</b> status
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip label="Step 2" size="small" />
                <Typography sx={{ fontSize: 14 }}>
                  Enrollment link sent via WhatsApp to user's phone
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip label="Step 3" size="small" />
                <Typography sx={{ fontSize: 14 }}>
                  Status changes to <b>"Active"</b> once user accepts enrollment
                </Typography>
              </Stack>
            </Stack>
          </Paper>

          <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
            <Typography sx={{ fontWeight: 700 }}>Basic Information</Typography>
            <Typography sx={{ fontSize: 13, color: "#B45309", mb: 2 }}>
              Enter the user's personal details
            </Typography>

            <Stack spacing={2}>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField
                  fullWidth
                  label="First Name *"
                  variant="filled"
                  value={form.firstName}
                  onChange={(e) => update("firstName", e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutlineRoundedIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ bgcolor: "#FFF8EE", borderRadius: 2 }}
                />

                <TextField
                  fullWidth
                  label="Last Name *"
                  variant="filled"
                  value={form.lastName}
                  onChange={(e) => update("lastName", e.target.value)}
                  sx={{ bgcolor: "#FFF8EE", borderRadius: 2 }}
                />
              </Stack>

              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField
                  fullWidth
                  label="Email *"
                  variant="filled"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlinedIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ bgcolor: "#FFF8EE", borderRadius: 2 }}
                />

                <TextField
                  fullWidth
                  label="Phone Number *"
                  variant="filled"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocalPhoneOutlinedIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ bgcolor: "#FFF8EE", borderRadius: 2 }}
                />
              </Stack>

              <RadioGroup
                row
                value={form.gender}
                onChange={(e) => update("gender", e.target.value)}
              >
                <FormControlLabel value="Male" control={<Radio />} label="Male" />
                <FormControlLabel value="Female" control={<Radio />} label="Female" />
                <FormControlLabel value="Other" control={<Radio />} label="Other" />
              </RadioGroup>
            </Stack>
          </Paper>

          <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
            <Typography sx={{ fontWeight: 700 }}>Address Information</Typography>
            <Typography sx={{ fontSize: 13, color: "#B45309", mb: 2 }}>
              Enter the user's address details
            </Typography>

            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Street Address"
                variant="filled"
                value={form.street}
                onChange={(e) => update("street", e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOnOutlinedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{ bgcolor: "#FFF8EE", borderRadius: 2 }}
              />

              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField
                  fullWidth
                  label="City"
                  variant="filled"
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                  sx={{ bgcolor: "#FFF8EE", borderRadius: 2 }}
                />
                <TextField
                  fullWidth
                  label="State/Province"
                  variant="filled"
                  value={form.state}
                  onChange={(e) => update("state", e.target.value)}
                  sx={{ bgcolor: "#FFF8EE", borderRadius: 2 }}
                />
              </Stack>

              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField
                  fullWidth
                  label="Postal Code"
                  variant="filled"
                  value={form.postalCode}
                  onChange={(e) => update("postalCode", e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FlagOutlinedIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ bgcolor: "#FFF8EE", borderRadius: 2 }}
                />

                <TextField
                  fullWidth
                  label="Country"
                  variant="filled"
                  value={form.country}
                  onChange={(e) => update("country", e.target.value)}
                  sx={{ bgcolor: "#FFF8EE", borderRadius: 2 }}
                />
              </Stack>
            </Stack>
          </Paper>

          <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
            <Typography sx={{ fontWeight: 700 }}>Notifications</Typography>
            <Typography sx={{ fontSize: 13, color: "#B45309", mb: 2 }}>
              Configure communication preferences
            </Typography>

            <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography>Receive WhatsApp Messages</Typography>
              <Switch
                checked={form.notifyWhatsapp}
                onChange={(e) => update("notifyWhatsapp", e.target.checked)}
                sx={{ "& .MuiSwitch-thumb": { bgcolor: "#D97706" } }}
              />
            </Stack>

            <Stack direction="row" justifyContent="space-between">
              <Typography>Receive Email Updates</Typography>
              <Switch
                checked={form.notifyEmail}
                onChange={(e) => update("notifyEmail", e.target.checked)}
                sx={{ "& .MuiSwitch-thumb": { bgcolor: "#D97706" } }}
              />
            </Stack>
          </Paper>

          <Stack direction="row" spacing={2} sx={{ mt: 2, pb: 4 }}>
            <Button
              variant="contained"
              disabled={isLoading}
              sx={{
                borderRadius: 3,
                bgcolor: "#16A34A",
                fontWeight: 600,
                px: 3,
                "&:hover": { bgcolor: "#148C42" },
              }}
              onClick={handleSubmit}
            >
              {isLoading ? "Sending..." : "Send Enrollment Message"}
            </Button>

            <Button variant="outlined" sx={{ borderRadius: 3 }} onClick={onBack}>
              Cancel
            </Button>
          </Stack>
        </Container>
      </Box>
    </>
  );
}
