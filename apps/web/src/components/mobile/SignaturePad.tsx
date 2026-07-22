"use client";

import React, { useRef, useState } from "react";
import { PenTool, RotateCcw, Check, X } from "lucide-react";

interface SignaturePadProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  onSave?: (signatureDataUrl: string) => void;
}

export function SignaturePad({ isOpen, onClose, title = "التوقيع الرقمي بالمستند", onSave }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  if (!isOpen) return null;

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    setHasDrawn(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.beginPath();
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#1e293b";

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (canvas && hasDrawn && onSave) {
      const dataUrl = canvas.toDataURL("image/png");
      onSave(dataUrl);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 text-white border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col items-center animate-in zoom-in-95 duration-200">
        <div className="w-full flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <PenTool className="w-4 h-4 text-emerald-400" />
            {title}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-400 mb-2 w-full text-right">
          وقع بأصبعك داخل المربع أدناه للتمكين التوقيع الرقمي المعتمد:
        </p>

        {/* Signature Canvas */}
        <div className="w-full h-52 bg-white rounded-2xl border-2 border-dashed border-indigo-400/60 overflow-hidden relative touch-none">
          <canvas
            ref={canvasRef}
            width={400}
            height={208}
            onMouseDown={startDrawing}
            onMouseUp={stopDrawing}
            onMouseMove={draw}
            onTouchStart={startDrawing}
            onTouchEnd={stopDrawing}
            onTouchMove={draw}
            className="w-full h-full cursor-crosshair"
          />
          {!hasDrawn && (
            <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-xs pointer-events-none">
              ارسم التوقيع هنا...
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="w-full flex items-center justify-between mt-4 pt-3 border-t border-slate-800">
          <button
            onClick={clearCanvas}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-800"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            مسح والتوقيع مجدداً
          </button>

          <div className="flex items-center gap-2">
            <button onClick={onClose} className="text-xs text-slate-400 px-3 py-2 rounded-lg">
              إلغاء
            </button>
            <button
              onClick={handleSave}
              disabled={!hasDrawn}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-600/30"
            >
              <Check className="w-4 h-4" />
              اعتماد التوقيع ✍️
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
