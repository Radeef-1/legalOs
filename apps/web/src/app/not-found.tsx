"use client";

import Link from 'next/link';
import { Scale } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col items-center justify-center p-6 text-center" dir="rtl">
      <div className="w-16 h-16 rounded-card bg-primary flex items-center justify-center mb-6">
        <Scale className="w-8 h-8 text-on-primary" />
      </div>
      <h2 className="text-headline-lg text-primary mb-2">404 - الصفحة غير موجودة</h2>
      <p className="text-body-md text-on-surface-variant mb-6">عذراً، الصفحة التي تبحث عنها غير متاحة في النظام.</p>
      <Link href="/" className="btn-primary inline-flex items-center gap-2">
        العودة للرئيسية
      </Link>
    </div>
  );
}
