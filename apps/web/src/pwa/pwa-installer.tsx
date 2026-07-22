"use client";

import React, { useState, useEffect } from "react";
import { Download, X, Smartphone, Check } from "lucide-react";

export function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then((reg) => console.log("[PWA] Service Worker registered with scope:", reg.scope))
        .catch((err) => console.log("[PWA] Service Worker registration failed:", err));
    }

    // 2. Listen for BeforeInstallPromptEvent
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // 3. Check if already installed / standalone
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      console.log("[PWA] User accepted PWA installation");
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  if (!showPrompt || isInstalled) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/40 text-white p-4 rounded-2xl shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
            <Smartphone className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">تثبيت تطبيق LegalOS للجوال</h4>
            <p className="text-xs text-slate-300 mt-0.5">تصفح قضاياك بسرعة وسهولة وبدون إنترنت</p>
          </div>
        </div>
        <button
          onClick={() => setShowPrompt(false)}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 flex items-center justify-end gap-2">
        <button
          onClick={() => setShowPrompt(false)}
          className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg"
        >
          لاحقاً
        </button>
        <button
          onClick={handleInstallClick}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
        >
          <Download className="w-3.5 h-3.5" />
          تثبيت التطبيق الآن
        </button>
      </div>
    </div>
  );
}
