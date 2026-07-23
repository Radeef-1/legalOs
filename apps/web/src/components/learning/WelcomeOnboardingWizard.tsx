"use client";

import React, { useState } from "react";
import { CheckCircle2, Circle, Sparkles, X, ChevronLeft, Building2, ShieldCheck, ArrowRight } from "lucide-react";

interface StepItem {
  stepKey: string;
  label: string;
  completed: boolean;
}

export function WelcomeOnboardingWizard() {
  const [isOpen, setIsOpen] = useState(true);
  const [steps, setSteps] = useState<StepItem[]>([
    { stepKey: "create_firm", label: "1️⃣ إنشاء وتأسيس المكتب", completed: true },
    { stepKey: "invite_lawyers", label: "2️⃣ دعوة فريق المحامين والمستشارين", completed: true },
    { stepKey: "upload_logo", label: "3️⃣ رفع شعار وترويسة المكتب", completed: true },
    { stepKey: "create_first_case", label: "4️⃣ تسجيل وإنشاء أول قضية تجارية", completed: true },
    { stepKey: "add_first_client", label: "5️⃣ إضافة ملف أول موكل رسمياً", completed: true },
    { stepKey: "send_invite", label: "6️⃣ إرسال دعوة انضمام آمنة 32-bit", completed: true },
    { stepKey: "test_portal", label: "7️⃣ معاينة بوابة الموكلين التفاعلية", completed: true },
    { stepKey: "setup_sms", label: "8️⃣ ربط توثيق الـ OTP وقناة SMS", completed: true },
    { stepKey: "complete_profile", label: "9️⃣ استكمال بيانات ترخيص وزارة العدل", completed: true },
    { stepKey: "ready", label: "🔟 جاهز للتشغيل الكامل والتنفيذ 🟢", completed: true },
  ]);

  if (!isOpen) return null;

  const completedCount = steps.filter((s) => s.completed).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  const toggleStep = (stepKey: string) => {
    setSteps((prev) =>
      prev.map((s) => (s.stepKey === stepKey ? { ...s, completed: !s.completed } : s))
    );
  };

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-card p-6 shadow-level-2 mb-6" dir="rtl">
      <div className="flex items-center justify-between border-b border-outline-variant pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-card bg-secondary text-on-secondary flex items-center justify-center font-bold shadow-md">
            <Sparkles className="w-5 h-5 text-on-secondary" />
          </div>
          <div>
            <h2 className="text-title-md font-bold text-primary flex items-center gap-2">
              <span>مرحباً بك في منصة التشغيل القانوني (LegalOS Onboarding)</span>
              <span className="text-[10px] bg-secondary/10 text-secondary border border-secondary/20 px-2 py-0.5 rounded-pill font-bold">
                10/10 إعداد متكامل
              </span>
            </h2>
            <p className="text-label-sm text-on-surface-variant font-body">
              قائمة التهيئة السريعة لتشغيل المكتب بالكامل في أقل من 10 دقائق
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(false)}
          className="p-1 hover:bg-surface-container-low rounded-soft text-on-surface-variant"
          title="إغلاق المعالج"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2 mb-6">
        <div className="flex items-center justify-between text-label-sm font-bold text-primary">
          <span>نسبة جاهزية المكتب والمنظومة</span>
          <span className="font-tabular text-secondary">{progressPercent}% مكتمل</span>
        </div>
        <div className="w-full bg-surface-container-high h-2.5 rounded-pill overflow-hidden">
          <div
            className="bg-secondary h-full transition-all duration-500 rounded-pill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 10 Step Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {steps.map((step) => (
          <div
            key={step.stepKey}
            onClick={() => toggleStep(step.stepKey)}
            className={`p-3 rounded-card border transition flex items-center justify-between cursor-pointer ${
              step.completed
                ? "bg-emerald-500/5 border-emerald-500/30 text-emerald-950 font-bold"
                : "bg-surface-container-low border-outline-variant text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            <span className="text-body-md text-xs">{step.label}</span>
            {step.completed ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <Circle className="w-5 h-5 text-outline-variant shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
