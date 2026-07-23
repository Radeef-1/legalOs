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
  Scale,
  Building2,
  FileCheck,
  ShieldCheck,
  X,
} from "lucide-react";

export default function LearningAdoptionHubPage() {
  const [activeTab, setActiveTab] = useState<"TOURS" | "ACADEMY" | "DOCS" | "CERTIFICATION">("TOURS");
  const [activeTour, setActiveTour] = useState<any>(null);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);

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
    {
      id: "tour-branding",
      title: "جولة التخصيص الفوري للهوية (White Label)",
      description: "طريقة ضبط ألوان المكتب، الشعار، التوقيع، والختم الرسمي بدقة.",
      duration: "2 دقيقة",
      stepsCount: 5,
      steps: [
        { stepIndex: 1, title: "تغيير الألوان والشعار", description: "حقن متغيرات الـ CSS الفورية وتطبيق الثيم المخصص." },
      ],
    },
    {
      id: "tour-zatca",
      title: "جولة المالية وإقرارات ZATCA المرحلة الثانية",
      description: "خطوات الفوترة الضريبية الإلكترونية وإصدار الفواتير المعتمدة بـ QR Code.",
      duration: "2.5 دقيقة",
      stepsCount: 5,
      steps: [
        { stepIndex: 1, title: "إصدار الفاتورة الإلكترونية", description: "مزامنة التوقيع الضريبي والربط مع الهيئة." },
      ],
    },
    {
      id: "tour-portal",
      title: "جولة تجربة بوابة الموكلين المستقلة",
      description: "معاينة ما يراه العميل عند استعراض قضاياه وسداد الفواتير أونلاين.",
      duration: "2 دقيقة",
      stepsCount: 4,
      steps: [
        { stepIndex: 1, title: "بوابة الموكل", description: "واجهة آمنة تمكن الموكل من رفع المستندات ومتابعة الجلسات." },
      ],
    },
  ];

  const videosList = [
    { title: "كيفية تسجيل قضية عمالية ومتابعة جلسات التسوية عبر ناجز وتراضي", duration: "3:45", module: "القضايا العمالية" },
    { title: "خطوات توثيق وتوليد دعوات المحامين والموكلين المشفرة 32-bit", duration: "2:30", module: "إدارة الدعوات" },
    { title: "تخصيص الهوية البصرية، الألوان، وترويسة التقارير والختم المعتمد", duration: "4:10", module: "الهوية البصرية" },
    { title: "استخدام المساعد القانوني الذكي في صياغة العقود ولوائح الاعتراض", duration: "5:00", module: "الذكاء الاصطناعي" },
  ];

  const knowledgeArticles = [
    {
      id: "art-1",
      title: "دليل الإجراءات الشامل للمحكمة التجارية واللوائح التنفيذية 2026",
      category: "المحكمة التجارية",
      readTime: "4 دقائق",
      tags: ["تجارية", "ناجز", "لوائح"],
      content: `
# دليل الإجراءات الشامل للمحكمة التجارية ⚖️

تعد الدعاوى التجارية من أهم ركائز العمل القانوني للمكاتب والشركات في المملكة العربية السعودية.

## خطوات تقديم صحيفة الدعوى التجارية عبر ناجز:
1. **التحقق من الاختصاص**: التأكد من أن النزاع بين تاجرين أو يتصل بأعمال تجارية مساندة وفق المادة 16 من نظام المحاكم التجارية.
2. **صياغة المذكرة الجوابية**: تضمين الوقائع، الأسانيد الشرعية والنظامية، وطلبات المدعي المحددة بدقة.
3. **مراعاة مدد اللائحة التنفيذية**: الالتزام بالمهل المحددة لإيداع المذكرات والاعتراضات (30 يوماً من تاريخ صدور الحكم).
      `,
    },
    {
      id: "art-2",
      title: "دليل الامتثال لنظام حماية البيانات الشخصية السعودي (PDPL 2026)",
      category: "الأمان والامتثال",
      readTime: "5 دقائق",
      tags: ["PDPL", "امتثال", "أمان"],
      content: `
# دليل الامتثال لنظام حماية البيانات الشخصية (PDPL) 🛡️

يهدف نظام حماية البيانات الشخصية الصادر بالمرسوم الملكي إلى حماية سرية بيانات الموكلين والقضايا.

## التزامات مكتب المحاماة:
- **التشفير الإجباري**: تشفير سرية وثائق وقضايا الموكلين بأسلوب AES-256 و 32-bit Encrypted Invites.
- **تحديد الصلاحيات (Least Privilege)**: حصر الاطلاع على الملفات للمحامين المكلفين بالقضية فقط.
      `,
    },
    {
      id: "art-3",
      title: "دليل الفواتير الإلكترونية والربط مع هيئة الزكاة (ZATCA Phase 2)",
      category: "المالية والضريبة",
      readTime: "3 دقائق",
      tags: ["ZATCA", "فواتير", "ضريبة"],
      content: `
# دليل إقرار الفواتير الإلكترونية ZATCA Phase 2 🧾

ربط الفواتير الصادرة من مكتب المحاماة مع منصة هيئة الزكاة والضريبة والجمارك.

## متطلبات الفاتورة الضريبية المبسطة والمعتمدة:
1. **رمز الاستجابة السريعة (QR Code)**: تضمين التوقيع الرقمي والـ Hash المشفر.
2. **الربط المباشر API**: إرسال الإشعار والتسجيل التلقائي للمبيعات والخدمات القانونية.
      `,
    },
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
              <span>الجولات التفاعلية والدروس المهام (Interactive Tours)</span>
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
              <span>مركز المعرفة والأدلة النظامية (Notion Docs)</span>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {videosList.map((video, idx) => (
                <div key={idx} className="p-4 rounded-card bg-surface-container-lowest border border-outline-variant space-y-3 shadow-level-1">
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

          {/* TAB 3: Knowledge Base (Notion Docs) */}
          {activeTab === "DOCS" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {knowledgeArticles.map((art) => (
                <div
                  key={art.id}
                  onClick={() => setSelectedArticle(art)}
                  className="p-5 rounded-card bg-surface-container-lowest border border-outline-variant space-y-3 shadow-level-1 hover:border-secondary transition cursor-pointer"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-secondary">
                    <span>{art.category}</span>
                    <span className="text-on-surface-variant">{art.readTime}</span>
                  </div>
                  <h3 className="text-title-md font-bold text-primary">{art.title}</h3>
                  <div className="flex gap-1 flex-wrap">
                    {art.tags.map((tag) => (
                      <span key={tag} className="text-[10px] bg-surface-container-low text-on-surface-variant px-2 py-0.5 rounded-pill font-bold">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <div className="text-xs text-secondary font-bold flex items-center gap-1 pt-2">
                    <span>قراءة واستعراض الدليل</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: Certifications */}
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

      {/* Article Viewer Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-card p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto space-y-4 shadow-level-2" dir="rtl">
            <div className="flex items-center justify-between border-b border-outline-variant pb-3">
              <h3 className="text-title-md font-bold text-primary">{selectedArticle.title}</h3>
              <button onClick={() => setSelectedArticle(null)} className="p-1 hover:bg-surface-container-low rounded-soft text-on-surface-variant">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="prose text-body-md text-on-surface whitespace-pre-wrap font-body text-sm leading-relaxed">
              {selectedArticle.content}
            </div>
          </div>
        </div>
      )}

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
