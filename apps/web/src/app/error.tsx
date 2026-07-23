"use client";

import { useEffect } from "react";
import { Scale, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring service (Sentry, etc.)
    console.error("[LegalOS Error Boundary]", error);
  }, [error]);

  return (
    <div
      className="min-h-screen bg-surface text-on-surface flex flex-col items-center justify-center p-6 text-center"
      dir="rtl"
    >
      <div className="w-16 h-16 rounded-card bg-error/10 flex items-center justify-center mb-6">
        <Scale className="w-8 h-8 text-error" />
      </div>
      <h2 className="text-headline-lg text-primary mb-2">
        حدث خطأ غير متوقع
      </h2>
      <p className="text-body-md text-on-surface-variant mb-2 max-w-md">
        عذراً، حدث خطأ أثناء تحميل هذه الصفحة. فريقنا التقني تم إشعاره تلقائياً.
      </p>
      {error.digest && (
        <p className="text-label-sm text-on-surface-variant mb-6 font-tabular">
          رمز الخطأ: {error.digest}
        </p>
      )}
      <button
        onClick={reset}
        className="btn-primary inline-flex items-center gap-2"
      >
        <RefreshCw className="w-4 h-4" />
        إعادة المحاولة
      </button>
    </div>
  );
}
