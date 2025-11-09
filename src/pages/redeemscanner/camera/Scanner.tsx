
import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Paper, 
  Button, 
  Card, 
  Divider,
  Fade
} from "@mui/material";
import { 
  QrCodeScanner, 
  CheckCircle, 
  CameraAlt, 
  Refresh,
  ArrowBack,
  Star,
  AccountBalanceWallet
} from "@mui/icons-material";
import { useParams } from "react-router-dom";

const Scanner = () => {
  const { id: customerID } = useParams();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [transactionData, setTransactionData] = useState<any>(null); // ✅ Store success data

  const readerRef = useRef<any>(null);
  const hasScannedRef = useRef(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [currentDeviceIndex, setCurrentDeviceIndex] = useState(0);

  const stopCamera = () => {
    try {
      const stream = videoRef.current?.srcObject as MediaStream | null;
      if (stream) stream.getTracks().forEach((t) => t.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
      if (readerRef.current) {
        readerRef.current.reset();
        readerRef.current = null;
      }
    } catch { }
  };

  const sendEarnPointsRequest = async (productID: string) => {
    setMessage("Processing...");

    try {
      const res = await fetch(
        `${process.env.API_BASE_URL}webhook/earn-loyalty?userId=whatsapp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productID, customerID })
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to add loyalty points");
        setMessage(null);
        return;
      }

      setTransactionData(data.data); // ✅ Save data for display
      setMessage(data.message);
    } catch {
      setError("Network or server error.");
      setMessage(null);
    }
  };

  const startCamera = async (deviceId: string) => {
    hasScannedRef.current = false;
    setMessage(null);
    setError(null);
    setTransactionData(null);
    stopCamera();
    setLoading(true);

    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE]);

    const reader = new BrowserMultiFormatReader(hints, { delayBetweenScanAttempts: 500 });
    readerRef.current = reader;

    try {
      await reader.decodeFromVideoDevice(
        deviceId,
        videoRef.current!,
        (result) => {
          if (!result) return;
          const productID = result.getText().trim();
          if (hasScannedRef.current) return;

          hasScannedRef.current = true;
          stopCamera();
          sendEarnPointsRequest(productID);
        }
      );

      setLoading(false);
    } catch {
      setError("Unable to start camera.");
      setLoading(false);
    }
  };

  const switchCamera = () => {
    if (devices.length < 2) return;
    const nextIndex = (currentDeviceIndex + 1) % devices.length;
    setCurrentDeviceIndex(nextIndex);
    startCamera(devices[nextIndex].deviceId);
  };


  const resetScanner = () => {
    window.location.reload(); // ✅ HARD REFRESH (best on mobile)
  };

  const goBackToWhatsApp = () => {
    // For WhatsApp WebView, try multiple methods to close/return to WhatsApp
    try {
      // Method 1: Try to close the window (works if opened by JavaScript/WhatsApp WebView)
      if (window.opener || window.history.length <= 1) {
        window.close();
      }
      
      // Method 2: Use history back (works in most WebView scenarios)
      if (window.history.length > 1) {
        window.history.back();
      } else {
        // Method 3: If no history, try to close anyway
        window.close();
      }
    } catch (error) {
      // Fallback: Force history back or close
      try {
        if (window.history.length > 0) {
          window.history.back();
        } else {
          window.close();
        }
      } catch {
        // If all else fails, try location replace (last resort)
        window.location.href = 'about:blank';
      }
    }
  };
  useEffect(() => {
    const initializeCamera = async () => {
      try {
        // First, try to get camera with environment (rear) facing mode for mobile
        let preferredDeviceId: string | null = null;
        
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
          });
          const videoTrack = stream.getVideoTracks()[0];
          preferredDeviceId = videoTrack.getSettings().deviceId || null;
          stream.getTracks().forEach((t) => t.stop());
        } catch {
          // If environment facing mode fails, continue with default enumeration
        }

        // Enumerate all devices
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const cams = allDevices.filter((d) => d.kind === "videoinput");
        setDevices(cams);

        if (cams.length === 0) {
          setError("No camera devices found.");
          return;
        }

        let startIndex = 0;

        // If we have a preferred device ID, use it
        if (preferredDeviceId) {
          const preferredIndex = cams.findIndex((d) => d.deviceId === preferredDeviceId);
          if (preferredIndex !== -1) {
            startIndex = preferredIndex;
          }
        } else {
          // Fallback: try to find rear camera by label
          const backIndex = cams.findIndex((d) => {
            const label = d.label.toLowerCase();
            return label.includes("back") || 
                   label.includes("rear") || 
                   label.includes("environment") ||
                   label.includes("facing back");
          });
          
          if (backIndex !== -1) {
            startIndex = backIndex;
          } else {
            // Default to first camera (usually primary/rear on mobile)
            startIndex = 0;
          }
        }

        setCurrentDeviceIndex(startIndex);
        await startCamera(cams[startIndex].deviceId);
      } catch (err) {
        setError("Camera permission denied or unable to access camera.");
      }
    };

    initializeCamera();
    return () => stopCamera();
  }, []);

  return (
    <Box 
      sx={{ 
        minHeight: "100vh", 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center",
        bgcolor: "background.default",
        pt: 3,
        pb: 4
      }}
    >
      {/* Header */}
      <Box sx={{ width: "100%", maxWidth: 600, px: 3, mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1.5, mb: 2 }}>
          <QrCodeScanner sx={{ fontSize: 28, color: "primary.main" }} />
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 600, 
              color: "text.primary",
              letterSpacing: "-0.02em"
            }}
          >
            QR Code Scanner
          </Typography>
        </Box>
        <Typography 
          variant="body1" 
          sx={{ 
            textAlign: "center", 
            color: "text.primary",
            fontWeight: 500,
            mb: 1.5,
            lineHeight: 1.6
          }}
        >
          Jump into the world of lush loyalty program, scan the QR code and redeem points.
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            textAlign: "center", 
            color: "text.secondary"
          }}
        >
          Position the QR code within the scanning frame
        </Typography>
      </Box>

      {/* Scanner View */}
      {!transactionData && (
        <Fade in={!transactionData} timeout={300}>
          <Paper 
            elevation={3}
            sx={{ 
              width: "90%", 
              maxWidth: 500, 
              height: "65vh", 
              maxHeight: 600,
              borderRadius: 2, 
              overflow: "hidden", 
              position: "relative",
              border: "1px solid",
              borderColor: "divider"
            }}
          >
            {loading && (
              <Box 
                sx={{ 
                  position: "absolute", 
                  inset: 0, 
                  display: "flex", 
                  flexDirection: "column",
                  justifyContent: "center", 
                  alignItems: "center", 
                  bgcolor: "rgba(0,0,0,0.5)", 
                  zIndex: 3,
                  gap: 2
                }}
              >
                <CircularProgress size={50} />
                <Typography sx={{ color: "white", fontWeight: 500 }}>
                  Initializing camera...
                </Typography>
              </Box>
            )}
            
            <video 
              ref={videoRef} 
              autoPlay 
              muted 
              style={{ 
                width: "100%", 
                height: "100%", 
                objectFit: "cover",
                filter: loading ? "blur(3px)" : "none",
                transition: "filter 0.3s ease"
              }} 
            />

            {/* Scanning Frame Overlay */}
            {!loading && (
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  zIndex: 2,
                  pointerEvents: "none"
                }}
              >
                {/* Scanning Frame */}
                <Box
                  sx={{
                    width: "75%",
                    height: "75%",
                    maxWidth: 300,
                    maxHeight: 300,
                    position: "relative",
                    border: "2px solid",
                    borderColor: "primary.main",
                    borderRadius: 1,
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: -2,
                      left: -2,
                      width: 24,
                      height: 24,
                      borderTop: "3px solid",
                      borderLeft: "3px solid",
                      borderColor: "primary.main"
                    },
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      top: -2,
                      right: -2,
                      width: 24,
                      height: 24,
                      borderTop: "3px solid",
                      borderRight: "3px solid",
                      borderColor: "primary.main"
                    }
                  }}
                >
                  {/* Bottom Left Corner */}
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: -2,
                      left: -2,
                      width: 24,
                      height: 24,
                      borderBottom: "3px solid",
                      borderLeft: "3px solid",
                      borderColor: "primary.main"
                    }}
                  />
                  {/* Bottom Right Corner */}
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: -2,
                      right: -2,
                      width: 24,
                      height: 24,
                      borderBottom: "3px solid",
                      borderRight: "3px solid",
                      borderColor: "primary.main"
                    }}
                  />

                  {/* Subtle Scanning Line */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: "2px",
                      bgcolor: "primary.main",
                      opacity: 0.6,
                      animation: "scanLine 2.5s ease-in-out infinite",
                      "@keyframes scanLine": {
                        "0%": {
                          top: "0%",
                          opacity: 0.6
                        },
                        "50%": {
                          opacity: 0.3
                        },
                        "100%": {
                          top: "100%",
                          opacity: 0.6
                        }
                      }
                    }}
                  />
                </Box>
              </Box>
            )}

            {/* Dimmed edges */}
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                background: `
                  linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 25%, transparent 75%, rgba(0,0,0,0.4) 100%),
                  linear-gradient(to right, rgba(0,0,0,0.4) 0%, transparent 25%, transparent 75%, rgba(0,0,0,0.4) 100%)
                `,
                zIndex: 1,
                pointerEvents: "none"
              }}
            />
          </Paper>
        </Fade>
      )}

      {/* Success Card */}
      {transactionData && (
        <Fade in={!!transactionData} timeout={400}>
          <Card 
            elevation={4}
            sx={{ 
              width: "90%", 
              maxWidth: 500, 
              mt: 3,
              borderRadius: 2,
              overflow: "hidden"
            }}
          >
            {/* Success Header */}
            <Box
              sx={{
                bgcolor: "success.main",
                p: 3,
                textAlign: "center"
              }}
            >
              <Box
                sx={{
                  display: "inline-flex",
                  p: 1,
                  borderRadius: "50%",
                  bgcolor: "rgba(255,255,255,0.2)",
                  mb: 1.5
                }}
              >
                <CheckCircle sx={{ fontSize: 40, color: "white" }} />
              </Box>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: "white", 
                  fontWeight: 600
                }}
              >
                {message}
              </Typography>
            </Box>

            <Box sx={{ p: 3 }}>
              {/* Product Info */}
              <Box sx={{ mb: 3 }}>
                <Typography 
                  variant="overline" 
                  sx={{ 
                    color: "text.secondary", 
                    fontWeight: 600,
                    letterSpacing: 1,
                    fontSize: "0.7rem"
                  }}
                >
                  PRODUCT SCANNED
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mt: 1,
                    fontWeight: 600,
                    color: "text.primary"
                  }}
                >
                  {transactionData.transaction.metadata.productName}
                </Typography>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Points Earned */}
              <Box 
                sx={{ 
                  bgcolor: "primary.main",
                  borderRadius: 2,
                  p: 3,
                  mb: 3,
                  textAlign: "center"
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mb: 0.5 }}>
                  <Star sx={{ color: "white", fontSize: 24 }} />
                  <Typography variant="h4" sx={{ color: "white", fontWeight: 600 }}>
                    +{transactionData.transaction.manipulatedPoint}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.9)" }}>
                  Points Earned
                </Typography>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Account Balance */}
              <Box>
                <Typography 
                  variant="overline" 
                  sx={{ 
                    color: "text.secondary", 
                    fontWeight: 600,
                    letterSpacing: 1,
                    fontSize: "0.7rem"
                  }}
                >
                  ACCOUNT SUMMARY
                </Typography>
                <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <AccountBalanceWallet sx={{ color: "text.secondary", fontSize: 20 }} />
                      <Typography variant="body1" sx={{ color: "text.secondary" }}>
                        Current Balance
                      </Typography>
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: "primary.main" }}>
                      {transactionData.account.points_balance}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="body1" sx={{ color: "text.secondary" }}>
                      Lifetime Earned
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: "text.primary" }}>
                      {transactionData.account.lifetime_points}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Card>
        </Fade>
      )}

      {/* Action Buttons */}
      <Box sx={{ width: "90%", maxWidth: 500, mt: 3, mb: 2 }}>
        {devices.length > 1 && !transactionData && (
          <Fade in={devices.length > 1 && !transactionData} timeout={300}>
            <Button 
              variant="outlined" 
              fullWidth
              startIcon={<CameraAlt />}
              onClick={switchCamera}
              sx={{
                py: 1.5,
                textTransform: "none",
                fontWeight: 500
              }}
            >
              Switch Camera
            </Button>
          </Fade>
        )}

        {transactionData && (
          <Fade in={!!transactionData} timeout={400}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Button 
                variant="contained" 
                fullWidth 
                startIcon={<ArrowBack />}
                onClick={goBackToWhatsApp}
                sx={{
                  py: 1.5,
                  textTransform: "none",
                  fontWeight: 500
                }}
              >
                Go Back to WhatsApp
              </Button>

              <Button 
                variant="outlined" 
                fullWidth 
                startIcon={<Refresh />}
                onClick={resetScanner}
                sx={{
                  py: 1.5,
                  textTransform: "none",
                  fontWeight: 500
                }}
              >
                Scan Another Product
              </Button>
            </Box>
          </Fade>
        )}
      </Box>

      {/* Error Message */}
      {error && (
        <Fade in={!!error} timeout={300}>
          <Paper
            elevation={2}
            sx={{
              width: "90%",
              maxWidth: 500,
              p: 2.5,
              mb: 2,
              borderRadius: 2,
              bgcolor: "error.main",
              color: "white",
              textAlign: "center"
            }}
          >
            <Typography sx={{ fontWeight: 500 }}>{error}</Typography>
          </Paper>
        </Fade>
      )}
    </Box>
  );
};

export default Scanner;
