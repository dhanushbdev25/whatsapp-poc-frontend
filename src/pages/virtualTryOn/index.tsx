import React, { useRef, useState, useEffect } from "react";
import {
    Button,
    Typography,
    Box,
    CircularProgress,
    Paper,
    IconButton,
    Fade,
    Backdrop,
} from "@mui/material";
import {
    CheckCircle
} from "@mui/icons-material";
import {
    MdFlipCameraIos,
    MdCameraAlt
} from "react-icons/md";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import * as bodyPix from "@tensorflow-models/body-pix";
import "@tensorflow/tfjs";
import axios from "axios";

interface ReferenceImage {
    id: string;
    name: string;
    category: string;
    blob_url: string;
}


const API_BASE_T = "https://vtryon.share.zrok.io/api/v1";

const VirtualHairstylesTryOn: React.FC = () => {
    const navigate = useNavigate();
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const [isCameraReady, setIsCameraReady] = useState(false);
    const [cameraFacing, setCameraFacing] = useState<"user" | "environment">("user");

    const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
    const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
    const [uploadedBlob, setUploadedBlob] = useState<Blob | null>(null);

    const [images, setImages] = useState<ReferenceImage[]>([]);
    const [selectedFilter, setSelectedFilter] = useState<ReferenceImage | null>(null);
    const [filterImgEl, setFilterImgEl] = useState<HTMLImageElement | null>(null);

    const [loading, setLoading] = useState(false);

    // Get userId from URL
    const userId = window.location.pathname.split('/').pop() || '';

    // Load reference images (via axios now)
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`${API_BASE_T}/reference_images`, {
                    params: { category: "hairstyles" },
                    headers: {
                        "Content-Type": "multipart/form-data",
                        "skip_zrok_interstitial": "image"
                    },
                });
                if (res.data?.data?.results) {
                    setImages(res.data.data.results);
                }
            } catch (err) {
                console.error("Failed to load reference images", err);
            }
        };
        fetchData();
    }, []);

    // Load overlay image when selected
    useEffect(() => {
        if (!selectedFilter) return setFilterImgEl(null);
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = selectedFilter.blob_url + "?t=" + Date.now();
        img.onload = () => setFilterImgEl(img);
        img.onerror = () => setFilterImgEl(null);
    }, [selectedFilter]);

    // Load model (for future use)
    useEffect(() => {
        bodyPix
            .load({
                architecture: "ResNet50",
                outputStride: 16,
                multiplier: 1.0,
                quantBytes: 4,
            })
            .then(() => {
                // Model loaded successfully
            });
    }, []);

    // Start camera
    useEffect(() => {
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: cameraFacing },
                    audio: false,
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadedmetadata = () => {
                        videoRef.current?.play();
                        setIsCameraReady(true);
                    };
                }
            } catch (err: any) {
                Swal.fire("Camera error", err.message);
            }
        };
        startCamera();
        return () => {
            videoRef.current?.srcObject && (videoRef.current.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
        };
    }, [cameraFacing]);

    // Render to canvas continuously
    useEffect(() => {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        if (!canvas || !video) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let rafId = 0;
        const draw = () => {
            rafId = requestAnimationFrame(draw);
            if (video.readyState < 2) return;
            const w = video.videoWidth;
            const h = video.videoHeight;
            canvas.width = w;
            canvas.height = h;

            ctx.clearRect(0, 0, w, h);

            if (cameraFacing === "user") {
                ctx.save();
                ctx.scale(-1, 1);
                ctx.drawImage(video, -w, 0, w, h);
                ctx.restore();
            } else {
                ctx.drawImage(video, 0, 0, w, h);
            }

            if (filterImgEl) {
                const scale = Math.min(1, (w * 0.9) / filterImgEl.width);
                const iw = filterImgEl.width * scale;
                const ih = filterImgEl.height * scale;
                const x = (w - iw) / 2;
                const y = (h - ih) / 2 - h * 0.05;
                ctx.drawImage(filterImgEl, x, y, iw, ih);
            }
        };
        draw();
        return () => cancelAnimationFrame(rafId);
    }, [filterImgEl, cameraFacing, isCameraReady]);


    const handleSend = async () => {
        if (!selectedFilter) return Swal.fire("Please select a hairstyle first");

        setLoading(true);
        try {
            // Capture photo from video if not already captured or uploaded
            let src = capturedPhoto || uploadedPhoto;
            let blobToUse = uploadedBlob;

            if (!src) {
                // Capture photo from video
                const video = videoRef.current;
                if (!video) {
                    Swal.fire("Error", "Camera not ready", "error");
                    setLoading(false);
                    return;
                }

                const canvas = document.createElement("canvas");
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext("2d")!;
                if (cameraFacing === "user") {
                    ctx.scale(-1, 1);
                    ctx.drawImage(video, -video.videoWidth, 0, video.videoWidth, video.videoHeight);
                } else {
                    ctx.drawImage(video, 0, 0);
                }
                src = canvas.toDataURL("image/jpeg", 0.9);
                setCapturedPhoto(src);
            }

            const formData = new FormData();
            formData.append("category", "hairstyles");
            formData.append("image_id", selectedFilter.id);

            if (blobToUse) {
                formData.append("src_image", blobToUse, "upload.jpg");
            } else {
                const blob = await fetch(src).then((r) => r.blob());
                formData.append("src_image", blob, "capture.jpg");
            }

            const res = await axios.post(`${API_BASE_T}/virtual_try_on`, formData, {
                headers: { "Content-Type": "multipart/form-data", "skip_zrok_interstitial": "image" },
            });

            const processedImage = res.data?.data?.blob_url || null;
            if (processedImage && selectedFilter) {
                // Navigate to preview screen with state
                navigate(`/try/${userId}/preview`, {
                    state: {
                        processedImage,
                        selectedFilter,
                        userId
                    }
                });
            } else {
                Swal.fire("Error", "Failed to process image", "error");
            }
        } catch {
            Swal.fire("Error", "Failed to process image", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setCapturedPhoto(null);
        setUploadedPhoto(null);
        setUploadedBlob(null);
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                bgcolor: "background.default",
                pt: 3,
                pb: 4,
                px: 2
            }}
        >
            {/* Header */}
            <Box sx={{ width: "100%", maxWidth: 600, mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1.5, mb: 2 }}>
                    <MdCameraAlt size={28} style={{ color: "#1976d2" }} />
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 600,
                            color: "text.primary",
                            letterSpacing: "-0.02em"
                        }}
                    >
                        Virtual Try-On
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
                    Try on different hairstyles in real-time. Select a style, take a photo, and see your new look.
                </Typography>
                <Typography
                    variant="body2"
                    sx={{
                        textAlign: "center",
                        color: "text.secondary"
                    }}
                >
                    {selectedFilter ? `Selected: ${selectedFilter.name}` : "Please select a hairstyle to begin"}
                </Typography>
            </Box>

            {/* Camera View */}
            <Fade in timeout={300}>
                <Paper
                    elevation={3}
                    sx={{
                        width: "100%",
                        maxWidth: 500,
                        height: { xs: "65vh", sm: "65vh" },
                        maxHeight: 600,
                        borderRadius: 2,
                        overflow: "hidden",
                        position: "relative",
                        border: "1px solid",
                        borderColor: "divider",
                        mb: 3
                    }}
                >
                    {!isCameraReady && (
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

                    <canvas
                        ref={canvasRef}
                        style={{
                            width: "100%",
                            height: "100%",
                            display: "block",
                            background: "#000",
                            objectFit: "cover"
                        }}
                    />
                    <video
                        ref={videoRef}
                        style={{ display: "none" }}
                        playsInline
                        muted
                        autoPlay
                    />

                    {/* Camera Flip Button */}
                    <Box sx={{
                        position: "absolute",
                        top: 16,
                        right: 16,
                        zIndex: 2
                    }}>
                        <IconButton
                            onClick={() => setCameraFacing((p) => (p === "user" ? "environment" : "user"))}
                            sx={{
                                background: "rgba(255, 255, 255, 0.95)",
                                "&:hover": {
                                    background: "#fff"
                                },
                                width: { xs: 44, sm: 48 },
                                height: { xs: 44, sm: 48 }
                            }}
                        >
                            <MdFlipCameraIos size={22} />
                        </IconButton>
                    </Box>

                    {/* Hairstyle Selection */}
                    <Box sx={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        bottom: 0,
                        // background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 100%)", 
                        pt: { xs: 2.5, sm: 3 },
                        pb: { xs: 2, sm: 2.5 },
                        px: { xs: 2.5, sm: 3 },
                    }}>
                        <Box sx={{
                            display: "flex",
                            gap: { xs: 2.5, sm: 3 },
                            overflowX: "auto",
                            overflowY: "hidden",
                            px: { xs: 1, sm: 1.5 },
                            py: 0.5,
                            "&::-webkit-scrollbar": {
                                height: 6
                            },
                            "&::-webkit-scrollbar-thumb": {
                                background: "rgba(255,255,255,0.3)",
                                borderRadius: 3
                            },
                            "&::-webkit-scrollbar-track": {
                                background: "rgba(255,255,255,0.1)",
                                borderRadius: 3
                            }
                        }}>
                            {images.map((img) => {
                                const active = selectedFilter?.id === img.id;
                                return (
                                    <Box
                                        key={img.id}
                                        onClick={() => setSelectedFilter(img)}
                                        sx={{
                                            cursor: "pointer",
                                            textAlign: "center",
                                            flexShrink: 0,
                                            transition: "transform 0.2s",
                                            px: 0.5,
                                            "&:hover": {
                                                transform: "scale(1.05)"
                                            }
                                        }}
                                    >
                                        <Box sx={{
                                            width: { xs: 64, sm: 72 },
                                            height: { xs: 64, sm: 72 },
                                            borderRadius: "50%",
                                            overflow: "hidden",
                                            border: active ? "3px solid" : "2px solid",
                                            borderColor: active ? "primary.main" : "rgba(255,255,255,0.5)",
                                            boxShadow: active ? "0 0 16px rgba(25, 118, 210, 0.6)" : "none",
                                            transition: "all 0.2s",
                                            position: "relative",
                                            mb: 1.5
                                        }}>
                                            <img
                                                src={img.blob_url}
                                                style={{
                                                    width: "100%",
                                                    height: "100%",
                                                    objectFit: "cover"
                                                }}
                                            />
                                            {active && (
                                                <Box sx={{
                                                    position: "absolute",
                                                    inset: 0,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    bgcolor: "rgba(25, 118, 210, 0.2)"
                                                }}>
                                                    <CheckCircle sx={{ color: "primary.main", fontSize: { xs: 22, sm: 24 } }} />
                                                </Box>
                                            )}
                                        </Box>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: "#fff",
                                                maxWidth: { xs: 70, sm: 80 },
                                                overflow: "hidden",
                                                whiteSpace: "nowrap",
                                                textOverflow: "ellipsis",
                                                mt: 0.5,
                                                fontWeight: active ? 600 : 400,
                                                fontSize: { xs: 11, sm: 12 },
                                                display: "block",
                                                lineHeight: 1.4
                                            }}
                                        >
                                            {img.name}
                                        </Typography>
                                    </Box>
                                );
                            })}
                        </Box>
                    </Box>
                </Paper>
            </Fade>

            {/* Action Buttons */}
            <Box sx={{ width: "90%", maxWidth: 500 }}>
                <Button
                    fullWidth
                    onClick={handleSend}
                    disabled={loading || !selectedFilter || !isCameraReady}
                    variant="contained"
                    size="large"
                    sx={{
                        mb: 1.5,
                        py: 1.5,
                        fontSize: 16,
                        fontWeight: 600,
                        textTransform: "none",
                        borderRadius: 2,
                        boxShadow: 2
                    }}
                >
                    Capture & Apply Hairstyle
                </Button>
                <Button
                    variant="outlined"
                    onClick={handleReset}
                    fullWidth
                    size="medium"
                    sx={{
                        py: 1,
                        fontSize: 14,
                        textTransform: "none",
                        borderRadius: 2
                    }}
                >
                    Reset
                </Button>
            </Box>

            {/* Exciting Loading Overlay */}
            <Backdrop
                open={loading}
                sx={{
                    position: "fixed",
                    zIndex: 9999,
                    color: "#fff",
                    background: "linear-gradient(135deg, rgba(25, 118, 210, 0.95) 0%, rgba(106, 13, 173, 0.95) 100%)",
                    backdropFilter: "blur(8px)",
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 3,
                        textAlign: "center",
                    }}
                >
                    {/* Animated Spinner */}
                    <Box
                        sx={{
                            position: "relative",
                            width: 120,
                            height: 120,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        {/* Outer rotating ring */}
                        <CircularProgress
                            size={120}
                            thickness={4}
                            sx={{
                                position: "absolute",
                                color: "rgba(255, 255, 255, 0.3)",
                                animation: "spin 2s linear infinite",
                                "@keyframes spin": {
                                    "0%": { transform: "rotate(0deg)" },
                                    "100%": { transform: "rotate(360deg)" },
                                },
                            }}
                        />
                        {/* Inner pulsing ring */}
                        <CircularProgress
                            size={90}
                            thickness={4}
                            sx={{
                                position: "absolute",
                                color: "rgba(255, 255, 255, 0.6)",
                                animation: "spin 1.5s linear infinite reverse",
                            }}
                        />
                        {/* Center icon */}
                        <Box
                            sx={{
                                width: 60,
                                height: 60,
                                borderRadius: "50%",
                                background: "rgba(255, 255, 255, 0.2)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                animation: "pulse 1.5s ease-in-out infinite",
                                "@keyframes pulse": {
                                    "0%, 100%": {
                                        transform: "scale(1)",
                                        opacity: 1,
                                    },
                                    "50%": {
                                        transform: "scale(1.1)",
                                        opacity: 0.8,
                                    },
                                },
                            }}
                        >
                            <MdCameraAlt size={32} style={{ color: "#fff" }} />
                        </Box>
                    </Box>

                    {/* Loading Text */}
                    <Box>
                        <Typography
                            variant="h5"
                            sx={{
                                fontWeight: 700,
                                mb: 1,
                                animation: "fadeInOut 2s ease-in-out infinite",
                                "@keyframes fadeInOut": {
                                    "0%, 100%": { opacity: 0.7 },
                                    "50%": { opacity: 1 },
                                },
                            }}
                        >
                            Creating Your New Look...
                        </Typography>
                        <Typography
                            variant="body1"
                            sx={{
                                opacity: 0.9,
                                fontSize: 16,
                            }}
                        >
                            Please wait while we apply the hairstyle
                        </Typography>
                    </Box>

                    {/* Progress Dots */}
                    <Box
                        sx={{
                            display: "flex",
                            gap: 1,
                            mt: 1,
                        }}
                    >
                        {[0, 1, 2].map((index) => (
                            <Box
                                key={index}
                                sx={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: "50%",
                                    background: "#fff",
                                    animation: `bounce 1.4s ease-in-out infinite ${index * 0.2}s`,
                                    "@keyframes bounce": {
                                        "0%, 80%, 100%": {
                                            transform: "scale(0.8)",
                                            opacity: 0.5,
                                        },
                                        "40%": {
                                            transform: "scale(1.2)",
                                            opacity: 1,
                                        },
                                    },
                                }}
                            />
                        ))}
                    </Box>
                </Box>
            </Backdrop>
        </Box>
    );
};

export default VirtualHairstylesTryOn;