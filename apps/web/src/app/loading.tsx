import React from "react";
import { Scale } from "lucide-react";

export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col items-center justify-center p-6 text-center" dir="rtl">
      <div className="w-16 h-16 rounded-card bg-primary/10 flex items-center justify-center mb-4 animate-pulse">
        <Scale className="w-8 h-8 text-primary animate-bounce" />
      </div>
      <p className="text-body-md font-semibold text-primary">جاري تحميل منصة LegalOS...</p>
      <p className="text-label-sm text-on-surface-variant mt-1">الرجاء الانتظار قليلاً</p>
    </div>
  );
}
