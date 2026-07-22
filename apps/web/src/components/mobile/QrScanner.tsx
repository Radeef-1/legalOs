"use client";

import React, { useState } from "react";
import { QrCode, X, CheckCircle2 } from "lucide-react";

interface QrScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanResult?: (code: string) => void;
}

export function QrScanner({ isOpen, onClose, onScanResult }: QrScannerProps) {
  const [scannedCode, setScannedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const simulateScan = () => {
    const mockCaseCode = "SRCH-CASE-2026-9901";
    setScannedCode(mockCaseCode);
    if (onScanResult) {
      setTimeout(() => {
        onScanResult(mockCaseCode);
        onClose();
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 text-white flex flex-col justify-between p-4 animate-in fade-in duration-200">
      <div className="flex items-center justify-between z-10">
        <h3 className="font-bold text-base flex items-center gap-2">
          <QrCode className="w-5 h-5 text-indigo-400" />
          ماسح رموز الـ QR للقضايا والعملاء
        </h3>
        <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="relative flex-1 flex flex-col items-center justify-center my-4 rounded-2xl border-2 border-indigo-500/50 bg-slate-950 p-6">
        {!scannedCode ? (
          <>
            <div className="w-64 h-64 border-4 border-indigo-500 rounded-3xl relative flex items-center justify-center bg-indigo-500/10 shadow-2xl animate-pulse">
              <div className="w-full h-1 bg-indigo-400 absolute top-1/2 shadow-lg shadow-indigo-400/80 animate-bounce" />
              <QrCode className="w-24 h-24 text-indigo-400/40" />
            </div>
            <p className="text-xs text-slate-400 mt-6">وجه كاميرا الجوال نحو رمز الـ QR المطبوع على ملف القضية</p>
            <button
              onClick={simulateScan}
              className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg"
            >
              اختبار قراءة الرمز 📸
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 animate-bounce" />
            <h4 className="font-bold text-base text-white">تم تمييز القضية بنجاح!</h4>
            <span className="bg-emerald-500/20 text-emerald-300 font-mono font-bold px-4 py-1.5 rounded-lg border border-emerald-500/30 text-sm">
              {scannedCode}
            </span>
            <p className="text-xs text-slate-400">جاري فتح تفاصيل الملف تلقائياً...</p>
          </div>
        )}
      </div>
    </div>
  );
}
