"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Building2,
  FileText,
  CreditCard,
  CheckCircle2,
  Clock,
  Calendar,
  MessageSquare,
  Sparkles,
  ExternalLink,
  Eye,
  Share2,
  Lock,
  RefreshCw,
  Send,
  Bot,
  Video,
  Plus,
  ArrowUpRight,
  Check,
  X,
  Search,
  UserCheck,
  User,
  Scale,
  DollarSign,
  PhoneCall,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  LayoutDashboard,
  Briefcase,
  Kanban,
  Workflow,
  BarChart3,
  Globe,
  Play,
  Award,
  Users,
  Shield,
  Zap,
  TrendingUp,
  Layers,
  Settings,
  HelpCircle,
  FileCheck,
  CheckCircle,
  Smartphone,
  Laptop,
  ArrowLeft,
} from "lucide-react";

export default function EnterpriseLandingPage() {
  const router = useRouter();

  // Active Product Tour Tab State
  const [activeTourTab, setActiveTourTab] = useState<string>("dashboard");

  // Video Tour Modal State
  const [videoModalOpen, setVideoModalOpen] = useState<boolean>(false);

  // FAQ Accordion Toggle State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col font-heading" dir="rtl">
      {/* 01. Sticky Top Highlights & Value Banner */}
      <div className="bg-gradient-to-r from-primary via-indigo-900 to-secondary text-on-primary px-3 py-1.5 text-center text-[11px] sm:text-label-sm font-semibold flex items-center justify-center gap-2 sm:gap-4 flex-wrap overflow-hidden">
        <span className="flex items-center gap-1 shrink-0">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          دعم العربية 100%
        </span>
        <span className="hidden sm:inline">•</span>
        <span className="flex items-center gap-1 shrink-0">
          <Smartphone className="w-3.5 h-3.5 text-cyan-300" />
          متوافق مع الجوال الـ PWA
        </span>
        <span className="hidden sm:inline">•</span>
        <span className="hidden md:flex items-center gap-1 shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
          استضافة سحابية آمنة (امتثال PDPL)
        </span>
      </div>

      {/* 02. Navigation Header */}
      <header className="sticky top-0 z-50 bg-surface-container-lowest/95 backdrop-blur-md border-b border-outline-variant px-3 sm:px-6 py-2.5 flex items-center justify-between shadow-level-1 max-w-full overflow-hidden">
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-card bg-primary text-on-primary font-bold flex items-center justify-center text-xs sm:text-lg shadow-level-1 shrink-0">
            LegalOS
          </div>
          <div>
            <h1 className="text-body-md sm:text-title-md font-bold text-primary flex items-center gap-1.5">
              <span>LegalOS</span>
              <span className="hidden sm:inline font-bold">Enterprise</span>
              <span className="text-[9px] sm:text-[10px] bg-primary/10 text-primary border border-primary/20 px-1.5 sm:px-2 py-0.5 rounded-pill font-body font-bold shrink-0">
                v5.0
              </span>
            </h1>
          </div>
        </div>

        {/* Quick Action Navigation Links & CTAs */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => router.push("/auth/login")}
            className="btn-secondary text-xs sm:text-label-md py-1.5 sm:py-2 px-2.5 sm:px-4 hover:bg-surface-container-high font-semibold shrink-0"
          >
            تسجيل الدخول
          </button>
          <button
            onClick={() => router.push("/onboarding")}
            className="btn-primary text-xs sm:text-label-md py-1.5 sm:py-2.5 px-3 sm:px-5 rounded-soft shadow-level-1 font-bold flex items-center gap-1.5 shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse hidden sm:inline" />
            <span>تجربة مجانية</span>
          </button>
        </div>
      </header>

      {/* 03. SECTION 1: HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-surface-container-lowest via-surface-container-low to-surface-container-lowest py-16 md:py-24 px-6 border-b border-outline-variant">
        <div className="max-w-6xl mx-auto space-y-10 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-pill text-label-md text-primary font-bold shadow-level-1 animate-bounce">
            <Award className="w-4 h-4 text-primary" />
            <span>نظام التشغيل الرقمي المعتمد لمكاتب المحاماة في المملكة</span>
          </div>

          <h1 className="text-headline-md md:text-headline-lg font-extrabold text-primary leading-tight max-w-4xl mx-auto">
            إدارة مكتبك القانوني باحترافية كاملة... <br />
            <span className="bg-gradient-to-r from-blue-700 via-indigo-600 to-emerald-600 bg-clip-text text-transparent">
              من أول قضية حتى آخر فاتورة معتمدة.
            </span>
          </h1>

          <p className="text-body-lg text-on-surface-variant font-body max-w-3xl mx-auto leading-relaxed">
            منصة SaaS متكاملة تجمع بين إدارة القضايا، بوابة الموكلين التفاعلية، المرشد القانوني الذكي (AI Copilot)، الربط المباشر مع ناجز و ZATCA، والامتثال التام لنظام حماية البيانات الشخصية (PDPL).
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => router.push("/onboarding")}
              className="btn-primary text-title-sm py-3.5 px-8 rounded-card shadow-level-2 font-bold flex items-center gap-3 hover:scale-105 transition-all"
            >
              <span>ابدأ رحلة اعتماد وتأهيل مكتبك الآن</span>
              <ArrowLeft className="w-5 h-5" />
            </button>

            <button
              onClick={() => setVideoModalOpen(true)}
              className="btn-secondary text-title-sm py-3.5 px-7 rounded-card font-bold flex items-center gap-2 hover:bg-surface-container-high transition-all"
            >
              <Play className="w-5 h-5 text-primary fill-primary" />
              <span>شاهد العرض المباشر (90 ثانية)</span>
            </button>
          </div>

          {/* Live Metrics Counter */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-outline-variant">
            <div className="p-4 rounded-card bg-surface-container-lowest border border-outline-variant space-y-1">
              <p className="text-title-lg font-bold text-primary font-tabular">+300 قضية</p>
              <p className="text-label-sm text-on-surface-variant font-body">مدارة يومياً بالنظام</p>
            </div>
            <div className="p-4 rounded-card bg-surface-container-lowest border border-outline-variant space-y-1">
              <p className="text-title-lg font-bold text-emerald-700 font-tabular">99.98%</p>
              <p className="text-label-sm text-on-surface-variant font-body">جاهزية واستقرار السيرفرات</p>
            </div>
            <div className="p-4 rounded-card bg-surface-container-lowest border border-outline-variant space-y-1">
              <p className="text-title-lg font-bold text-secondary font-tabular">+500,000</p>
              <p className="text-label-sm text-on-surface-variant font-body">مستند وعقد مفهرس</p>
            </div>
            <div className="p-4 rounded-card bg-surface-container-lowest border border-outline-variant space-y-1">
              <p className="text-title-lg font-bold text-purple-700 font-tabular">40%</p>
              <p className="text-label-sm text-on-surface-variant font-body">توفير في وقت الكادر التشغيلي</p>
            </div>
          </div>

          {/* Hero Device Preview Mockup */}
          <div className="relative pt-8 max-w-5xl mx-auto">
            <div className="rounded-card border-4 border-slate-900 shadow-level-3 overflow-hidden bg-slate-950">
              <div className="bg-slate-900 px-4 py-2 flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 font-tabular">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                  <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                  <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                  <span className="mr-2">https://app.legalos.sa/dashboard</span>
                </div>
                <span>الشركة: مكتب السلمان للمحاماة</span>
              </div>

              {/* Dashboard Content Mockup */}
              <div className="p-6 bg-surface text-on-surface text-right space-y-6">
                <div className="flex items-center justify-between border-b border-outline-variant pb-4">
                  <div>
                    <h3 className="text-title-md font-bold text-primary">لوحة التحكم القيادية لمكتب المحاماة</h3>
                    <p className="text-label-sm text-on-surface-variant font-body">متابعة لحظية للقضايا، الجلسات، الفواتير، ونشاط الفريق</p>
                  </div>
                  <span className="badge-success text-label-sm">النظام ساري ومحدث 🟢</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-card bg-surface-container-low border border-outline-variant space-y-1">
                    <span className="text-label-sm text-on-surface-variant font-semibold">إجمالي القضايا القائمة</span>
                    <p className="text-title-lg font-bold text-primary font-tabular">28 قضية نشطة</p>
                  </div>
                  <div className="p-4 rounded-card bg-surface-container-low border border-outline-variant space-y-1">
                    <span className="text-label-sm text-on-surface-variant font-semibold">الجلسات القادمة هذا الأسبوع</span>
                    <p className="text-title-lg font-bold text-secondary font-tabular">6 جلسات تجارية</p>
                  </div>
                  <div className="p-4 rounded-card bg-surface-container-low border border-outline-variant space-y-1">
                    <span className="text-label-sm text-on-surface-variant font-semibold">إجمالي التحصيل المالي</span>
                    <p className="text-title-lg font-bold text-emerald-700 font-tabular">184,500 ر.س</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 04. SECTION 2: TRUSTED BY */}
      <section className="py-12 px-6 bg-surface-container-low border-b border-outline-variant">
        <div className="max-w-6xl mx-auto space-y-6 text-center">
          <p className="text-label-md font-bold text-on-surface-variant uppercase tracking-wider">
            يثق بنا كبرى مكاتب المحاماة والشركات القانونية في المملكة العربية السعودية
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-85">
            <span className="text-title-md font-bold text-primary">🏛️ مكتب السلمان للمحاماة</span>
            <span className="text-title-md font-bold text-emerald-800">⚖️ شركة العدل والتميز</span>
            <span className="text-title-md font-bold text-purple-800">🏢 شركة الخبراء القانونية</span>
            <span className="text-title-md font-bold text-blue-900">🛡️ التميمي والرويس محامون</span>
          </div>
        </div>
      </section>

      {/* 05. SECTION 3: PAIN VS SOLUTION */}
      <section className="py-20 px-6 bg-surface border-b border-outline-variant">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-headline-sm font-extrabold text-primary">
              لماذا يحتاج مكتبك إلى نظام LegalOS؟
            </h2>
            <p className="text-body-lg text-on-surface-variant font-body max-w-2xl mx-auto">
              توقف عن تشتيت العمل بين ملفات الورق والمحادثات المفقودة، وانتقل إلى نظام إداري مؤتمت بالكامل.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* The Pain Column */}
            <div className="card-level-1 p-6 md:p-8 rounded-card border-r-4 border-r-error space-y-4 bg-error/5">
              <h3 className="text-title-md font-bold text-error flex items-center gap-2">
                <X className="w-6 h-6 text-error" />
                المعاناة والتحديات اليومية بدون LegalOS:
              </h3>
              <ul className="space-y-3 text-body-md text-on-surface font-body">
                <li className="flex items-start gap-2 text-error">
                  <span>❌</span>
                  <span>ملفات وقضايا مفقودة وتأخر في الوصول إلى المستندات وقت الجلسة.</span>
                </li>
                <li className="flex items-start gap-2 text-error">
                  <span>❌</span>
                  <span>اتصالات وتساؤلات يومية مكررة من الموكلين لمعرفة مواعيد الجلسات.</span>
                </li>
                <li className="flex items-start gap-2 text-error">
                  <span>❌</span>
                  <span>انقضاء وتأخر في تجديد التراخيص أو السجلات التجارية دون تنبيه مبكر.</span>
                </li>
                <li className="flex items-start gap-2 text-error">
                  <span>❌</span>
                  <span>صعوبة تتبع أتعاب الخبراء والفواتير الضريبية ZATCA يدويًا.</span>
                </li>
              </ul>
            </div>

            {/* The Solution Column */}
            <div className="card-level-1 p-6 md:p-8 rounded-card border-r-4 border-r-emerald-600 space-y-4 bg-emerald-500/5">
              <h3 className="text-title-md font-bold text-emerald-700 flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                الحل الذكي والمؤتمت مع LegalOS:
              </h3>
              <ul className="space-y-3 text-body-md text-on-surface font-body">
                <li className="flex items-start gap-2 text-emerald-800">
                  <span>🟢</span>
                  <span>بوابة تفاعلية للموكلين يتابعون بها قضاياهم ومستنداتهم لحظياً دون الاتصال بالمكتب.</span>
                </li>
                <li className="flex items-start gap-2 text-emerald-800">
                  <span>🟢</span>
                  <span>مزامنة فورية للجلسات وتنبيهات حية قبل المواعيد عبر الـ SMS والواتساب.</span>
                </li>
                <li className="flex items-start gap-2 text-emerald-800">
                  <span>🟢</span>
                  <span>مرشد قانوني ذكي (AI Copilot) يحلل المستندات ويصيغ المذكرات بالأنظمة السعودية.</span>
                </li>
                <li className="flex items-start gap-2 text-emerald-800">
                  <span>🟢</span>
                  <span>ربط مباشر مع الفوترة الإلكترونية المرحلة الثانية ZATCA والـ 700 الموحد.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 06. SECTION 4: PRODUCT OVERVIEW CARDS */}
      <section className="py-20 px-6 bg-surface-container-low border-b border-outline-variant">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-headline-sm font-extrabold text-primary">
              منظومة شمولية تغطي كافة متطلبات العمل القانوني
            </h2>
            <p className="text-body-lg text-on-surface-variant font-body max-w-2xl mx-auto">
              محركات متكاملة صُممت خصيصاً لتلبي احتياجات المحامين والمستشارين والمدراء التنفيذيين.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "إدارة القضايا والترافع", icon: Briefcase, desc: "تتبع مسار الدعاوى التجارية والعمالية، المحاكم، والمراحل القضائية من شاشة واحدة." },
              { title: "بوابة الموكلين التفاعلية", icon: Globe, desc: "تمكين الموكلين من متابعة المواعيد، التوقيع الإلكتروني، والسداد المباشر." },
              { title: "المرشد القانوني الذكي (AI)", icon: Bot, desc: "محرك AI مدرب على الأنظمة السعودية لصياغة المذكرات وتلخيص الأحكام." },
              { title: "مركز المستندات والـ OCR", icon: FileText, desc: "أرشيف قانوني مشفر، قراءة الـ OCR الآلية، وتتبع النسخ التاريخية للمستندات." },
              { title: "التقويم ومواعيد المحاكم", icon: Calendar, desc: "مزامنة الجلسات والمهام والتنبيه التلقائي للمحامين قبل موعد الدائرة." },
              { title: "الفوترة الإلكترونية ZATCA", icon: CreditCard, desc: "إصدار الفواتير الضريبية المعتمدة وتشفير UBL 2.1 XML والسداد المباشر." },
            ].map((card, i) => (
              <div key={i} className="card-interactive p-6 rounded-card space-y-3 bg-surface-container-lowest border border-outline-variant">
                <div className="w-12 h-12 rounded-card bg-primary/10 text-primary flex items-center justify-center">
                  <card.icon className="w-6 h-6" />
                </div>
                <h3 className="text-title-md font-bold text-primary">{card.title}</h3>
                <p className="text-body-md text-on-surface-variant font-body leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 07. SECTION 5: INTERACTIVE PRODUCT TOUR (APPLE STYLE) */}
      <section className="py-20 px-6 bg-surface border-b border-outline-variant">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 bg-secondary/10 border border-secondary/20 px-3.5 py-1 rounded-pill text-label-sm text-secondary font-bold">
              <Sparkles className="w-4 h-4" />
              <span>جولة المنتج التفاعلية (Apple Style Interactive Tour)</span>
            </div>
            <h2 className="text-headline-sm font-extrabold text-primary">
              استكشف تجربة الاستخدام الفعلية للنظام
            </h2>
          </div>

          {/* Interactive Tour Tabs Switcher */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto no-scrollbar p-2 bg-surface-container-low rounded-card border border-outline-variant">
            {[
              { id: "dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
              { id: "cases", label: "إدارة القضايا", icon: Briefcase },
              { id: "portal", label: "بوابة الموكلين", icon: Globe },
              { id: "ai", label: "المرشد الذكي AI", icon: Bot },
              { id: "documents", label: "المستندات OCR", icon: FileText },
              { id: "reports", label: "التقارير والـ ZATCA", icon: BarChart3 },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTourTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTourTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-soft text-label-md transition-all font-bold whitespace-nowrap ${
                    isActive
                      ? "bg-primary text-on-primary shadow-level-1"
                      : "text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Interactive Tour Content Preview */}
          <div className="p-6 md:p-8 rounded-card bg-surface-container-lowest border border-outline-variant space-y-6 shadow-level-2">
            {activeTourTab === "dashboard" && (
              <div className="space-y-4">
                <h3 className="text-title-lg font-bold text-primary">لوحة التحليلات القيادية والمؤشرات اللحظية</h3>
                <p className="text-body-md text-on-surface-variant font-body">
                  رؤية شاملة وإحصائيات مباشرة لكل ما يحدث داخل المكتب: إجمالي القضايا النشطة، التحصيل المالي، مواعيد الجلسات، ونشاط المحامين.
                </p>
                <div className="p-4 rounded-card bg-surface-container-low border border-outline-variant font-tabular">
                  [معاينة حية لشاشة لوحة التحكم والمؤشرات المالية]
                </div>
              </div>
            )}

            {activeTourTab === "cases" && (
              <div className="space-y-4">
                <h3 className="text-title-lg font-bold text-primary">جدول القضايا ومتابعة الترافع في المحاكم</h3>
                <p className="text-body-md text-on-surface-variant font-body">
                  تصنيف القضايا حسب الدائرة والقاضي والمحامي المسؤول، وتحديث السجل الزمني للترافع تلقائياً.
                </p>
                <div className="p-4 rounded-card bg-surface-container-low border border-outline-variant font-tabular">
                  [معاينة حية لشاشة القضايا والـ Timeline القضائي]
                </div>
              </div>
            )}

            {activeTourTab === "portal" && (
              <div className="space-y-4">
                <h3 className="text-title-lg font-bold text-primary">بوابة الموكلين التفاعلية للمتابعة والسداد</h3>
                <p className="text-body-md text-on-surface-variant font-body">
                  رابط مخصص لكل موكل للاطلاع على مستجدات قضيته، التوقيع الرقمي، وسداد الفواتير عبر مدى و Apple Pay.
                </p>
                <div className="p-4 rounded-card bg-surface-container-low border border-outline-variant font-tabular">
                  [معاينة حية لبوابة الموكلين التفاعلية]
                </div>
              </div>
            )}

            {activeTourTab === "ai" && (
              <div className="space-y-4">
                <h3 className="text-title-lg font-bold text-primary">المرشد القانوني الذكي (Legal Copilot)</h3>
                <p className="text-body-md text-on-surface-variant font-body">
                  صياغة المذكرات الجوابية، استخراج المواد النظامية، وتلخيص صكوك الأحكام وفق الأنظمة السعودية.
                </p>
                <div className="p-4 rounded-card bg-surface-container-low border border-outline-variant font-tabular">
                  [معاينة حية لمحادثة الـ AI Copilot]
                </div>
              </div>
            )}

            {activeTourTab === "documents" && (
              <div className="space-y-4">
                <h3 className="text-title-lg font-bold text-primary">مركز المستندات والـ OCR الذكي</h3>
                <p className="text-body-md text-on-surface-variant font-body">
                  أرشيف كامل للمستندات مع البحث الفوري في محتوى ملفات PDF وقراءة النصوص بالـ OCR.
                </p>
                <div className="p-4 rounded-card bg-surface-container-low border border-outline-variant font-tabular">
                  [معاينة حية لمركز المستندات والأرشيف]
                </div>
              </div>
            )}

            {activeTourTab === "reports" && (
              <div className="space-y-4">
                <h3 className="text-title-lg font-bold text-primary">التقارير المالية والفوترة الضريبية ZATCA</h3>
                <p className="text-body-md text-on-surface-variant font-body">
                  إصدار فواتير المرحلة الثانية وتصدير تقارير الإقرار الضريبي والساعات القابلة للفوترة.
                </p>
                <div className="p-4 rounded-card bg-surface-container-low border border-outline-variant font-tabular">
                  [معاينة حية للتقارير والفوترة الضريبية]
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 08. SECTION 13: INTEGRATIONS GRID */}
      <section className="py-20 px-6 bg-surface-container-low border-b border-outline-variant">
        <div className="max-w-6xl mx-auto space-y-10 text-center">
          <div className="space-y-3">
            <h2 className="text-headline-sm font-extrabold text-primary">
              شبكة الموصلات والتكاملات الرسمية (Integrations Hub)
            </h2>
            <p className="text-body-lg text-on-surface-variant font-body max-w-2xl mx-auto">
              ربط مباشر وآمن مع المنصات الحكومية والبوابات المعتمدة بالمملكة.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {[
              { name: "ناجز (MoJ)", type: "قضاء وترافع" },
              { name: "ZATCA Phase 2", type: "فوترة إلكترونية" },
              { name: "منصة التوثيق الرقمي", type: "تحقق OTP و بصمة" },
              { name: "Google Workspace", type: "بريد وتقويم" },
              { name: "Microsoft 365", type: "إنتاجية ومستندات" },
              { name: "WhatsApp Business", type: "تنبيهات فورية" },
              { name: "مدى (Mada)", type: "سداد محلي" },
              { name: "Apple Pay", type: "دفع سريع" },
              { name: "STC Pay", type: "محفظة رقمية" },
              { name: "Cloudflare R2", type: "تخزين مشفر" },
              { name: "PostgreSQL RLS", type: "عزل البيانات" },
              { name: "Nafath IAM", type: "نفاذ موحد" },
            ].map((item, i) => (
              <div key={i} className="p-4 rounded-card bg-surface-container-lowest border border-outline-variant text-center space-y-1 shadow-level-1">
                <p className="text-label-md font-bold text-primary">{item.name}</p>
                <p className="text-[10px] text-on-surface-variant font-body">{item.type}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 09. SECTION 14: SECURITY & PDPL COMPLIANCE */}
      <section className="py-20 px-6 bg-surface border-b border-outline-variant">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1 rounded-pill text-label-sm text-emerald-700 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>الامتثال لنظام حماية البيانات الشخصية (PDPL Compliance)</span>
            </div>
            <h2 className="text-headline-sm font-extrabold text-primary">
              أمان وحماية بأسلوب مؤسسي معزز
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-card bg-surface-container-low border border-outline-variant space-y-3">
              <Lock className="w-8 h-8 text-primary" />
              <h3 className="text-title-md font-bold text-primary">تشفير كامل للبيانات (256-bit AES)</h3>
              <p className="text-body-md text-on-surface-variant font-body">تشفير البيانات أثناء النقل والتخزين مع مفاتيح أمان خاصة لكل مكتب.</p>
            </div>
            <div className="p-6 rounded-card bg-surface-container-low border border-outline-variant space-y-3">
              <Building2 className="w-8 h-8 text-secondary" />
              <h3 className="text-title-md font-bold text-secondary">استضافة داخل المملكة</h3>
              <p className="text-body-md text-on-surface-variant font-body">سيرفرات سحابية آمنة ومحلية متوافقة مع متطلبات SDAIA والهيئات الوطنية.</p>
            </div>
            <div className="p-6 rounded-card bg-surface-container-low border border-outline-variant space-y-3">
              <FileCheck className="w-8 h-8 text-emerald-600" />
              <h3 className="text-title-md font-bold text-emerald-700">سجل تدقيق كامل (Audit Trail)</h3>
              <p className="text-body-md text-on-surface-variant font-body">تسجيل وتتبع كل عملية عرض، تعديل، أو تحميل للملفات مع عنوان الـ IP والوقت.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 10. SECTION 18: PRICING TIERS */}
      <section className="py-20 px-6 bg-surface-container-low border-b border-outline-variant">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-headline-sm font-extrabold text-primary">
              باقات مرنة تناسب حجم وحاجة مكتبك
            </h2>
            <p className="text-body-lg text-on-surface-variant font-body max-w-2xl mx-auto">
              اختر الباقة المناسبة مع إمكانية الترقية أو التعديل في أي وقت.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Solo Plan */}
            <div className="card-interactive p-6 md:p-8 rounded-card bg-surface-container-lowest border border-outline-variant space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-label-sm bg-primary/10 text-primary px-3 py-1 rounded-pill font-bold">
                  المحامي المستقل (Solo)
                </span>
                <h3 className="text-title-lg font-bold text-primary">الباقة الأساسية</h3>
                <p className="text-title-lg font-bold text-secondary font-tabular">990 ر.س <span className="text-label-sm font-normal">/ شهرياً</span></p>
                <ul className="space-y-2 text-label-md text-on-surface font-body">
                  <li>✓ حتى 3 محامين وموظفين</li>
                  <li>✓ إدارة القضايا والجلسات</li>
                  <li>✓ بوابة الموكلين الأساسية</li>
                  <li>✓ مساحة تخزين 50 GB</li>
                </ul>
              </div>
              <button onClick={() => router.push("/onboarding")} className="w-full btn-secondary py-3 rounded-card font-bold">
                اختر الباقة الأساسية
              </button>
            </div>

            {/* Professional Plan */}
            <div className="card-interactive p-6 md:p-8 rounded-card bg-surface-container-lowest border-2 border-primary space-y-5 flex flex-col justify-between relative shadow-level-2">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-on-primary text-label-sm px-4 py-0.5 rounded-pill font-bold">
                الباقة الأكثر طلباً ⭐
              </div>
              <div className="space-y-4">
                <span className="text-label-sm bg-emerald-500/10 text-emerald-700 px-3 py-1 rounded-pill font-bold">
                  مكاتب المحاماة (Professional)
                </span>
                <h3 className="text-title-lg font-bold text-primary">الباقة الاحترافية</h3>
                <p className="text-title-lg font-bold text-emerald-700 font-tabular">2,490 ر.س <span className="text-label-sm font-normal">/ شهرياً</span></p>
                <ul className="space-y-2 text-label-md text-on-surface font-body">
                  <li>✓ حتى 25 محامياً وموظفاً</li>
                  <li>✓ المرشد الذكي AI Copilot كامل</li>
                  <li>✓ الفوترة الإلكترونية ZATCA المرحلة 2</li>
                  <li>✓ ربط ناجز والواتساب التلقائي</li>
                  <li>✓ مساحة تخزين 500 GB</li>
                </ul>
              </div>
              <button onClick={() => router.push("/onboarding")} className="w-full btn-primary py-3 rounded-card font-bold shadow-level-1">
                ابدأ التجربة المجانية للباقة الاحترافية
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="card-interactive p-6 md:p-8 rounded-card bg-surface-container-lowest border border-outline-variant space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-label-sm bg-purple-500/10 text-purple-700 px-3 py-1 rounded-pill font-bold">
                  الشركات الكبرى (Enterprise)
                </span>
                <h3 className="text-title-lg font-bold text-primary">الباقة المؤسسية</h3>
                <p className="text-title-lg font-bold text-purple-700 font-tabular">تخصيص كامل</p>
                <ul className="space-y-2 text-label-md text-on-surface font-body">
                  <li>✓ عدد محامين وموظفين غير محدود</li>
                  <li>✓ سيرفر منفصل وتخزين مخصص</li>
                  <li>✓ ربط أنظمة ERP (Odoo / SAP)</li>
                  <li>✓ مدير حساب مخصص ودعم 24/7</li>
                </ul>
              </div>
              <button onClick={() => router.push("/onboarding")} className="w-full btn-secondary py-3 rounded-card font-bold">
                تواصل لحجز العرض المؤسسي
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 11. SECTION 19: FAQ ACCORDION */}
      <section className="py-20 px-6 bg-surface border-b border-outline-variant">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-headline-sm font-extrabold text-primary">
              الأسئلة الشائعة (FAQ)
            </h2>
            <p className="text-body-lg text-on-surface-variant font-body">
              إجابات مباشرة على أكثر الأسئلة تداولاً من مدراء مكاتب المحاماة.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { q: "هل البيانات مخزنة داخل المملكة العربية السعودية؟", a: "نعم، كافة البيانات والمستندات مخزنة على سيرفرات سحابية محددة داخل المملكة ومتقيدة بنسبة 100% بنظام حماية البيانات الشخصية (PDPL)." },
              { q: "هل يدعم النظام المزامنة مع منصة ناجز و ZATCA؟", a: "نعم، النظام مدعوم بموصلات معتمدة لمزامنة الجلسات والقضايا من ناجز، وإصدار فواتير المرحلة الثانية وتشفير UBL 2.1 XML." },
              { q: "هل يمكن الوصول للنظام من الجوال؟", a: "نعم، النظام مصمم كـ PWA متجاوب بالكامل يعمل بسلاسة على أجهزة الأيفون والأندرويد والأيباد." },
              { q: "هل يتوفر استيراد البيانات القديمة للمكتب؟", a: "نعم، نتيح أدوات استيراد واستخراج البيانات من ملفات Excel و PDF لنقل قضاياك وعملائك القدامى بسهولة." },
              { q: "كم يستغرق تفعيل وإعداد المكتب بالكامل؟", a: "يستغرق تفعيل المكتب عبر رحلة الاعتماد (Onboarding Wizard) أقل من 10 دقائق ليكون المكتب جاهزاً للعمل." },
            ].map((faq, idx) => (
              <div key={idx} className="border border-outline-variant rounded-card overflow-hidden bg-surface-container-lowest">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 text-right flex items-center justify-between font-bold text-primary hover:bg-surface-container-low transition"
                >
                  <span>{faq.q}</span>
                  {openFaqIndex === idx ? <ChevronUp className="w-5 h-5 text-primary" /> : <ChevronDown className="w-5 h-5 text-on-surface-variant" />}
                </button>
                {openFaqIndex === idx && (
                  <div className="p-4 pt-0 text-body-md text-on-surface-variant font-body border-t border-outline-variant/40 bg-surface-container-low/50">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 12. SECTION 20: FINAL HIGH-IMPACT CTA */}
      <section className="py-20 px-6 bg-gradient-to-r from-primary via-indigo-900 to-purple-950 text-on-primary text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="text-headline-md md:text-headline-lg font-extrabold text-white leading-tight">
            ابدأ إدارة مكتبك القانوني باحترافية وكفاءة أعلى اليوم!
          </h2>
          <p className="text-body-lg text-white/80 font-body max-w-2xl mx-auto">
            انضم إلى أكثر من 300 مكتب وشركة محاماة في المملكة العربية السعودية واكتشف الفرق بنفسك.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => router.push("/onboarding")}
              className="btn-primary text-title-sm py-4 px-8 rounded-card bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-level-3 hover:scale-105 transition-all"
            >
              ابدأ التجربة المجانية الآن (14 يوماً)
            </button>
            <button
              onClick={() => router.push("/auth/login")}
              className="btn-secondary text-title-sm py-4 px-7 rounded-card bg-white/10 hover:bg-white/20 text-white border-white/20 font-bold transition-all"
            >
              تسجيل الدخول للنظام
            </button>
          </div>
        </div>
      </section>

      {/* 13. SECTION 21: FOOTER */}
      <footer className="bg-slate-950 text-slate-400 py-12 px-6 border-t border-slate-800 text-label-sm font-body">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <h4 className="text-title-md font-bold text-white">LegalOS Enterprise</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              منصة التشغيل الرقمي المعتمدة لمكاتب المحاماة والاستشارات القانونية بالمملكة العربية السعودية.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-label-md font-bold text-white">الروابط السريعة</h4>
            <ul className="space-y-1 text-xs">
              <li><a href="/onboarding" className="hover:text-white">اعتماد مكتب جديد</a></li>
              <li><a href="/auth/login" className="hover:text-white">تسجيل الدخول</a></li>
              <li><a href="/portal" className="hover:text-white">بوابة الموكلين</a></li>
              <li><a href="/integrations" className="hover:text-white">منصة الموصلات</a></li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="text-label-md font-bold text-white">الامتثال والأمان</h4>
            <ul className="space-y-1 text-xs">
              <li>امتثال نظام PDPL السعودي</li>
              <li>الفوترة الإلكترونية ZATCA</li>
              <li>تشفير 256-bit SSL</li>
              <li>التحقق الذكي بالـ OTP لجميع المعاملات</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="text-label-md font-bold text-white">الدعم والتواصل</h4>
            <p className="text-xs">المركز التجاري بالرياض | المملكة العربية السعودية</p>
            <p className="text-xs font-tabular">البريد: support@legalos.sa</p>
          </div>
        </div>
        <div className="max-w-6xl mx-auto pt-8 mt-8 border-t border-slate-900 text-center text-xs text-slate-500">
          جميع الحقوق محفوظة © {new Date().getFullYear()} LegalOS Enterprise Saudi Arabia
        </div>
      </footer>

      {/* Video Demo Modal */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 max-w-2xl w-full p-6 rounded-card space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-title-md font-bold text-white flex items-center gap-2">
                <Play className="w-5 h-5 text-emerald-400" />
                العرض التوضيحي السريع لنظام LegalOS (90 ثانية)
              </h3>
              <button onClick={() => setVideoModalOpen(false)} className="text-slate-400 hover:text-white text-lg">
                ✕
              </button>
            </div>
            <div className="aspect-video bg-slate-950 rounded-card flex items-center justify-center border border-slate-800">
              <div className="text-center space-y-2">
                <Play className="w-12 h-12 text-emerald-400 mx-auto animate-pulse" />
                <p className="text-sm font-bold text-slate-300">جاري تحميل مقطع العرض التوضيحي التفاعلي...</p>
              </div>
            </div>
            <button onClick={() => setVideoModalOpen(false)} className="w-full btn-primary py-2.5 rounded-card font-bold">
              إغلاق وتجربة النظام المباشرة
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
