"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Building2,
  FileText,
  CreditCard,
  Download,
  CheckCircle2,
  Clock,
  Calendar,
  MessageSquare,
  Mic,
  UploadCloud,
  Sparkles,
  ExternalLink,
  Eye,
  Share2,
  Edit3,
  AlertTriangle,
  Lock,
  RefreshCw,
  Send,
  Bot,
  Video,
  Plus,
  ArrowUpRight,
  Check,
  X,
  FilePlus,
  Search,
  UserCheck,
  User,
  Scale,
  DollarSign,
  PhoneCall,
  ChevronLeft,
} from "lucide-react";

// Multi-Tenant Firm Branding Data
const DEMO_FIRMS = [
  {
    id: "salman-law",
    name: "مكتب السلمان للمحاماة والاستشارات القانونية",
    subtitle: "الدكتور عبد الله السلمان ومشاركوه - الرياض",
    subdomain: "salman-law.legalos.sa",
    primaryColor: "bg-primary text-on-primary",
    badge: "توكيل رقم: 449810293",
    logoText: "السلمان",
  },
  {
    id: "aladl-law",
    name: "مكتب العدل والتميز للمحاماة",
    subtitle: "المحامي عبد العزيز الغامدي - جدة",
    subdomain: "aladl.legalos.sa",
    primaryColor: "bg-emerald-700 text-white",
    badge: "توكيل رقم: 449019283",
    logoText: "العدل",
  },
  {
    id: "khubara-law",
    name: "شركة الخبراء القانونية القابضة",
    subtitle: "مستشارون تجاريون ودوليون - الخبر",
    subdomain: "khubara.legalos.sa",
    primaryColor: "bg-purple-800 text-white",
    badge: "توكيل رقم: 449552109",
    logoText: "الخبراء",
  },
];

export default function ClientPortalPage() {
  const router = useRouter();

  // Selected Firm Tenant State
  const [selectedFirm, setSelectedFirm] = useState(DEMO_FIRMS[0]);

  // Auth State
  const [authMode, setAuthMode] = useState<"logged" | "otp">("logged");
  const [mobileNumber, setMobileNumber] = useState("0501234567");
  const [otpCode, setOtpCode] = useState("");
  const [step, setStep] = useState<"request" | "verify">("request");
  const [loadingOtp, setLoadingOtp] = useState(false);

  // Client Workspace Tabs
  const [activeTab, setActiveTab] = useState<
    "overview" | "cases" | "documents" | "messages" | "appointments" | "payments" | "ai-assistant"
  >("overview");

  // Selected Case Tracking State
  const [selectedCaseId, setSelectedCaseId] = useState("c-1");

  // Chat & Messages State
  const [chatMessages, setChatMessages] = useState<
    Array<{ id: string; sender: "lawyer" | "client" | "assistant"; text: string; time: string; voice?: boolean }>
  >([
    {
      id: "m-1",
      sender: "lawyer",
      text: "أهلاً أبا أحمد، تم تقديم المذكرة التكميلية للدائرة التجارية الأولى اليوم بنجاح، وننتظر رد محامي الخصم.",
      time: "10:30 ص",
    },
    {
      id: "m-2",
      sender: "client",
      text: "ممتاز جداً دكتور عبد الله، هل يلزم حضور الشخصي للجلسة القادمة يوم 24 يوليو أم ستترافعون عني بموجب الوكالة؟",
      time: "10:35 ص",
    },
    {
      id: "m-3",
      sender: "lawyer",
      text: "سنتولى الترافع كاملاً بموجب الوكالة الإلكترونية الموثقة، ويمكنكم المتابعة حياً عبر البوابة هنا.",
      time: "10:40 ص",
    },
  ]);
  const [newMessageText, setNewMessageText] = useState("");
  const [recordingVoice, setRecordingVoice] = useState(false);

  // Drag & Drop File Upload & OCR State
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<
    Array<{ id: string; name: string; size: string; date: string; category: string; status: string; ocrSummary?: string }>
  >([
    {
      id: "doc-1",
      name: "صورة الوكالة الشرعية الإلكترونية.pdf",
      size: "1.4 MB",
      date: "2026-06-12",
      category: "التوكيلات",
      status: "موثق ومكتمل",
      ocrSummary: "تم استخراج رقم الوكالة 449810293 وتاريخ الانتهاء 1448/06/10هـ بنجاح.",
    },
    {
      id: "doc-2",
      name: "عقد التوريد التجاري المبرم بين الأطراف.pdf",
      size: "3.2 MB",
      date: "2026-06-15",
      category: "العقود",
      status: "موقع إلكترونياً",
      ocrSummary: "عقد توريد معدات بقيمة 1,450,000 ر.س بشرط جزائي 10%.",
    },
    {
      id: "doc-3",
      name: "كشف حساب المستخلصات المالية المطلوبة.pdf",
      size: "890 KB",
      date: "2026-07-02",
      category: "الفواتير",
      status: "قيد المراجعة",
      ocrSummary: "كشف حساب بنكي يوضح الامتناع عن السداد لخمس مستخلصات متتالية.",
    },
  ]);
  const [ocrProcessing, setOcrProcessing] = useState(false);

  // Electronic Signature Modal State
  const [signModalOpen, setSignModalOpen] = useState(false);
  const [signingDocName, setSigningDocName] = useState("");
  const [signedSuccess, setSignedSuccess] = useState(false);

  // Payment Modal State
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [payInvoiceId, setPayInvoiceId] = useState("");
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState<"mada" | "apple" | "visa" | "stc">("mada");
  const [paySuccess, setPaySuccess] = useState(false);

  // Quick Client Request Modal State
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestType, setRequestType] = useState("استشارة قانونية");
  const [requestNote, setRequestNote] = useState("");
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  // Client AI Chatbot State
  const [aiInput, setAiInput] = useState("");
  const [aiChatHistory, setAiChatHistory] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    {
      sender: "ai",
      text: "مرحباً بك في المساعد الذكي لقضاياك! يمكنك سؤالي عن موقف أي قضية، موعد الجلسة القادمة، المستندات المطلوبة، أو رصيد الفواتير.",
    },
  ]);

  // Demo Client Action Items (Legal Collaboration Workspace - Action Center)
  const [actionItems, setActionItems] = useState([
    {
      id: "act-1",
      title: "رفع صورة الهوية الوطنية المحدثة للطرف الأول",
      dueDate: "2026-07-24",
      status: "pending",
      type: "upload",
      badge: "مطلوب عاجلاً",
    },
    {
      id: "act-2",
      title: "التوقيع الإلكتروني على ملاحق الاتفاقية التجارية",
      dueDate: "2026-07-25",
      status: "pending",
      type: "sign",
      badge: "بانتظار التوقيع",
    },
    {
      id: "act-3",
      title: "سداد الدفعة الثانية من أتعاب الخبير المحاسبي (14,500 ر.س)",
      dueDate: "2026-07-26",
      status: "pending",
      type: "pay",
      badge: "فاتورة معلقة",
    },
    {
      id: "act-4",
      title: "تأكيد حضور الجلسة التجارية الافتراضية عبر Zoom",
      dueDate: "2026-07-24",
      status: "completed",
      type: "confirm",
      badge: "تم التأكيد",
    },
  ]);

  // Handle OTP Flow
  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingOtp(true);
    setTimeout(() => {
      setLoadingOtp(false);
      setStep("verify");
    }, 600);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingOtp(true);
    setTimeout(() => {
      setLoadingOtp(false);
      setAuthMode("logged");
    }, 600);
  };

  // Handle Send Chat Message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim()) return;
    const now = new Date();
    const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;
    setChatMessages((prev) => [
      ...prev,
      { id: `msg-${Date.now()}`, sender: "client", text: newMessageText.trim(), time: timeStr },
    ]);
    setNewMessageText("");

    // Simulated Auto Lawyer / Assistant Response
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `msg-auto-${Date.now()}`,
          sender: "lawyer",
          text: "تم استلام ملاحظتك بنجاح، وجاري دراستها وتضمينها في المذكرة القادمة.",
          time: `${now.getHours()}:${String(now.getMinutes() + 1).padStart(2, "0")}`,
        },
      ]);
    }, 1500);
  };

  // Handle File Upload & AI OCR Simulation
  const handleFileUploadSimulated = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setOcrProcessing(true);

    setTimeout(() => {
      const newDoc = {
        id: `doc-${Date.now()}`,
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        date: new Date().toISOString().split("T")[0],
        category: "المرفقات الحية",
        status: "تم الفحص بالذكاء (OCR)",
        ocrSummary: `تم استخراج النص وتصنيف المستند آلياً كـ (${file.name.includes("عقد") ? "عقد قانوني" : "مستند رسمي"}) والتأكد من عدم وجود صفحات مفقودة.`,
      };
      setUploadedFiles((prev) => [newDoc, ...prev]);
      setOcrProcessing(false);

      // Mark action item as done if related
      setActionItems((prev) =>
        prev.map((item) => (item.id === "act-1" ? { ...item, status: "completed" } : item))
      );
    }, 2000);
  };

  // Handle Client AI Chatbot Queries
  const handleAiAsk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim()) return;

    const userText = aiInput.trim();
    setAiChatHistory((prev) => [...prev, { sender: "user", text: userText }]);
    setAiInput("");

    setTimeout(() => {
      let responseText =
        "بناءً على بيانات قضيتك التجاريّة رقم CAS-2026-00226 لدى المحكمة التجارية بالرياض: تم تقديم المذكرة الجوابية وموعد الجلسة القادمة يوم 24 يوليو 2026 الساعة 10:00 صباحاً عبر الترافع الإلكتروني.";
      if (userText.includes("فاتورة") || userText.includes("سداد") || userText.includes("مبلغ")) {
        responseText =
          "لديك فاتورة معلقة رقم INV-9902 بمبلغ 14,500 ر.س أتعاب خبير محاسبي. يمكنك السداد مباشرةً بالنقر على تبويب الفواتير عبر مدى أو Apple Pay.";
      } else if (userText.includes("مستند") || userText.includes("ناقص")) {
        responseText = "المستند المطلوب حالياً هو رفع صورة الهوية الوطنية المحدثة وتوقيع ملحق العقد الإلكتروني.";
      }
      setAiChatHistory((prev) => [...prev, { sender: "ai", text: responseText }]);
    }, 1200);
  };

  // Handle E-Signature Submission
  const handleConfirmSignature = () => {
    setSignedSuccess(true);
    setTimeout(() => {
      setSignedSuccess(false);
      setSignModalOpen(false);
      setActionItems((prev) =>
        prev.map((item) => (item.id === "act-2" ? { ...item, status: "completed" } : item))
      );
    }, 1500);
  };

  // Handle Payment Submission
  const handleConfirmPayment = () => {
    setPaySuccess(true);
    setTimeout(() => {
      setPaySuccess(false);
      setPayModalOpen(false);
      setActionItems((prev) =>
        prev.map((item) => (item.id === "act-3" ? { ...item, status: "completed" } : item))
      );
    }, 1500);
  };

  // Handle Request Submission
  const handleConfirmRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setRequestSubmitted(true);
    setTimeout(() => {
      setRequestSubmitted(false);
      setRequestModalOpen(false);
      setRequestNote("");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col font-heading" dir="rtl">
      {/* Dynamic Multi-Tenant White-Label Header */}
      <header className="sticky top-0 z-40 bg-surface-container-lowest border-b border-outline-variant shadow-level-1 px-4 md:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-11 md:h-11 rounded-card bg-primary text-on-primary font-bold flex items-center justify-center text-base md:text-lg shadow-level-1 shrink-0">
            {selectedFirm.logoText}
          </div>
          <div>
            <h1 className="text-title-sm md:text-title-md font-bold text-primary flex flex-wrap items-center gap-1.5">
              بوابة الموكلين التفاعلية (Client Portal)
              <span className="text-[9px] md:text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-pill font-body font-bold">
                {selectedFirm.badge}
              </span>
            </h1>
            <p className="text-label-sm text-on-surface-variant font-body">
              {selectedFirm.name} | <span className="font-tabular dir-ltr text-secondary">{selectedFirm.subdomain}</span>
            </p>
          </div>
        </div>

        {/* Firm Branding Selector Switcher & Security Badges */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 bg-surface-container-low border border-outline-variant px-3 py-1.5 rounded-pill text-label-sm">
            <span className="text-on-surface-variant">اختيار هوية المكتب:</span>
            <select
              value={selectedFirm.id}
              onChange={(e) => {
                const firm = DEMO_FIRMS.find((f) => f.id === e.target.value);
                if (firm) setSelectedFirm(firm);
              }}
              className="bg-transparent text-primary font-semibold focus:outline-none"
            >
              {DEMO_FIRMS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 px-3 py-1.5 rounded-pill text-label-sm font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>مشفر بنظام RLS & 2FA</span>
          </div>

          {authMode === "logged" ? (
            <button
              onClick={() => setAuthMode("otp")}
              className="btn-secondary text-label-sm py-1.5 px-3 hover:bg-error/10 hover:text-error transition"
            >
              خروج الموكل
            </button>
          ) : (
            <button
              onClick={() => setAuthMode("logged")}
              className="btn-primary text-label-sm py-1.5 px-3.5"
            >
              تسجيل دخول الموكل
            </button>
          )}
        </div>
      </header>

      {/* Main Workspace Body */}
      {authMode === "otp" ? (
        <div className="flex-1 flex items-center justify-center p-6 bg-surface-container-low">
          <div className="card-level-2 max-w-md w-full p-8 rounded-card border border-outline-variant space-y-6 text-center shadow-level-2">
            <div className="w-14 h-14 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-title-lg text-primary font-bold">بوابة الموكلين الآمنة</h2>
              <p className="text-body-md text-on-surface-variant mt-1 font-body">
                أدخل رقم الجوال المسجل في {selectedFirm.name} للاستعراض المباشر
              </p>
            </div>

            {step === "request" ? (
              <form onSubmit={handleRequestOtp} className="space-y-4 text-right">
                <div>
                  <label className="text-label-sm font-semibold text-on-surface">رقم الجوال المسجل</label>
                  <input
                    type="text"
                    required
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="w-full mt-1 bg-surface-container-lowest border border-outline-variant rounded-soft px-3 py-2 text-body-md text-primary font-tabular"
                    dir="ltr"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loadingOtp}
                  className="w-full btn-primary py-3 rounded-card text-label-md font-bold shadow-level-1"
                >
                  {loadingOtp ? "جاري الإرسال..." : "إرسال رمز التحقق المؤقت (OTP)"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4 text-right">
                <div>
                  <label className="text-label-sm font-semibold text-on-surface">رمز التحقق (أدخل 123456 للتجربة)</label>
                  <input
                    type="text"
                    required
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full mt-1 bg-surface-container-lowest border border-outline-variant rounded-soft px-3 py-2 text-title-md text-center text-primary font-tabular tracking-widest"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loadingOtp}
                  className="w-full btn-primary py-3 rounded-card text-label-md font-bold shadow-level-1"
                >
                  {loadingOtp ? "جاري التحقق..." : "تأكيد الدخول المباشر"}
                </button>
              </form>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col max-w-[1600px] w-full mx-auto p-4 md:p-6 space-y-6 pb-28 md:pb-10">
          {/* Client Dashboard Greeting & Quick Stats Bar */}
          <div className="card-level-1 p-6 rounded-card bg-gradient-to-r from-surface-container-lowest via-surface-container-low to-surface-container-lowest border border-outline-variant flex flex-wrap items-center justify-between gap-6 shadow-level-1">
            <div className="space-y-1">
              <h2 className="text-title-lg text-primary font-bold flex items-center gap-2">
                مرحباً بك أ. أحمد بن محمد العتيبي 👋
                <span className="text-label-sm font-semibold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 px-2.5 py-0.5 rounded-pill">
                  موكل معتمد | {selectedFirm.name}
                </span>
              </h2>
              <p className="text-body-md text-on-surface-variant font-body">
                متابعة تفاعلية لحظية لقضاياك، مستنداتك، الفواتير المستحقة، والمشاورات القانونية مع فريق العمل.
              </p>
            </div>

            {/* Quick Action Button */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setRequestModalOpen(true)}
                className="btn-primary text-label-md py-2.5 px-4 flex items-center gap-2 shadow-level-1"
              >
                <Plus className="w-4 h-4" />
                طلب جديد (استشارة / قضية / توكيل)
              </button>
            </div>
          </div>

          {/* Core Navigation Bar for Client Workspace Modules */}
          <div className="bg-surface-container-lowest p-2 rounded-card border border-outline-variant shadow-level-1 overflow-x-auto no-scrollbar scrollbar-none">
            <div className="flex items-center gap-1.5 md:gap-2 min-w-max">
              {[
                { id: "overview", label: "اللوحة التفاعلية والعمل الجماعي", icon: Scale },
                { id: "cases", label: "تتبع مسار القضايا (Case Tracking)", icon: BriefcaseIcon },
                { id: "documents", label: "مركز المستندات والـ OCR", icon: FileText },
                { id: "messages", label: "المحادثة والرسائل الصوتية", icon: MessageSquare },
                { id: "appointments", label: "الجلسات والاجتماعات", icon: Calendar },
                { id: "payments", label: "الفواتير والسداد الإلكتروني", icon: CreditCard },
                { id: "ai-assistant", label: "المساعد الذكي (اسأل عن قضيتك)", icon: Bot },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-soft text-xs md:text-label-md transition-all font-semibold whitespace-nowrap ${
                      isActive
                        ? "bg-primary text-on-primary shadow-level-1"
                        : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-on-primary" : "text-primary"}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* MODULE 1: Workspace Overview & Legal Collaboration Action Center */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Summary Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-5 gap-4">
                <div className="card-level-1 p-4 rounded-card border border-outline-variant space-y-1">
                  <div className="flex items-center justify-between text-on-surface-variant">
                    <span className="text-label-sm font-semibold">القضايا النشطة</span>
                    <Scale className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-title-lg font-bold text-primary font-tabular">3 قضايا</p>
                  <p className="text-[11px] text-emerald-600 font-body">محكمة تجارية وعمالية</p>
                </div>

                <div className="card-level-1 p-4 rounded-card border border-outline-variant space-y-1">
                  <div className="flex items-center justify-between text-on-surface-variant">
                    <span className="text-label-sm font-semibold">الجلسة القادمة</span>
                    <Calendar className="w-4 h-4 text-secondary" />
                  </div>
                  <p className="text-title-lg font-bold text-secondary font-tabular">24 يوليو</p>
                  <p className="text-[11px] text-on-surface-variant font-body">بعد يومين | 10:00 ص</p>
                </div>

                <div className="card-level-1 p-4 rounded-card border border-outline-variant space-y-1">
                  <div className="flex items-center justify-between text-on-surface-variant">
                    <span className="text-label-sm font-semibold">مستندات مطلوبة</span>
                    <FileText className="w-4 h-4 text-amber-600" />
                  </div>
                  <p className="text-title-lg font-bold text-amber-600 font-tabular">2 مستند</p>
                  <p className="text-[11px] text-amber-600 font-body">هوية وملحق عقد</p>
                </div>

                <div className="card-level-1 p-4 rounded-card border border-outline-variant space-y-1">
                  <div className="flex items-center justify-between text-on-surface-variant">
                    <span className="text-label-sm font-semibold">فواتير غير مدفوعة</span>
                    <CreditCard className="w-4 h-4 text-error" />
                  </div>
                  <p className="text-title-lg font-bold text-error font-tabular">14,500 ر.س</p>
                  <p className="text-[11px] text-error font-body">أتعاب خبير محاسبي</p>
                </div>

                <div className="card-level-1 p-4 rounded-card border border-outline-variant space-y-1 col-span-2 sm:col-span-1">
                  <div className="flex items-center justify-between text-on-surface-variant">
                    <span className="text-label-sm font-semibold">رسائل المحامي</span>
                    <MessageSquare className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-title-lg font-bold text-primary font-tabular">1 جديدة</p>
                  <p className="text-[11px] text-emerald-600 font-body">د. عبد الله السلمان</p>
                </div>
              </div>

              {/* Competitive Advantage Feature: Action Center (مساحة الإجراءات المطلوبة من العميل) */}
              <div className="card-level-1 p-6 rounded-card space-y-4 border border-primary/20 shadow-level-1 bg-surface-container-lowest">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant pb-3">
                  <div>
                    <h3 className="text-title-md font-bold text-primary flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-secondary animate-pulse" />
                      مساحة التعاون ومتابعة الإجراءات المطلوبة (Action Center Workspace)
                    </h3>
                    <p className="text-label-sm text-on-surface-variant font-body">
                      قائمة المهام والإجراءات المعلقة التي ينتظرها فريق المحامين منك لسرعة إنجاز قضاياك.
                    </p>
                  </div>

                  <div className="text-label-sm font-semibold text-secondary bg-secondary/10 px-3 py-1 rounded-pill border border-secondary/20">
                    معدل إنجاز المهام: 75% مكتمل
                  </div>
                </div>

                <div className="space-y-3">
                  {actionItems.map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-card border transition-all flex flex-wrap items-center justify-between gap-4 ${
                        item.status === "completed"
                          ? "bg-surface-container-low border-outline-variant opacity-75"
                          : "bg-surface-container-lowest border-primary/30 shadow-level-1"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                            item.status === "completed"
                              ? "bg-emerald-500/20 text-emerald-600"
                              : "bg-primary/10 text-primary"
                          }`}
                        >
                          {item.status === "completed" ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : item.type === "upload" ? (
                            <UploadCloud className="w-5 h-5" />
                          ) : item.type === "sign" ? (
                            <Edit3 className="w-5 h-5" />
                          ) : item.type === "pay" ? (
                            <CreditCard className="w-5 h-5" />
                          ) : (
                            <Video className="w-5 h-5" />
                          )}
                        </div>

                        <div>
                          <p
                            className={`text-body-md font-semibold ${
                              item.status === "completed"
                                ? "line-through text-on-surface-variant"
                                : "text-on-surface"
                            }`}
                          >
                            {item.title}
                          </p>
                          <p className="text-label-sm text-on-surface-variant font-body flex items-center gap-2 mt-0.5">
                            <span>التاريخ الأقصى: {item.dueDate}</span>
                            <span>•</span>
                            <span className="font-semibold text-primary">{item.badge}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {item.status === "completed" ? (
                          <span className="badge-success text-label-sm">تم الإنجاز بنجاح 🟢</span>
                        ) : item.type === "upload" ? (
                          <button
                            onClick={() => setActiveTab("documents")}
                            className="btn-primary text-label-sm py-1.5 px-3.5 flex items-center gap-1.5"
                          >
                            <UploadCloud className="w-4 h-4" />
                            رفع المستند الآن
                          </button>
                        ) : item.type === "sign" ? (
                          <button
                            onClick={() => {
                              setSigningDocName("ملحق عقد الاتفاقية التجاري v2.pdf");
                              setSignModalOpen(true);
                            }}
                            className="btn-secondary text-label-sm py-1.5 px-3.5 flex items-center gap-1.5 border-primary/40 text-primary"
                          >
                            <Edit3 className="w-4 h-4" />
                            توقيع إلكتروني
                          </button>
                        ) : item.type === "pay" ? (
                          <button
                            onClick={() => {
                              setPayInvoiceId("INV-9902");
                              setPayAmount("14,500");
                              setPayModalOpen(true);
                            }}
                            className="btn-primary text-label-sm py-1.5 px-3.5 flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800"
                          >
                            <CreditCard className="w-4 h-4" />
                            سداد 14,500 ر.س
                          </button>
                        ) : (
                          <span className="badge-success text-label-sm">تم تأكيد الحضور 🎥</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* MODULE 2: Case Tracking & Timeline (Amazon-Style Tracking) */}
          {(activeTab === "overview" || activeTab === "cases") && (
            <div className="card-level-1 p-6 rounded-card space-y-6 border border-outline-variant shadow-level-1">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant pb-4">
                <div>
                  <h3 className="text-title-md font-bold text-primary flex items-center gap-2">
                    <BriefcaseIcon className="w-5 h-5 text-primary" />
                    متابعة سير القضية والتتبع الزمني (Case Tracking & Timeline)
                  </h3>
                  <p className="text-label-sm text-on-surface-variant font-body">
                    رصد لحظي ومراحل الترافع بالقضية خطوة بخطوة.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-label-sm font-semibold text-on-surface-variant">اختيار القضية:</span>
                  <select
                    value={selectedCaseId}
                    onChange={(e) => setSelectedCaseId(e.target.value)}
                    className="bg-surface-container-low border border-outline-variant px-3 py-1.5 rounded-soft text-body-md font-semibold text-primary focus:outline-none"
                  >
                    <option value="c-1">CAS-2026-00226 | تجاري (طالب حق 1.45 مليون ر.س)</option>
                    <option value="c-2">CAS-2026-00109 | عمالي (مستحقات مكافأة نهاية الخدمة)</option>
                    <option value="c-3">CAS-2026-00084 | تنفيذ (سند لأمر 250,000 ر.س)</option>
                  </select>
                </div>
              </div>

              {/* Progress Percentage Visual Bar */}
              <div className="bg-surface-container-low p-4 rounded-card space-y-2 border border-outline-variant">
                <div className="flex justify-between items-center text-body-md font-bold">
                  <span className="text-primary">نسبة الإنجاز وسير القضية بالمحكمة: 80%</span>
                  <span className="text-secondary font-tabular">المرحلة 4 من 5 (مراجعة المذكرات)</span>
                </div>
                <div className="w-full h-3 bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary via-secondary to-emerald-500 rounded-full w-[80%] transition-all duration-500"></div>
                </div>
                <p className="text-label-sm text-on-surface-variant font-body pt-1">
                  آخر تحديث من المحامي المكلف: منذ ساعتين | المحكمة التجارية بالرياض - الدائرة الأولى
                </p>
              </div>

              {/* Amazon-Style Milestone Timeline */}
              <div className="space-y-4">
                <h4 className="text-label-md font-bold text-on-surface">المراحل القضائية والتسلسل الزمني:</h4>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-center">
                  {[
                    { step: "1", title: "قيد القضية", date: "10 يونيو 2026", status: "completed" },
                    { step: "2", title: "رفع لائحة الدعوى", date: "15 يونيو 2026", status: "completed" },
                    { step: "3", title: "الرد المتبادل", date: "02 يوليو 2026", status: "completed" },
                    { step: "4", title: "الجلسة والحكم", date: "24 يوليو 2026", status: "active" },
                    { step: "5", title: "الاعتراض والتنفيذ", date: "قريباً", status: "upcoming" },
                  ].map((m, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-card border flex flex-col items-center gap-2 ${
                        m.status === "completed"
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800"
                          : m.status === "active"
                          ? "bg-primary/10 border-primary/40 text-primary font-bold ring-2 ring-primary/20"
                          : "bg-surface-container-low border-outline-variant text-on-surface-variant"
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${
                          m.status === "completed"
                            ? "bg-emerald-600 text-white"
                            : m.status === "active"
                            ? "bg-primary text-on-primary"
                            : "bg-surface-container-high text-on-surface-variant"
                        }`}
                      >
                        {m.status === "completed" ? "✓" : m.step}
                      </div>
                      <span className="text-body-md font-semibold">{m.title}</span>
                      <span className="text-[11px] font-body opacity-80">{m.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* MODULE 3: Documents Center, Drag & Drop Upload & AI OCR Extraction */}
          {activeTab === "documents" && (
            <div className="card-level-1 p-6 rounded-card space-y-6 border border-outline-variant shadow-level-1">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant pb-4">
                <div>
                  <h3 className="text-title-md font-bold text-primary flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    مركز المستندات الآمن والفحص بالذكاء الاصطناعي (OCR Center)
                  </h3>
                  <p className="text-label-sm text-on-surface-variant font-body">
                    استعراض، توقيع، ورفع المستندات الرسمية مع الفحص الآلي المستخرج للنصوص.
                  </p>
                </div>
              </div>

              {/* Drag & Drop File Upload Dropzone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  handleFileUploadSimulated(e.dataTransfer.files);
                }}
                className={`p-8 border-2 border-dashed rounded-card text-center transition-all cursor-pointer ${
                  dragOver
                    ? "border-primary bg-primary/10"
                    : "border-outline-variant bg-surface-container-low hover:border-primary/40"
                }`}
              >
                <input
                  type="file"
                  id="portal-file-input"
                  className="hidden"
                  onChange={(e) => handleFileUploadSimulated(e.target.files)}
                />
                <label htmlFor="portal-file-input" className="cursor-pointer space-y-2 block">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <p className="text-body-md font-bold text-primary">
                    اسحب وأفلت الملفات هنا أو اضغط للرفع المباشر (PDF, Word, Excel, صور)
                  </p>
                  <p className="text-label-sm text-on-surface-variant font-body">
                    يتم تطبيق فحص الذكاء الاصطناعي (AI OCR) فوراً لاستخراج النصوص والتصنيف الآلي تلقائياً.
                  </p>
                </label>
              </div>

              {ocrProcessing && (
                <div className="p-4 bg-secondary/10 border border-secondary/30 rounded-card text-body-md text-secondary font-bold flex items-center gap-3">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>جاري فحص المستند واستخراج النصوص عبر محرك AI OCR وتصنيف نوعه تلقائياً...</span>
                </div>
              )}

              {/* Uploaded Documents List */}
              <div className="space-y-3">
                <h4 className="text-label-md font-bold text-on-surface">المستندات المرفقة والملفات الرسمية:</h4>
                {uploadedFiles.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 rounded-card border border-outline-variant bg-surface-container-lowest hover:border-primary/30 transition-all space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-card bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-body-md font-bold text-on-surface">{doc.name}</p>
                          <p className="text-label-sm text-on-surface-variant font-body">
                            الحجم: {doc.size} | التصنيف: {doc.category} | التاريخ: {doc.date}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => alert(`معاينة المستند الرقمي: ${doc.name}`)}
                          className="btn-secondary text-label-sm py-1.5 px-3 flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          معاينة
                        </button>

                        <button
                          onClick={() => alert(`جاري تنزيل نسخة مشفرة من ${doc.name}...`)}
                          className="btn-secondary text-label-sm py-1.5 px-3 flex items-center gap-1"
                        >
                          <Download className="w-4 h-4" />
                          تنزيل
                        </button>

                        <button
                          onClick={() => {
                            setSigningDocName(doc.name);
                            setSignModalOpen(true);
                          }}
                          className="btn-primary text-label-sm py-1.5 px-3 flex items-center gap-1"
                        >
                          <Edit3 className="w-4 h-4" />
                          توقيع إلكتروني
                        </button>
                      </div>
                    </div>

                    {doc.ocrSummary && (
                      <div className="text-label-sm bg-secondary/8 border border-secondary/20 p-2.5 rounded-soft text-secondary font-body flex items-center gap-2">
                        <Sparkles className="w-4 h-4 shrink-0 text-secondary" />
                        <span>{doc.ocrSummary}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MODULE 4: WhatsApp-Style Lawyer Messaging & Voice Notes */}
          {activeTab === "messages" && (
            <div className="card-level-1 p-6 rounded-card space-y-4 border border-outline-variant shadow-level-1">
              <div className="flex items-center justify-between border-b border-outline-variant pb-3">
                <div>
                  <h3 className="text-title-md font-bold text-primary flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    المحادثة المباشرة والرسائل الصوتية الذكية (Lawyer & Client Chat)
                  </h3>
                  <p className="text-label-sm text-on-surface-variant font-body">
                    تواصل مباشر وآمن بين الموكل، المحامي المكلف، والسكرتارية.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-label-sm font-semibold text-emerald-700 bg-emerald-500/10 px-3 py-1 rounded-pill">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>المحامي متصل الآن</span>
                </div>
              </div>

              {/* Chat Messages Display Box */}
              <div className="p-4 bg-surface-container-low rounded-card border border-outline-variant max-h-[400px] overflow-y-auto space-y-3">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-[80%] ${
                      msg.sender === "client" ? "mr-auto text-left items-end" : "ml-auto text-right items-start"
                    }`}
                  >
                    <div
                      className={`p-3.5 rounded-card text-body-md font-body space-y-1 shadow-level-1 ${
                        msg.sender === "client"
                          ? "bg-primary text-on-primary rounded-br-none"
                          : "bg-surface-container-lowest text-on-surface border border-outline-variant rounded-bl-none"
                      }`}
                    >
                      <p>{msg.text}</p>
                    </div>
                    <span className="text-[10px] text-on-surface-variant px-1 font-tabular mt-0.5">{msg.time}</span>
                  </div>
                ))}
              </div>

              {/* Chat Input Bar with Voice Note Button */}
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="اكتب استفسارك أو ملاحظتك للمحامي مباشرة هنا..."
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  className="flex-1 bg-surface-container-lowest border border-outline-variant px-4 py-2.5 rounded-soft text-body-md text-on-surface focus:outline-none"
                />

                <button
                  type="button"
                  onClick={() => {
                    setRecordingVoice(true);
                    setTimeout(() => {
                      setRecordingVoice(false);
                      setChatMessages((prev) => [
                        ...prev,
                        {
                          id: `voice-${Date.now()}`,
                          sender: "client",
                          text: "🎙️ [تسجيل صوتي 0:15] تم الاستماع وتحويل الصوت لنص بواسطة AI: أود الاستفسار عن موعد الجلسة.",
                          time: "الان",
                        },
                      ]);
                    }, 2000);
                  }}
                  className={`p-2.5 rounded-soft transition ${
                    recordingVoice ? "bg-error text-on-error animate-pulse" : "btn-secondary"
                  }`}
                  title="إرسال تسجيل صوتي مع تحويل تلقائي للنص بواسطة AI"
                >
                  <Mic className="w-5 h-5" />
                </button>

                <button type="submit" className="btn-primary py-2.5 px-5 flex items-center gap-2 shadow-level-1">
                  <Send className="w-4 h-4" />
                  <span>إرسال</span>
                </button>
              </form>
            </div>
          )}

          {/* MODULE 5: Hearing & Appointment Center */}
          {activeTab === "appointments" && (
            <div className="card-level-1 p-6 rounded-card space-y-6 border border-outline-variant shadow-level-1">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant pb-4">
                <div>
                  <h3 className="text-title-md font-bold text-primary flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    مركز المواعيد والجلسات القضائية (Appointments & Hearings)
                  </h3>
                  <p className="text-label-sm text-on-surface-variant font-body">
                    جدولة جلسات المحاكم والاجتماعات الاستشارية عبر Zoom/Teams أو حضورياً بالمكتب.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-card border border-primary/30 bg-surface-container-lowest space-y-3">
                  <div className="flex items-center justify-between border-b border-outline-variant pb-2">
                    <span className="badge-warning text-label-sm font-semibold">جلسة قادمة بالمحكمة ⚖️</span>
                    <span className="text-label-sm text-primary font-tabular">24 يوليو 2026 | 10:00 ص</span>
                  </div>
                  <p className="text-body-md font-bold text-on-surface">الجلسة التجارية الثانية - الدائرة الأولى</p>
                  <p className="text-label-sm text-on-surface-variant font-body">
                    نوع الجلسة: ترافع عن بُعد عبر منصة الترافع الإلكتروني لوزارة العدل (ناجز).
                  </p>
                  <button
                    onClick={() => alert("تم تأكيد حضور الجلسة الإلكترونية!")}
                    className="btn-primary text-label-sm py-1.5 px-3 flex items-center gap-1.5"
                  >
                    <Video className="w-4 h-4" />
                    تأكيد الحضور الافتراضي
                  </button>
                </div>

                <div className="p-4 rounded-card border border-outline-variant bg-surface-container-low space-y-3">
                  <div className="flex items-center justify-between border-b border-outline-variant pb-2">
                    <span className="badge-neutral text-label-sm font-semibold">اجتماع استشاري 🤝</span>
                    <span className="text-label-sm text-on-surface-variant font-tabular">28 يوليو 2026 | 02:00 م</span>
                  </div>
                  <p className="text-body-md font-bold text-on-surface">جلسة مراجعة مذكرات مع د. عبد الله السلمان</p>
                  <p className="text-label-sm text-on-surface-variant font-body">
                    نوع الاجتماع: حضوري في مقر مكتب السلمان للمحاماة - الرياض.
                  </p>
                  <button
                    onClick={() => alert("جاري إعادة جدولة الموعد...")}
                    className="btn-secondary text-label-sm py-1.5 px-3 flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-4 h-4" />
                    إعادة جدولة الموعد
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MODULE 6: Payments & E-Signature Gateway */}
          {activeTab === "payments" && (
            <div className="card-level-1 p-6 rounded-card space-y-6 border border-outline-variant shadow-level-1">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant pb-4">
                <div>
                  <h3 className="text-title-md font-bold text-primary flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    الفواتير والسداد الإلكتروني (Payments & Invoices)
                  </h3>
                  <p className="text-label-sm text-on-surface-variant font-body">
                    سداد آمن ومباشر عبر مدى، Apple Pay، الفيزا، والماستركارد مع فواتير ZATCA المعتمدة.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-card border border-error/30 bg-surface-container-lowest flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="text-label-sm font-semibold text-error">فاتورة غير مدفوعة (INV-9902)</span>
                    <p className="text-title-md font-bold text-on-surface">أتعاب خبير محاسبي وربط المحكمة</p>
                    <p className="text-label-sm text-on-surface-variant font-body">المبلغ المستحق: 14,500.00 ر.س (شامل الضريبة 15%)</p>
                  </div>

                  <button
                    onClick={() => {
                      setPayInvoiceId("INV-9902");
                      setPayAmount("14,500");
                      setPayModalOpen(true);
                    }}
                    className="btn-primary text-label-md py-2.5 px-5 flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 shadow-level-1"
                  >
                    <CreditCard className="w-4 h-4" />
                    سداد الآن 14,500 ر.س
                  </button>
                </div>

                <div className="p-4 rounded-card border border-outline-variant bg-surface-container-low flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="badge-success text-label-sm">فاتورة مدفوعة ومسددة بالكامل (INV-9100)</span>
                    <p className="text-title-md font-bold text-on-surface">دفعة مقدم عقد الأتعاب الأول</p>
                    <p className="text-label-sm text-on-surface-variant font-body">المبلغ المسدد: 50,000.00 ر.س | تم السداد عبر مدى</p>
                  </div>

                  <button
                    onClick={() => alert("جاري تحميل الإيصال الضريبي المعتمد من ZATCA Phase 2...")}
                    className="btn-secondary text-label-sm py-2 px-4 flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    تحميل الإيصال الضريبي
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MODULE 7: Embedded Client AI Assistant ("اسأل عن قضيتك") */}
          {activeTab === "ai-assistant" && (
            <div className="card-level-1 p-6 rounded-card space-y-6 border border-primary/20 shadow-level-1">
              <div className="flex items-center justify-between border-b border-outline-variant pb-3">
                <div>
                  <h3 className="text-title-md font-bold text-primary flex items-center gap-2">
                    <Bot className="w-5 h-5 text-primary" />
                    المساعد الذكي للموكل (اسأل عن قضيتك - Client AI)
                  </h3>
                  <p className="text-label-sm text-on-surface-variant font-body">
                    إجابات ذكية وفورية من واقع بيانات مستنداتك وقضاياك المعزولة بأمان.
                  </p>
                </div>
              </div>

              {/* AI Chat Conversation Area */}
              <div className="p-4 bg-surface-container-low rounded-card border border-outline-variant max-h-[380px] overflow-y-auto space-y-3">
                {aiChatHistory.map((chat, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col max-w-[85%] ${
                      chat.sender === "user" ? "mr-auto text-left items-end" : "ml-auto text-right items-start"
                    }`}
                  >
                    <div
                      className={`p-3.5 rounded-card text-body-md font-body space-y-1 shadow-level-1 ${
                        chat.sender === "user"
                          ? "bg-primary text-on-primary rounded-br-none"
                          : "bg-surface-container-lowest border border-primary/30 text-on-surface rounded-bl-none"
                      }`}
                    >
                      <p>{chat.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* AI Input Prompt */}
              <form onSubmit={handleAiAsk} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="اسأل الذكاء الاصطناعي عن أي تفاصيل بقضيتك (مثلاً: ما آخر تحديث؟ متى الجلسة؟ ما الفواتير المعلقة؟)..."
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  className="flex-1 bg-surface-container-lowest border border-outline-variant px-4 py-2.5 rounded-soft text-body-md text-on-surface focus:outline-none"
                />
                <button type="submit" className="btn-primary py-2.5 px-5 flex items-center gap-2 shadow-level-1">
                  <Sparkles className="w-4 h-4" />
                  <span>اسأل AI</span>
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Electronic Signature Modal */}
      {signModalOpen && (
        <div className="fixed inset-0 z-50 bg-on-surface/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card-level-2 max-w-md w-full p-6 rounded-card space-y-4 text-right font-heading max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-outline-variant pb-2">
              <h3 className="text-title-md font-bold text-primary flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-primary" />
                التوقيع الإلكتروني المعتمد (E-Signature)
              </h3>
              <button onClick={() => setSignModalOpen(false)} className="text-on-surface-variant">
                ✕
              </button>
            </div>

            <p className="text-body-md text-on-surface">
              تأكيد التوقيع والموافقة الرسمية على: <span className="font-bold text-primary">{signingDocName}</span>
            </p>

            <div className="p-6 bg-surface-container-lowest border-2 border-dashed border-outline-variant rounded-card text-center text-label-sm text-on-surface-variant font-body">
              [منطقة التوقيع الرقمي والتأكيد بكود النفاذ الوطني]
            </div>

            {signedSuccess && (
              <p className="text-body-md text-emerald-700 bg-emerald-500/10 p-3 rounded-soft font-bold text-center">
                تم اعتماد التوقيع الإلكتروني بنجاح وتسجيل الاعتماد بالمنظومة 🟢
              </p>
            )}

            <button
              onClick={handleConfirmSignature}
              disabled={signedSuccess}
              className="w-full btn-primary py-3 rounded-card text-label-md font-bold shadow-level-1"
            >
              {signedSuccess ? "تم التوقيع..." : "تأكيد التوقيع والاعتماد الرسمـي"}
            </button>
          </div>
        </div>
      )}

      {/* E-Payment Gateway Modal */}
      {payModalOpen && (
        <div className="fixed inset-0 z-50 bg-on-surface/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card-level-2 max-w-md w-full p-6 rounded-card space-y-4 text-right font-heading max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-outline-variant pb-2">
              <h3 className="text-title-md font-bold text-primary flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                بوابة السداد الإلكتروني المباشر
              </h3>
              <button onClick={() => setPayModalOpen(false)} className="text-on-surface-variant">
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-body-md text-on-surface">
                سداد الفاتورة رقم: <span className="font-bold text-primary">{payInvoiceId}</span>
              </p>
              <p className="text-title-lg font-bold text-emerald-700 font-tabular">
                المبلغ الإجمالي: {payAmount} ر.س
              </p>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: "mada", label: "مدى" },
                { id: "apple", label: "Apple Pay" },
                { id: "visa", label: "Visa" },
                { id: "stc", label: "STC Pay" },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setPayMethod(m.id as any)}
                  className={`p-2.5 rounded-soft text-label-sm font-bold border transition ${
                    payMethod === m.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-outline-variant text-on-surface-variant"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {paySuccess && (
              <p className="text-body-md text-emerald-700 bg-emerald-500/10 p-3 rounded-soft font-bold text-center">
                تم السداد بنجاح! تم إصدار السند المالي المعتمد من ZATCA 🟢
              </p>
            )}

            <button
              onClick={handleConfirmPayment}
              disabled={paySuccess}
              className="w-full btn-primary py-3 rounded-card text-label-md font-bold bg-emerald-700 hover:bg-emerald-800 shadow-level-1"
            >
              {paySuccess ? "تم السداد..." : `تأكيد الدفع الآن عبر ${payMethod.toUpperCase()}`}
            </button>
          </div>
        </div>
      )}

      {/* Quick Client Request Modal */}
      {requestModalOpen && (
        <div className="fixed inset-0 z-50 bg-on-surface/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card-level-2 max-w-md w-full p-6 rounded-card space-y-4 text-right font-heading max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-outline-variant pb-2">
              <h3 className="text-title-md font-bold text-primary flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" />
                تقديم طلب جديد للمكتب
              </h3>
              <button onClick={() => setRequestModalOpen(false)} className="text-on-surface-variant">
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmRequest} className="space-y-4">
              <div>
                <label className="text-label-sm font-semibold text-on-surface">نوع الطلب</label>
                <select
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value)}
                  className="w-full mt-1 bg-surface-container-lowest border border-outline-variant rounded-soft px-3 py-2 text-body-md text-on-surface font-semibold"
                >
                  <option value="استشارة قانونية">طلب استشارة قانونية جديدة</option>
                  <option value="فتح قضية جديد">طلب قيد وفتح قضية جديدة</option>
                  <option value="إضافة مستند">إضافة مستند أو بينة جديدة</option>
                  <option value="طلب مكالمة هاتفية">طلب مكالمة هاتفية مع المحامي</option>
                  <option value="طلب توكيل">طلب توكيل شرعي جديد عبر ناجز</option>
                </select>
              </div>

              <div>
                <label className="text-label-sm font-semibold text-on-surface">تفاصيل وملاحظات الطلب</label>
                <textarea
                  rows={3}
                  placeholder="اكتب شرحاً مختصراً للطلب..."
                  value={requestNote}
                  onChange={(e) => setRequestNote(e.target.value)}
                  className="w-full mt-1 bg-surface-container-lowest border border-outline-variant rounded-soft p-3 text-body-md text-on-surface"
                ></textarea>
              </div>

              {requestSubmitted && (
                <p className="text-body-md text-emerald-700 bg-emerald-500/10 p-3 rounded-soft font-bold text-center">
                  تم إرسال الطلب لفريق المحامين بالمكتب وسيتم التواصل معك قريباً 🟢
                </p>
              )}

              <button
                type="submit"
                disabled={requestSubmitted}
                className="w-full btn-primary py-3 rounded-card text-label-md font-bold shadow-level-1"
              >
                {requestSubmitted ? "تم الإرسال..." : "إرسال الطلب الآن"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function BriefcaseIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}
