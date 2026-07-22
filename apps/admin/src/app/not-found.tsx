"use client";

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center" dir="rtl">
      <h2 className="text-2xl font-bold text-amber-400 mb-2">404 - الصفحة غير موجودة</h2>
      <p className="text-slate-400 text-sm mb-6">عذراً، الصفحة التي تبحث عنها غير متاحة في لوحة التحكم.</p>
      <Link href="/" className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition">
        العودة للرئيسية
      </Link>
    </div>
  );
}
