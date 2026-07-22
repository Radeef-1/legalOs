"use client";

import React, { useState, useEffect } from "react";
import { WifiOff, RefreshCw } from "lucide-react";

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    if (typeof window !== "undefined") {
      setIsOffline(!navigator.onLine);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="bg-amber-600 text-white text-xs font-semibold px-4 py-2 flex items-center justify-between shadow-md z-50 animate-in slide-in-from-top duration-300">
      <div className="flex items-center gap-2">
        <WifiOff className="w-4 h-4 text-amber-200 animate-pulse" />
        <span>أنت تعمل الآن بدون إنترنت (وضع Offline) — التغييرات تحفظ محلياً وستزامن عند عودة الاتصال</span>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="flex items-center gap-1 bg-amber-700 hover:bg-amber-800 px-2 py-1 rounded text-[11px] transition-colors"
      >
        <RefreshCw className="w-3 h-3" />
        إعادة فحص
      </button>
    </div>
  );
}
