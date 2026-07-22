"use client";

import React, { useState, useRef } from "react";
import { Camera, RefreshCw, Check, X, FileText, UploadCloud } from "lucide-react";

interface CameraScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture?: (imageDataUrl: string) => void;
}

export function CameraScanner({ isOpen, onClose, onCapture }: CameraScannerProps) {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  if (!isOpen) return null;

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.log("[Camera] Camera access failed:", err);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg");
      setCapturedImage(dataUrl);

      // Stop camera stream
      const stream = video.srcObject as MediaStream;
      stream?.getTracks().forEach((track) => track.stop());
    }
  };

  const handleUpload = () => {
    if (capturedImage && onCapture) {
      setIsProcessing(true);
      setTimeout(() => {
        onCapture(capturedImage);
        setIsProcessing(false);
        onClose();
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 text-white flex flex-col justify-between p-4 animate-in fade-in duration-200">
      {/* Top Controls */}
      <div className="flex items-center justify-between z-10">
        <h3 className="font-bold text-base flex items-center gap-2">
          <Camera className="w-5 h-5 text-amber-400" />
          مسح/تصوير مستند ضوئي
        </h3>
        <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Viewport */}
      <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden rounded-2xl border-2 border-dashed border-amber-500/40 bg-slate-950">
        {!capturedImage ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              onLoadedMetadata={startCamera}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-8 border-2 border-amber-400/60 rounded-xl pointer-events-none flex items-center justify-center">
              <span className="text-xs bg-black/60 px-3 py-1 rounded-full text-amber-300">
                ضع العقد/الوكالة داخل الإطار
              </span>
            </div>
          </>
        ) : (
          <img src={capturedImage} alt="Captured Document" className="w-full h-full object-contain" />
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-around py-2 z-10">
        {!capturedImage ? (
          <button
            onClick={capturePhoto}
            className="w-16 h-16 rounded-full border-4 border-white bg-amber-500 hover:scale-105 transition-all shadow-xl flex items-center justify-center"
          >
            <div className="w-12 h-12 rounded-full border-2 border-white" />
          </button>
        ) : (
          <div className="flex items-center gap-4 w-full justify-center">
            <button
              onClick={() => {
                setCapturedImage(null);
                startCamera();
              }}
              className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold"
            >
              <RefreshCw className="w-4 h-4" />
              إعادة الالتقاط
            </button>

            <button
              onClick={handleUpload}
              disabled={isProcessing}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold shadow-lg shadow-emerald-600/30"
            >
              {isProcessing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <UploadCloud className="w-4 h-4" />
              )}
              حفظ ومعالجة الـ OCR 🪄
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
