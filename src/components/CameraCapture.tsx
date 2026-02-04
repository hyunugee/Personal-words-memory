'use client';

import { useState, useRef, useCallback } from 'react';
import { Camera, RefreshCw, Check, X } from 'lucide-react';
import styles from './CameraCapture.module.css';

interface CameraCaptureProps {
    onCapture: (file: File) => void;
}

export default function CameraCapture({ onCapture }: CameraCaptureProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isActive, setIsActive] = useState(false);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setIsActive(true);
        } catch (err) {
            console.error("Error accessing camera:", err);
            alert("Could not access camera. Please check permissions.");
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setIsActive(false);
    };

    const captureImage = useCallback(() => {
        if (!videoRef.current) return;

        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(videoRef.current, 0, 0);
            canvas.toBlob((blob) => {
                if (blob) {
                    const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
                    onCapture(file);
                    stopCamera();
                }
            }, 'image/jpeg', 0.8);
        }
    }, [onCapture]);

    return (
        <div className={styles.container}>
            {!isActive ? (
                <button className="btn-primary" onClick={startCamera}>
                    <Camera size={20} style={{ marginRight: '8px' }} />
                    Take Photo
                </button>
            ) : (
                <div className={styles.overlay}>
                    <video ref={videoRef} autoPlay playsInline className={styles.video} />
                    <div className={styles.controls}>
                        <button className={styles.controlBtn} onClick={stopCamera}>
                            <X size={24} />
                        </button>
                        <button className={`${styles.controlBtn} ${styles.captureBtn}`} onClick={captureImage}>
                            <div className={styles.shutter} />
                        </button>
                        <button className={styles.controlBtn} onClick={() => { /* toggle camera? */ }}>
                            <RefreshCw size={24} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
