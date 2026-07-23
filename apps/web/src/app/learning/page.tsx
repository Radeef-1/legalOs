"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { WelcomeOnboardingWizard } from "@/components/learning/WelcomeOnboardingWizard";
import { ProductTourOverlay } from "@/components/learning/ProductTourOverlay";
import { InteractiveSandboxBanner } from "@/components/learning/InteractiveSandboxBanner";
import { AiLegalMentorWidget } from "@/components/learning/AiLegalMentorWidget";
import {
  Sparkles,
  BookOpen,
  PlayCircle,
  Award,
  CheckCircle2,
  Compass,
  FileText,
  Video,
  Search,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

export default function LearningAdoptionHubPage() {
  const [activeTab, setActiveTab] = useState<"TOURS" | "ACADEMY" | "DOCS" | "CERTIFICATION">("TOURS");
  const [activeTour, setActiveTour] = useState<any>(null);

  const toursList = [
    {
      id: "tour-dashboard",
      title: "جولة اللوحة الرئيسية ومركز التشغيل",
      description: "تعرف على مؤشرات الأداء، التنبيهات الحية، والوصول السريع للجلسات والإنذارات.",
      duration: "2 دقيقة",
      stepsCount: 5,
      steps: [
        { stepIndex: 1, title: "شريط الترويسة والتنبيهات", description: "شريط التنقل العلوي يعرض صحة المنشأة والتنبيهات الفورية." },
        { stepIndex: 2, title: "القائمة الجانبية وإدارة المكتب", description: "يمكنك التنقل بين القضايا والتقويم والمكاتب من القائمة الجانبية." },
        { stepIndex: 3, title: "مؤشرات الإنجاز والجلسات", description: "البطاقات الملونة تعرض ملخص الجلسات القادمة وإيرادات المكتب." },
      ],
    },
    {
      id: "tour-cases",
      title: "جولة إدارة القضايا وتوزيع المهام",
      description: "طريقة تسجيل قضايا جديدة، ربط الموكلين، وتعيين الفريق المسؤول.",
      duration: "3 دقائق",
      stepsCount: 6,
      steps: [
        { stepIndex: 1, title: "جدول القضايا المباشر", description: "جدول تفاعلي مع خيارات التصفية بالنوع والحالة." },
        { stepIndex: 2, title: "زر تسجيل قضية جديدة", description: "اضغط على هذا الزر لفتح نموذج إدخال القضية والمحكمة." },
      ],
    },
    {
      id: "tour-invitations",
      title: "جولة محرك الدعوات والعضويات 32-bit",
      description: "شرح كيفية إنشاء وإرسال الدعوات المخصصة المشفرة 32-bit لـ 5 أنواع من المستخدمين.",
      duration: "1.5 دقيقة",
      stepsCount: 4,
      steps: [
        { stepIndex: 1, title: "إنشاء دعوة جديدة", description: "اختر نوع الدعوة (محامي، موكل، موظف) وحدد القناة." },
      ],
    },
  ];

  const videosList = [
    { title: "كيف تنشئ قضية وتصنفها حسب المحكمة؟", duration: "3:45", module: "القضايا" },
    { title: "شرح آلية توثيق OTP ودعوة الموكلين عبر الرسائل النصية", duration: "2:30", module: "الدعوات" },
    { title: "ربط الفواتير وإقرارات ZATCA الضريبية", duration: "4:15", module: "المالية" },
  ];

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col font-heading" dir="rtl">
      {/* Top Banner */}
      <header className="sticky top-0 z-40 bg-surface-container-lowest border-b border-outline-variant px-6 py-3.5 flex items-center justify-between shadow-level-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-card bg-primary text-on-primary flex items-center justify-center font-bold shadow-level-1">
            <Sparkles className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h1 className="text-title-md font-bold text-primary flex items-center gap-2">
              <span>منصة التعلم والتوجيه التفاعلي واعتماد المنتج (Digital Adoption Platform)</span>
              <span className="text-[10px] bg-secondary/10 text-secondary border border-secondary/20 px-2 py-0.5 rounded-pill font-bold">
                DAP v11
              </span>
            </h1>
            <p className="text-label-sm text-on-surface-variant font-body">
              مكتب العتيبي للمحاماة والاستشارات القانونية والشرعية
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <InteractiveSandboxBanner />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Welcome Onboarding Checklist Component */}
          <WelcomeOnboardingWizard />

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-outline-variant pb-3 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab("TOURS")}
              className={`px-4 py-2 rounded-card text-label-md font-bold transition flex items-center gap-2 ${
                activeTab === "TOURS"
                  ? "bg-primary text-white shadow-level-1"
                  : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              <Compass className="w-4 h-4 text-secondary" />
              <span>الجولات التفاعلية والدروس المهام</span>
            </button>

            <button
              onClick={() => setActiveTab("ACADEMY")}
              className={`px-4 py-2 rounded-card text-label-md font-bold transition flex items-center gap-2 ${
                activeTab === "ACADEMY"
                  ? "bg-primary text-white shadow-level-1"
                  : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              <Video className="w-4 h-4 text-emerald-500" />
              <span>أكاديمية الفيديو (Video Academy)</span>
            </button>

            <button
              onClick={() => setActiveTab("DOCS")}
              className={`px-4 py-2 rounded-card text-label-md font-bold transition flex items-center gap-2 ${
                activeTab === "DOCS"
                  ? "bg-primary text-white shadow-level-1"
                  : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              <BookOpen className="w-4 h-4 text-blue-500" />
              <span>مركز المعرفة والتطبيق (Knowledge Docs)</span>
            </button>

            <button
              onClick={() => setActiveTab("CERTIFICATION")}
              className={`px-4 py-2 rounded-card text-label-md font-bold transition flex items-center gap-2 ${
                activeTab === "CERTIFICATION"
                  ? "bg-primary text-white shadow-level-1"
                  : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              <Award className="w-4 h-4 text-amber-500" />
              <span>الشهادات الرقمية (Certifications)</span>
            </button>
          </div>

          {/* TAB 1: Product Tours & Task-based Tutorials */}
          {activeTab === "TOURS" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {toursList.map((tour) => (
                <div
                  key={tour.id}
                  className="gestalt-card p-5 rounded-card bg-surface-container-lowest border border-outline-variant space-y-3 shadow-level-1 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-secondary">
                      <span>{tour.duration}</span>
                      <span className="bg-secondary/10 px-2 py-0.5 rounded-pill">{tour.stepsCount} خطوات</span>
                    </div>
                    <h3 className="text-title-md font-bold text-primary">{tour.title}</h3>
                    <p className="text-body-md text-xs text-on-surface-variant leading-relaxed font-body">
                      {tour.description}
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveTour(tour)}
                    className="btn-primary text-xs w-full flex items-center justify-center gap-2 shadow-level-1"
                  >
                    <PlayCircle className="w-4 h-4" />
                    <span>بدء الجولة التفاعلية الحية</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: Video Academy */}
          {activeTab === "ACADEMY" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {videosList.map((video, idx) => (
                <div key={idx} className="p-4 rounded-card bg-surface-container-lowest border border-outline-variant space-y-3">
                  <div className="w-full h-36 bg-primary/10 rounded-card border border-outline-variant flex items-center justify-center text-primary relative">
                    <PlayCircle className="w-12 h-12 text-secondary opacity-80 hover:opacity-100 transition cursor-pointer" />
                    <span className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-pill font-tabular">
                      {video.duration}
                    </span>
                  </div>
                  <h4 className="text-label-md font-bold text-primary">{video.title}</h4>
                  <span className="text-[11px] bg-surface-container-low px-2 py-0.5 rounded-pill font-bold text-on-surface-variant">
                    قسم: {video.module}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: Certifications */}
          {activeTab === "CERTIFICATION" && (
            <div className="p-8 rounded-card bg-surface-container-lowest border border-outline-variant space-y-6 text-center max-w-2xl mx-auto shadow-level-1">
              <div className="w-16 h-16 rounded-pill bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
                <Award className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-title-lg font-bold text-primary">مستخدم معتمد بنظام LegalOS (Certified Power User)</h3>
                <p className="text-body-md text-xs text-on-surface-variant">
                  لقد أتممت كافة الدروس التفاعلية وقائمة تهيئة المكتب بنسبة <span className="font-bold text-emerald-700 font-tabular">100%</span>.
                </p>
              </div>
              <div className="p-4 rounded-card bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 text-label-md font-bold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>شهادة الكفاءة والجاهزية الإلكترونية مفعلة 🟢</span>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Product Tour Overlay Modal */}
      {activeTour && (
        <ProductTourOverlay
          isOpen={Boolean(activeTour)}
          onClose={() => setActiveTour(null)}
          tourTitle={activeTour.title}
          steps={activeTour.steps}
        />
      )}

      {/* Floating AI Legal Mentor Widget */}
      <AiLegalMentorWidget />
    </div>
  );
}
