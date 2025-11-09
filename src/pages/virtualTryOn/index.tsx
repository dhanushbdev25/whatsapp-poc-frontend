import React, { useRef, useState, useEffect } from "react";
import {
    Button,
    Grid,
    Typography,
    Box,
    CircularProgress,
    Container,
    Paper,
    Chip,
    Zoom,
    Slide,
    IconButton,
    Stack,
    Divider,
} from "@mui/material";
import { MdCameraswitch, MdPhotoCamera, MdClose, MdCheckCircle } from "react-icons/md";
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

const API_BASE = "http://20.212.169.167:8000/api/v1";

const VirtualHairstylesTryOn: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const [net, setNet] = useState<any>(null);
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [cameraFacing, setCameraFacing] = useState<"user" | "environment">("user");

    const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
    const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
    const [uploadedBlob, setUploadedBlob] = useState<Blob | null>(null);

    const [images, setImages] = useState<ReferenceImage[]>([]);
    const [selectedFilter, setSelectedFilter] = useState<ReferenceImage | null>(null);
    const [filterImgEl, setFilterImgEl] = useState<HTMLImageElement | null>(null);

    const [loading, setLoading] = useState(false);
    const [processedImage, setProcessedImage] = useState<string | null>(null);
    const [showResultModal, setShowResultModal] = useState<boolean>(false);

    // Load reference images (via axios now)
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`${API_BASE}/reference_images`, {
                    params: { category: "hairstyles" },
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

    // Load model
    useEffect(() => {
        bodyPix
            .load({
                architecture: "ResNet50",
                outputStride: 16,
                multiplier: 1.0,
                quantBytes: 4,
            })
            .then(setNet);
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

    const capturePhoto = () => {
        if (!selectedFilter) return Swal.fire("Select a hairstyle first.");
        const video = videoRef.current;
        if (!video) return;

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
        setCapturedPhoto(canvas.toDataURL("image/jpeg", 0.9));
        setProcessedImage(null);
        setUploadedPhoto(null);
        setUploadedBlob(null);
    };

    const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!selectedFilter) return Swal.fire("Select a style first");
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadedBlob(file);
        const reader = new FileReader();
        reader.onloadend = () => setUploadedPhoto(reader.result as string);
        reader.readAsDataURL(file);
        setCapturedPhoto(null);
        setProcessedImage(null);
    };

    const handleSend = async () => {
        const src = capturedPhoto || uploadedPhoto;
        if (!src || !selectedFilter) return Swal.fire("Take or upload an image first");

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("category", "hairstyles");
            formData.append("image_id", selectedFilter.id);

            if (uploadedBlob) {
                formData.append("src_image", uploadedBlob, "upload.jpg");
            } else {
                const blob = await fetch(src).then((r) => r.blob());
                formData.append("src_image", blob, "capture.jpg");
            }

            const res = await axios.post(`${API_BASE}/virtual_try_on`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setProcessedImage(res.data?.data?.blob_url || null);
            setShowResultModal(true);
        } catch {
            Swal.fire("Failed to process image");
        } finally {
            setLoading(false);
        }
    };

    const downloadImage = () => {
        const a = document.createElement("a");
        a.href = processedImage!;
        a.download = `photo-${Date.now()}.jpg`;
        a.click();
    };

    const shareImage = async () => {
        if (!processedImage) return;
        if (navigator.share) {
            return navigator.share({
                title: "Virtual Try-On",
                text: "Check out my new look!",
                url: processedImage,
            });
        }
        await navigator.clipboard.writeText(processedImage);
        Swal.fire("Copied", "Link copied to clipboard", "success");
    };

    const handleReset = () => {
        setCapturedPhoto(null);
        setUploadedPhoto(null);
        setUploadedBlob(null);
        setProcessedImage(null);
        setShowResultModal(false);
    };

    return (
        <Box sx={{ minHeight: "100vh", background: "linear-gradient(135deg, #000000 0%, #6A0DAD 100%)", pb: 10 }}>
            <Container maxWidth="md" sx={{ pt: 2 }}>
                <Typography textAlign="center" sx={{
                    fontSize: { xs: 22, md: 28 },
                    fontWeight: 900,
                    color: "#fff",
                    mb: 2
                }}>
                    Virtual Hairstyles Try-On
                </Typography>

                <Grid container justifyContent="center">
                    <Grid>
                        <Slide in direction="up" timeout={500}>
                            <Paper sx={{
                                position: "relative",
                                borderRadius: 4,
                                overflow: "hidden",
                                background: "#fff",
                                border: "1px solid rgba(10,37,64,0.08)"
                            }}>
                                <Box sx={{ position: "relative", background: "#000" }}>
                                    {!isCameraReady && (
                                        <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 1.5 }}>
                                            <CircularProgress size={56} />
                                            <Typography sx={{ color: "#fff" }}>Preparing camera…</Typography>
                                        </Box>
                                    )}

                                    <canvas ref={canvasRef} style={{ width: "100%", minHeight: 500, display: "block", background: "#000" }} />
                                    <video ref={videoRef} style={{ display: "none" }} playsInline muted autoPlay />

                                    <Box sx={{ position: "absolute", left: 0, right: 0, bottom: { xs: 100, md: 98 }, display: "flex", justifyContent: "center", gap: 3 }}>
                                        <IconButton onClick={() => setCameraFacing((p) => (p === "user" ? "environment" : "user"))} sx={{ background: "#fff" }}>
                                            <MdCameraswitch />
                                        </IconButton>

                                        <Box onClick={capturePhoto} sx={{
                                            width: 36, height: 36, borderRadius: "50%", background: "#fff", border: "6px solid #ffd9d0", display: "flex", alignItems: "center", justifyContent: "center", cursor: selectedFilter ? "pointer" : "not-allowed", opacity: selectedFilter ? 1 : 0.5
                                        }}>
                                            {selectedFilter ? <img src={selectedFilter.blob_url} style={{ width: "90%", height: "90%", borderRadius: "50%" }} /> : <MdPhotoCamera size={28} />}
                                        </Box>

                                        <label style={{ background: "#fff", width: 38, height: 38, display: "flex", borderRadius: 2, alignItems: "center", justifyContent: "center", cursor: selectedFilter ? "pointer" : "not-allowed" }}>
                                            📁<input type="file" hidden accept="image/*" disabled={!selectedFilter} onChange={handleUploadImage} />
                                        </label>
                                    </Box>

                                    <Box sx={{ position: "absolute", left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", pt: 1, pb: 1.25, px: 1 }}>
                                        <Box sx={{ display: "flex", gap: 4, overflowX: "auto", pb: 0.5 }}>
                                            {images.map((img) => {
                                                const active = selectedFilter?.id === img.id;
                                                return (
                                                    <Box key={img.id} onClick={() => setSelectedFilter(img)} sx={{ cursor: "pointer", textAlign: "center" }}>
                                                        <Box sx={{
                                                            width: 40, height: 40, borderRadius: "50%", overflow: "hidden",
                                                            border: active ? "4px solid #ff9c74" : "2px solid #fff"
                                                        }}>
                                                            <img src={img.blob_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                                        </Box>
                                                        <Typography sx={{ color: "#fff", fontSize: 11, maxWidth: 80, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                                                            {img.name}
                                                        </Typography>
                                                    </Box>
                                                );
                                            })}
                                        </Box>
                                    </Box>
                                </Box>

                                <Box sx={{ display: "flex", gap: 1, p: 2, background: "#fff" }}>
                                    <Button fullWidth onClick={handleSend} disabled={loading || !selectedFilter || (!capturedPhoto && !uploadedPhoto)} variant="contained">
                                        {loading ? <CircularProgress size={20} /> : "Apply Hairstyle"}
                                    </Button>
                                    <Button variant="outlined" onClick={handleReset}>Reset</Button>
                                </Box>
                            </Paper>
                        </Slide>

                        {(capturedPhoto || uploadedPhoto) && !processedImage && (
                            <Slide in direction="up">
                                <Paper sx={{ mt: 2, p: 2 }}>
                                    <Typography sx={{ fontWeight: 800 }}>Preview</Typography>
                                    <Box sx={{ borderRadius: 2, overflow: "hidden", border: "1px solid #ccc", mt: 1 }}>
                                        <img src={capturedPhoto || uploadedPhoto || ""} style={{ width: "100%" }} />
                                    </Box>
                                </Paper>
                            </Slide>
                        )}

                        {processedImage && !showResultModal && (
                            <Slide in direction="up">
                                <Paper sx={{ mt: 2, p: 2 }}>
                                    <Typography sx={{ fontWeight: 800, color: "#2A7F62" }}>✨ Your New Look</Typography>
                                    <Box sx={{ borderRadius: 2, overflow: "hidden", border: "1px solid #ccc", mt: 1 }}>
                                        <img src={processedImage} style={{ width: "100%" }} />
                                    </Box>
                                    <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                                        <Button onClick={shareImage} variant="contained" fullWidth>Share</Button>
                                        <Button onClick={downloadImage} variant="contained" fullWidth>Download</Button>
                                    </Stack>
                                </Paper>
                            </Slide>
                        )}
                    </Grid>
                </Grid>
            </Container>

            {showResultModal && processedImage && (
                <Box sx={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}>
                    <Paper sx={{ width: "min(92vw, 820px)", borderRadius: 4, overflow: "hidden", maxHeight: "88vh", display: "flex", flexDirection: "column" }}>
                        <Box sx={{ p: 1.25, display: "flex", justifyContent: "space-between" }}>
                            <Typography sx={{ fontWeight: 900 }}>Your New Look</Typography>
                            <IconButton onClick={() => setShowResultModal(false)}>
                                <MdClose />
                            </IconButton>
                        </Box>
                        <Divider />
                        <Box sx={{ p: 2, overflow: "auto" }}>
                            <img src={processedImage} style={{ width: "100%", objectFit: "contain" }} />
                        </Box>
                        <Divider />
                        <Stack direction="row" spacing={1} sx={{ p: 2 }}>
                            <Button onClick={shareImage} variant="contained" fullWidth>Share</Button>
                            <Button onClick={downloadImage} variant="contained" fullWidth>Download</Button>
                            <Button onClick={() => setShowResultModal(false)} variant="outlined" fullWidth>Close</Button>
                        </Stack>
                    </Paper>
                </Box>
            )}
        </Box>
    );
};

export default VirtualHairstylesTryOn;
