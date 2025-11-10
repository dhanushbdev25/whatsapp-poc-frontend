import React, { useEffect, useState, useMemo } from "react";
import {
    Box,
    Grid,
    Paper,
    Typography,
    Select,
    MenuItem,
    Checkbox,
    FormControlLabel,
    RadioGroup,
    Radio,
    Button,
    Stack,
    Chip,
    Collapse,
    Alert,
    TextField,
    CircularProgress,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

interface TemplateItem {
    label: string;
    value: string;
    data: {
        body: string;
        image?: string;
        status?: string;
    };
}

const API_URL = `${process.env.API_BASE_URL}webhook/fetchTemplates`;
const FACEBOOK_API_URL = "https://graph.facebook.com/v24.0/918090124709683/messages";
const FACEBOOK_TOKEN = "EAA1neE2bXvgBPrnFkwuArBan1vq6pXvGRqdTkzkoXQFRKm9QMhebTUfeM6AnZBGifCLAbNzJ872bZADMIrqVgrIb2TfLj3BnClQ3wXFDSn51dMxzLDNvD1rw54cHo90dX260g6oaNpaNE7JVp8QdAF8Ib5MZBqUTVqHABCXY3WLfe9Bha99a8lBs2jU5FouZCQZDZD";

const DUMMY_DATA = {
    customers: [
        { name: "Chukwuemeka Okonkwo", orderNo: "NG-2024-1001", item: "Hair Shampoo", amount: "₦45,000", expected: "Today", status: "Pending" },
        { name: "Aisha Bello", orderNo: "NG-2024-1002", item: "Hair Serum", amount: "₦32,500", expected: "Yesterday", status: "Approved" },
        { name: "Oluwaseun Adebayo", orderNo: "NG-2024-1003", item: "Hair Conditioner", amount: "₦78,200", expected: "Tomorrow", status: "Pending" },
        { name: "Ngozi Eze", orderNo: "NG-2024-1004", item: "Hair Oil", amount: "₦25,000", expected: "Today", status: "Rejected" },
        { name: "Ibrahim Suleiman", orderNo: "NG-2024-1005", item: "Hair Mask", amount: "₦56,800", expected: "Tomorrow", status: "Approved" },
    ]
};

const STATUS_OPTIONS = ["Pending", "Approved", "Rejected"];

export default function SendWhatsAppMessage() {
    const navigate = useNavigate();

    const [templates, setTemplates] = useState<TemplateItem[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState("");
    const [includeImage, setIncludeImage] = useState(false);
    const [scheduleLater, setScheduleLater] = useState(false);
    const [recipientMode, setRecipientMode] = useState("all");
    const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        axios.get(API_URL)
            .then((res) => {
                if (res.data.success) {
                    const formattedTemplates = res.data.data.map((t: any) => ({
                        ...t,
                        label: t.label.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
                    }));
                    setTemplates(formattedTemplates);
                }
            })
            .catch(() => {
                setTemplates([
                    {
                        label: "Order Confirmation",
                        value: "order_confirm",
                        data: { body: "Dear {{1}},\n\nYour order {{2}} for {{3}} has been confirmed.\n\nThank you!" }
                    },
                    {
                        label: "Payment Reminder",
                        value: "payment",
                        data: { body: "Hi {{1}},\n\nReminder: Order {{2}} - Amount {{3}} is pending." }
                    }
                ]);
            });
    }, []);

    const tpl = useMemo(
        () => templates.find((t) => t.value === selectedTemplate),
        [templates, selectedTemplate]
    );

    const getPreviewMessage = () => {
        if (!tpl?.data.body) return "No message content";
        const sample = DUMMY_DATA.customers[0];
        return tpl.data.body
            .replace(/\{\{1\}\}/g, sample.name)
            .replace(/\{\{2\}\}/g, sample.orderNo)
            .replace(/\{\{3\}\}/g, sample.item)
            .replace(/\{\{4\}\}/g, sample.amount)
            .replace(/\{\{5\}\}/g, sample.expected);
    };

    const getFilteredCustomers = () => {
        if (recipientMode === "all") {
            return DUMMY_DATA.customers;
        } else if (recipientMode === "filtered") {
            if (selectedStatus.length === 0) return [];
            return DUMMY_DATA.customers.filter(c => selectedStatus.includes(c.status));
        } else if (recipientMode === "specific") {
            return DUMMY_DATA.customers.filter(c => selectedUsers.includes(c.orderNo));
        }
        return [];
    };

    const recipientCount = recipientMode === "onboard" ? (phoneNumber ? 1 : 0) : getFilteredCustomers().length;

    const handleStatusToggle = (status: string) => {
        setSelectedStatus(prev =>
            prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
        );
    };

    const handleUserToggle = (orderNo: string) => {
        setSelectedUsers(prev =>
            prev.includes(orderNo) ? prev.filter(u => u !== orderNo) : [...prev, orderNo]
        );
    };

    const handleSendMessage = () => {
        Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: `Message sent successfully to ${recipientCount} recipient${recipientCount !== 1 ? 's' : ''}!`,
            showConfirmButton: false,
            timer: 4000,
        }).then(() => {
            navigate('/view/message/template');
        });
        setShowSuccess(true);
        setSuccessMessage(`Message sent successfully to ${recipientCount} recipient${recipientCount !== 1 ? 's' : ''}!`);
        setTimeout(() => setShowSuccess(false), 4000);
    };

    const handleOnboardUser = async () => {
        if (!phoneNumber) {
            setError("Please enter a phone number");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const response = await axios.post(
                FACEBOOK_API_URL,
                {
                    messaging_product: "whatsapp",
                    to: phoneNumber,
                    type: "template",
                    template: {
                        name: "enrolment_template",
                        language: {
                            code: "en"
                        },
                        components: [
                            {
                                type: "header",
                                parameters: [
                                    {
                                        type: "image",
                                        image: {
                                            link: "https://mtbsapoc.blob.core.windows.net/whatsapppoccontainer/lush-logo.png"
                                        }
                                    }
                                ]
                            },
                            {
                                type: "button",
                                sub_type: "flow",
                                index: "0",
                                parameters: [
                                    {
                                        type: "payload",
                                        payload: "{\"flow_token\":\"0000\"}"
                                    }
                                ]
                            }
                        ]
                    }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${FACEBOOK_TOKEN}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.messages && response.data.messages[0].message_status === "accepted") {
                setShowSuccess(true);
                setSuccessMessage(`Onboarding message sent successfully to ${phoneNumber}!`);
                setPhoneNumber("");
                // setTimeout(() => setShowSuccess(false), 4000);
                // navigate('/view/message/template');
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: `Onboarding message sent successfully to ${phoneNumber}!`,
                    showConfirmButton: false,
                    timer: 2000,  // Display the message for 2 seconds
                }).then(() => {
                    setShowSuccess(false); // Hide success message
                    navigate('/view/message/template'); // Navigate after the popup is closed
                });
            }
        } catch (err: any) {
            setError(err.response?.data?.error?.message || "Failed to send onboarding message. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box sx={{ p: 1.5, fontFamily: "Inter, sans-serif", maxWidth: 1600, mx: "auto" }}>
            <Typography sx={{ fontWeight: 600, fontSize: 18, mb: 1.5 }}>
                Send WhatsApp Message
            </Typography>

            <Collapse in={showSuccess}>
                <Alert severity="success" sx={{ mb: 2 }} onClose={() => setShowSuccess(false)}>
                    {successMessage}
                </Alert>
            </Collapse>

            <Collapse in={!!error}>
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
                    {error}
                </Alert>
            </Collapse>

            <Grid container spacing={2}>

                {/* LEFT COLUMN */}
                <Grid size={{ xs: 12, md: 7 }}>

                    <Paper sx={{ p: 1.8, borderRadius: 1.5, border: "1px solid #E5E7EB", mb: 1.5 }}>
                        <Typography sx={{ fontWeight: 600, fontSize: 13, mb: 0.5 }}>Select Template</Typography>
                        <Typography sx={{ fontSize: 11, color: "#6B7280", mb: 1 }}>
                            Choose a pre-approved template
                        </Typography>

                        <Select
                            value={selectedTemplate}
                            onChange={(e) => setSelectedTemplate(e.target.value)}
                            displayEmpty
                            fullWidth
                            size="small"
                            disabled={recipientMode === "onboard"}
                            sx={{
                                borderRadius: 1,
                                background: "#FFF7ED",
                                mb: 1,
                                height: 32,
                                fontSize: 12,
                                "& .MuiOutlinedInput-notchedOutline": { borderColor: "#F2E8DA" }
                            }}
                        >
                            <MenuItem value="" disabled sx={{ fontSize: 12 }}>Select a template...</MenuItem>
                            {templates.map((t) => (
                                <MenuItem key={t.value} value={t.value} sx={{ fontSize: 12 }}>{t.label}</MenuItem>
                            ))}
                        </Select>

                        <FormControlLabel
                            control={
                                <Checkbox
                                    size="small"
                                    checked={includeImage}
                                    onChange={(e) => setIncludeImage(e.target.checked)}
                                    sx={{ py: 0 }}
                                />
                            }
                            label={<Typography sx={{ fontSize: 11 }}>Include promotional image</Typography>}
                            disabled={!tpl?.data.image || recipientMode === "onboard"}
                            sx={{ mb: 0.3 }}
                        />

                        <FormControlLabel
                            control={
                                <Checkbox
                                    size="small"
                                    checked={scheduleLater}
                                    onChange={(e) => setScheduleLater(e.target.checked)}
                                    sx={{ py: 0 }}
                                />
                            }
                            label={<Typography sx={{ fontSize: 11 }}>Schedule for later</Typography>}
                            disabled={recipientMode === "onboard"}
                            sx={{ mb: 0 }}
                        />
                    </Paper>

                    <Paper sx={{ p: 1.8, borderRadius: 1.5, border: "1px solid #E5E7EB" }}>
                        <Typography sx={{ fontWeight: 600, fontSize: 13, mb: 0.5 }}>Select Recipients</Typography>
                        <Typography sx={{ fontSize: 11, color: "#6B7280", mb: 1 }}>
                            Choose who will receive this message
                        </Typography>

                        <RadioGroup value={recipientMode} onChange={(e) => {
                            setRecipientMode(e.target.value);
                            setSelectedStatus([]);
                            setSelectedUsers([]);
                            setPhoneNumber("");
                            setError("");
                        }}>
                            <FormControlLabel
                                value="all"
                                control={<Radio size="small" sx={{ py: 0.3 }} />}
                                label={<Typography sx={{ fontSize: 11 }}>All users ({DUMMY_DATA.customers.length})</Typography>}
                                sx={{ mb: 0.3 }}
                            />
                            <FormControlLabel
                                value="filtered"
                                control={<Radio size="small" sx={{ py: 0.3 }} />}
                                label={<Typography sx={{ fontSize: 11 }}>Filtered by status</Typography>}
                                sx={{ mb: 0.3 }}
                            />
                            <FormControlLabel
                                value="specific"
                                control={<Radio size="small" sx={{ py: 0.3 }} />}
                                label={<Typography sx={{ fontSize: 11 }}>Specific users</Typography>}
                                sx={{ mb: 0.3 }}
                            />
                            <FormControlLabel
                                value="onboard"
                                control={<Radio size="small" sx={{ py: 0.3 }} />}
                                label={<Typography sx={{ fontSize: 11 }}>New onboard</Typography>}
                                sx={{ mb: 0 }}
                            />
                        </RadioGroup>

                        {/* Status Filter Section */}
                        <Collapse in={recipientMode === "filtered"}>
                            <Box sx={{ mt: 1.5, p: 1.2, background: "#F9FAFB", borderRadius: 1, border: "1px solid #E5E7EB" }}>
                                <Typography sx={{ fontSize: 11, fontWeight: 600, mb: 0.8 }}>Select Status:</Typography>
                                <Stack spacing={0.5}>
                                    {STATUS_OPTIONS.map((status) => {
                                        const count = DUMMY_DATA.customers.filter(c => c.status === status).length;
                                        return (
                                            <FormControlLabel
                                                key={status}
                                                control={
                                                    <Checkbox
                                                        size="small"
                                                        checked={selectedStatus.includes(status)}
                                                        onChange={() => handleStatusToggle(status)}
                                                        sx={{ py: 0.2 }}
                                                    />
                                                }
                                                label={
                                                    <Typography sx={{ fontSize: 11 }}>
                                                        {status} ({count})
                                                    </Typography>
                                                }
                                            />
                                        );
                                    })}
                                </Stack>

                                {selectedStatus.length > 0 && (
                                    <Box sx={{ mt: 1.2, pt: 1.2, borderTop: "1px solid #E5E7EB" }}>
                                        <Typography sx={{ fontSize: 10, fontWeight: 600, mb: 0.6, color: "#374151" }}>
                                            Users in selected status:
                                        </Typography>
                                        <Stack spacing={0.5}>
                                            {getFilteredCustomers().map((customer) => (
                                                <Box
                                                    key={customer.orderNo}
                                                    sx={{
                                                        p: 0.8,
                                                        background: "#fff",
                                                        borderRadius: 0.5,
                                                        border: "1px solid #E5E7EB",
                                                        fontSize: 10
                                                    }}
                                                >
                                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                        <Box>
                                                            <Typography sx={{ fontWeight: 600, fontSize: 10 }}>
                                                                {customer.name}
                                                            </Typography>
                                                            <Typography sx={{ fontSize: 9, color: "#6B7280" }}>
                                                                {customer.orderNo} • {customer.item}
                                                            </Typography>
                                                        </Box>
                                                        <Chip
                                                            label={customer.status}
                                                            size="small"
                                                            sx={{
                                                                fontSize: 9,
                                                                height: 18,
                                                                background: customer.status === "Approved" ? "#D1FAE5" :
                                                                    customer.status === "Pending" ? "#FEF3C7" : "#FEE2E2",
                                                                color: customer.status === "Approved" ? "#065F46" :
                                                                    customer.status === "Pending" ? "#92400E" : "#991B1B"
                                                            }}
                                                        />
                                                    </Stack>
                                                </Box>
                                            ))}
                                        </Stack>
                                    </Box>
                                )}
                            </Box>
                        </Collapse>

                        {/* Specific Users Section */}
                        <Collapse in={recipientMode === "specific"}>
                            <Box sx={{ mt: 1.5, p: 1.2, background: "#F9FAFB", borderRadius: 1, border: "1px solid #E5E7EB" }}>
                                <Typography sx={{ fontSize: 11, fontWeight: 600, mb: 0.8 }}>Select Users:</Typography>
                                <Stack spacing={0.5}>
                                    {DUMMY_DATA.customers.map((customer) => (
                                        <Box
                                            key={customer.orderNo}
                                            sx={{
                                                p: 0.8,
                                                background: selectedUsers.includes(customer.orderNo) ? "#EEF6FF" : "#fff",
                                                borderRadius: 0.5,
                                                border: selectedUsers.includes(customer.orderNo) ? "1px solid #3B82F6" : "1px solid #E5E7EB",
                                                cursor: "pointer",
                                                transition: "all 0.2s",
                                                "&:hover": { background: "#F9FAFB" }
                                            }}
                                            onClick={() => handleUserToggle(customer.orderNo)}
                                        >
                                            <Stack direction="row" spacing={0.8} alignItems="center">
                                                <Checkbox
                                                    size="small"
                                                    checked={selectedUsers.includes(customer.orderNo)}
                                                    sx={{ py: 0 }}
                                                />
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography sx={{ fontWeight: 600, fontSize: 10 }}>
                                                        {customer.name}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: 9, color: "#6B7280" }}>
                                                        {customer.orderNo} • {customer.item} • {customer.amount}
                                                    </Typography>
                                                </Box>
                                                <Chip
                                                    label={customer.status}
                                                    size="small"
                                                    sx={{
                                                        fontSize: 9,
                                                        height: 18,
                                                        background: customer.status === "Approved" ? "#D1FAE5" :
                                                            customer.status === "Pending" ? "#FEF3C7" : "#FEE2E2",
                                                        color: customer.status === "Approved" ? "#065F46" :
                                                            customer.status === "Pending" ? "#92400E" : "#991B1B"
                                                    }}
                                                />
                                            </Stack>
                                        </Box>
                                    ))}
                                </Stack>
                            </Box>
                        </Collapse>

                        {/* New Onboard Section */}
                        <Collapse in={recipientMode === "onboard"}>
                            <Box sx={{ mt: 1.5, p: 1.2, background: "#F9FAFB", borderRadius: 1, border: "1px solid #E5E7EB" }}>
                                <Typography sx={{ fontSize: 11, fontWeight: 600, mb: 0.8 }}>Enter Phone Number:</Typography>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="e.g., 8667608680"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            fontSize: 12,
                                            background: "#fff",
                                            borderRadius: 1
                                        }
                                    }}
                                    helperText={
                                        <Typography sx={{ fontSize: 10, color: "#6B7280", mt: 0.5 }}>
                                            Enter phone number without country code (e.g., 8034567890.)
                                        </Typography>
                                    }
                                />
                            </Box>
                        </Collapse>

                        <Box sx={{
                            mt: 1,
                            p: 1,
                            borderRadius: 1,
                            background: recipientCount > 0 ? "#EEF6FF" : "#FEE2E2",
                            color: recipientCount > 0 ? "#1D4ED8" : "#991B1B",
                            display: "flex",
                            gap: 0.8,
                            alignItems: "center"
                        }}>
                            <Chip
                                size="small"
                                label={recipientCount}
                                sx={{
                                    background: recipientCount > 0 ? "#DBEAFE" : "#FEE2E2",
                                    fontSize: 10,
                                    height: 18,
                                    minWidth: 24
                                }}
                            />
                            <Typography sx={{ fontSize: 11 }}>
                                {recipientCount > 0
                                    ? `recipient${recipientCount !== 1 ? 's' : ''} will receive this message`
                                    : recipientMode === "onboard" ? "Enter a phone number" : "No recipients selected"
                                }
                            </Typography>
                        </Box>

                        {recipientMode !== "onboard" && (
                            <Paper sx={{ mt: 1.2, p: 1, background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 1 }}>
                                <Typography sx={{ fontSize: 10, fontWeight: 600, mb: 0.5, color: "#374151" }}>
                                    Template Placeholders:
                                </Typography>
                                <Stack spacing={0.3}>
                                    <Typography sx={{ fontSize: 9.5, color: "#6B7280", lineHeight: 1.3 }}>
                                        <strong>{"{{1}}"}</strong> → Customer Name (e.g., {DUMMY_DATA.customers[0].name})
                                    </Typography>
                                    <Typography sx={{ fontSize: 9.5, color: "#6B7280", lineHeight: 1.3 }}>
                                        <strong>{"{{2}}"}</strong> → Order No (e.g., {DUMMY_DATA.customers[0].orderNo})
                                    </Typography>
                                    <Typography sx={{ fontSize: 9.5, color: "#6B7280", lineHeight: 1.3 }}>
                                        <strong>{"{{3}}"}</strong> → Item (e.g., {DUMMY_DATA.customers[0].item})
                                    </Typography>
                                    <Typography sx={{ fontSize: 9.5, color: "#6B7280", lineHeight: 1.3 }}>
                                        <strong>{"{{4}}"}</strong> → Amount (e.g., {DUMMY_DATA.customers[0].amount})
                                    </Typography>
                                    <Typography sx={{ fontSize: 9.5, color: "#6B7280", lineHeight: 1.3 }}>
                                        <strong>{"{{5}}"}</strong> → Expected (e.g., {DUMMY_DATA.customers[0].expected})
                                    </Typography>
                                </Stack>
                            </Paper>
                        )}
                    </Paper>
                </Grid>

                {/* RIGHT COLUMN */}
                <Grid size={{ xs: 12, md: 5 }}>

                    {recipientMode !== "onboard" && (
                        <Paper sx={{
                            p: 1.8,
                            borderRadius: 1.5,
                            border: "2px solid #C4EED0",
                            background: "#EBFFF4",
                            mb: 1.5
                        }}>
                            <Typography sx={{ fontWeight: 600, mb: 1, fontSize: 13 }}>
                                Message Preview
                            </Typography>

                            <Stack spacing={1}>
                                <Stack direction="row" spacing={0.8} alignItems="center">
                                    <Chip
                                        label="LA"
                                        sx={{ background: "#D1FADF", fontWeight: 600, fontSize: 10, height: 22, minWidth: 32 }}
                                    />
                                    <Box>
                                        <Typography sx={{ fontWeight: 600, fontSize: 11 }}>Lush & Addmie</Typography>
                                        <Typography sx={{ fontSize: 9.5, color: "#6B7280" }}>WhatsApp Business</Typography>
                                    </Box>
                                </Stack>

                                {includeImage && tpl?.data.image && (
                                    <Box
                                        component="img"
                                        src={tpl.data.image}
                                        sx={{ width: "100%", borderRadius: 1 }}
                                        alt="Preview"
                                    />
                                )}

                                <Box sx={{
                                    p: 1.2,
                                    background: "#fff",
                                    borderRadius: 1,
                                    border: "1px solid #D1D5DB",
                                    whiteSpace: "pre-wrap",
                                    fontSize: 11,
                                    minHeight: 70,
                                    lineHeight: 1.4
                                }}>
                                    {getPreviewMessage()}
                                </Box>
                            </Stack>
                        </Paper>
                    )}

                    {recipientMode === "onboard" && (
                        <Paper sx={{
                            p: 1.8,
                            borderRadius: 1.5,
                            border: "2px solid #DBEAFE",
                            background: "#EFF6FF",
                            mb: 1.5
                        }}>
                            <Typography sx={{ fontWeight: 600, mb: 1, fontSize: 13 }}>
                                Onboarding Flow
                            </Typography>
                            <Typography sx={{ fontSize: 11, color: "#6B7280", mb: 1.5, lineHeight: 1.5 }}>
                                This will send an enrollment template to the specified phone number via WhatsApp Business API.
                            </Typography>
                            <Box sx={{
                                p: 1.2,
                                background: "#fff",
                                borderRadius: 1,
                                border: "1px solid #D1D5DB"
                            }}>
                                <Typography sx={{ fontSize: 10, fontWeight: 600, mb: 0.5 }}>
                                    Template: Enrolment Template
                                </Typography>
                                <Typography sx={{ fontSize: 10, color: "#6B7280", mb: 0.5 }}>
                                    Type: Header Image + Interactive Button
                                </Typography>
                                <Typography sx={{ fontSize: 10, color: "#6B7280" }}>
                                    Language: English
                                </Typography>
                            </Box>
                        </Paper>
                    )}

                    <Paper sx={{ p: 1.8, borderRadius: 1.5, border: "1px solid #E5E7EB" }}>
                        <Typography sx={{ fontWeight: 600, mb: 1, fontSize: 13 }}>Summary</Typography>

                        {recipientMode === "onboard" ? (
                            <>
                                <SummaryRow label="Type:" value="New Onboarding" />
                                <SummaryRow label="Recipients:" value={phoneNumber || "Not set"} />
                                <SummaryRow label="Template:" value="Enrolment Template" />
                            </>
                        ) : (
                            <>
                                <SummaryRow label="Template:" value={tpl?.label || "None"} />
                                <SummaryRow label="Recipients:" value={recipientCount.toString()} />
                                <SummaryRow label="Delivery:" value={scheduleLater ? "Scheduled" : "Immediate"} />
                                <SummaryRow label="Media:" value={includeImage && tpl?.data.image ? "Image + Text" : "Text Only"} />
                            </>
                        )}

                        <Button
                            fullWidth
                            variant="contained"
                            disabled={
                                isLoading ||
                                (recipientMode === "onboard" ? !phoneNumber : (!selectedTemplate || recipientCount === 0))
                            }
                            onClick={recipientMode === "onboard" ? handleOnboardUser : handleSendMessage}
                            sx={{
                                mt: 1.5,
                                textTransform: "none",
                                borderRadius: 1,
                                background: "#22C55E",
                                fontSize: 12,
                                py: 0.6,
                                minHeight: 32,
                                "&:hover": { background: "#16A34A" },
                                "&:disabled": { background: "#D1D5DB", color: "#9CA3AF" }
                            }}
                        >
                            {isLoading ? (
                                <CircularProgress size={18} sx={{ color: "#fff" }} />
                            ) : (
                                "Send Message"
                            )}
                        </Button>

                        <Button
                            fullWidth
                            variant="outlined"
                            disabled={isLoading}
                            sx={{
                                mt: 0.8,
                                textTransform: "none",
                                borderRadius: 1,
                                fontSize: 12,
                                py: 0.6,
                                minHeight: 32
                            }}
                        >
                            Cancel
                        </Button>
                    </Paper>
                </Grid>

            </Grid>
        </Box>
    );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
    return (
        <Stack direction="row" justifyContent="space-between" sx={{ fontSize: 11, mb: 0.5 }}>
            <Typography sx={{ color: "#6B7280" }}>{label}</Typography>
            <Typography sx={{ fontWeight: 500 }}>{value}</Typography>
        </Stack>
    );
}