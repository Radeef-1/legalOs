"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { LiveTimer } from "@/components/LiveTimer";
import { SEEDED_FIRMS, ALL_225_CASES, CaseRecord } from "@/data/seededFirmsData";
import { NAJIZ_OFFICIAL_CLASSIFICATIONS, ALL_FLAT_NAJIZ_SUB_CATEGORIES } from "@/data/najizClassificationsData";
import {
  Briefcase,
  ArrowRight,
  Building2,
  User,
  Scale,
  Calendar,
  FileText,
  DollarSign,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Plus,
  Landmark,
  UserCheck,
  BookOpen,
  Search,
} from "lucide-react";

export default function CaseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const caseId = params?.id as string;

  const [caseRecord, setCaseRecord] = useState<CaseRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "hearings" | "documents" | "finances">("overview");

  // Enhanced Smart Saudi Case Intake Engine State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newCaseNumber, setNewCaseNumber] = useState(`CASE-2026-${String(ALL_225_CASES.length + 1).padStart(5, "0")}`);
  const [newNajizNumber, setNewNajizNumber] = useState(`4490${Math.floor(10000 + Math.random() * 90000)}`);
  const [newCaseType, setNewCaseType] = useState<any>("commercial");
  const [newDegree, setNewDegree] = useState("درجة ابتدائية (الدرجة الأولى)");
  const [newCourtName, setNewCourtName] = useState("المحكمة التجارية بالرياض - الدائرة الابتدائية الأولى");

  // Dynamic Saudi Legal Requirements by Case Type
  const [commercialNoticeConfirmed, setCommercialNoticeConfirmed] = useState(true);
  const [qiwaContractId, setQiwaContractId] = useState("QIWA-99482103");
  const [taradhiSettlementId, setTaradhiSettlementId] = useState("TARADHI-449102");
  const [executiveTitleType, setExecutiveTitleType] = useState("سند لأمر نظامي (المادة 9)");
  const [executiveTitleId, setExecutiveTitleId] = useState("SANAD-884920");
  const [taradhiReconciliationId, setTaradhiReconciliationId] = useState("TARADHI-77401");
  const [adminGrievanceDate, setAdminGrievanceDate] = useState("2026-06-10");

  // Najiz Official Manual Classification States
  const [selectedNajizMainCatId, setSelectedNajizMainCatId] = useState("");
  const [selectedNajizSubCatId, setSelectedNajizSubCatId] = useState("");
  const [najizSearchQuery, setNajizSearchQuery] = useState("");

  const currentNajizCourt = NAJIZ_OFFICIAL_CLASSIFICATIONS.find((c) => c.id === newCaseType) || NAJIZ_OFFICIAL_CLASSIFICATIONS[4];
  const availableNajizMainCats = currentNajizCourt?.mainCategories || [];
  const currentNajizMainCat = availableNajizMainCats.find((m) => m.id === selectedNajizMainCatId) || availableNajizMainCats[0];
  const availableNajizSubCats = currentNajizMainCat?.subCategories || [];

  const searchResultsNajiz = najizSearchQuery.trim()
    ? ALL_FLAT_NAJIZ_SUB_CATEGORIES.filter(
        (cat) =>
          cat.name.includes(najizSearchQuery.trim()) ||
          cat.courtName.includes(najizSearchQuery.trim()) ||
          cat.mainCategoryName.includes(najizSearchQuery.trim())
      )
    : [];

  // Parties & Contact Details (المدعي والمدعى عليه)
  const [newClientName, setNewClientName] = useState("شركة التنمية والتطوير المحدودة");
  const [newPlaintiffId, setNewPlaintiffId] = useState("1010984521");
  const [newPlaintiffPhone, setNewPlaintiffPhone] = useState("0501234567");
  const [newClientCapacity, setNewClientCapacity] = useState("مدعي (اصالة)");
  const [newPoaNumber, setNewPoaNumber] = useState("449810293");

  const [newOpposingParty, setNewOpposingParty] = useState("مؤسسة الأعمال المتقدمة للمقاولات");
  const [newDefendantId, setNewDefendantId] = useState("1010776432");
  const [newDefendantPhone, setNewDefendantPhone] = useState("0559876543");

  // Assignment & Delegation
  const [newPartnerLawyer, setNewPartnerLawyer] = useState("د. عبد الله السلمان");
  const [newAssociateLawyer, setNewAssociateLawyer] = useState("أ. عبد العزيز الغامدي");

  // Finances & Trust
  const [newClaimAmount, setNewClaimAmount] = useState("1,450,000 ر.س");
  const [newContractFee, setNewContractFee] = useState("145,000 ر.س");
  const [newTrustDeposit, setNewTrustDeposit] = useState("50,000 ر.س");

  // File Uploads State
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ id: string; name: string; size: string; type: string }>>([
    { id: "f-1", name: "صورة الوكالة الشرعية (ناجز توثيق).pdf", size: "1.2 MB", type: "PDF" },
    { id: "f-2", name: "صورة العقد التجاري الموقع من الأطراف.pdf", size: "3.4 MB", type: "PDF" },
    { id: "f-3", name: "كشف الحساب وسندات الفواتير المطالب بها.pdf", size: "890 KB", type: "PDF" },
  ]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const newFiles = Array.from(e.target.files).map((file, idx) => ({
      id: `file-${Date.now()}-${idx}`,
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      type: file.name.endsWith(".pdf") ? "PDF" : file.name.endsWith(".docx") ? "DOCX" : "IMAGE",
    }));
    setUploadedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const availableLawyers = SEEDED_FIRMS.flatMap((f) => f.lawyers);

  const handleCreateNewCaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateModalOpen(false);
    alert(
      `تم تحديث وقيد بيانات القضية بنجاح!\n` +
      `- رقم القيد في ناجز: ${newNajizNumber}\n` +
      `- الوكالة الشرعية: ${newPoaNumber}\n` +
      `- المحامي الشريك: ${newPartnerLawyer} | المحامي المكلف: ${newAssociateLawyer}\n` +
      `- الدفعة الأولية في الأمانات: ${newTrustDeposit}`
    );
  };

  // Fetch case details
  useEffect(() => {
    const fetchCaseDetails = async () => {
      const found = ALL_225_CASES.find((c) => c.id === caseId || c.caseNumberInternal === caseId);

      try {
        const token = localStorage.getItem("accessToken");
        if (token) {
          const res = await fetch(`http://localhost:3000/v1/cases/${caseId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const body = await res.json();
            if (body.success && body.data) {
              setCaseRecord(body.data);
              setLoading(false);
              return;
            }
          }
        }
      } catch (err) {
        // Fallback
      }

      if (found) {
        setCaseRecord(found);
      } else if (ALL_225_CASES.length > 0) {
        setCaseRecord(ALL_225_CASES[0]);
      }
      setLoading(false);
    };

    if (caseId) {
      fetchCaseDetails();
    }
  }, [caseId]);

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "open":
        return <span className="badge-ongoing">مفتوحة (منظورة)</span>;
      case "in_progress":
        return <span className="badge-pending">قيد الترافع والمداولة</span>;
      case "resolved":
        return <span className="badge-success">منتهية (صادر حكم)</span>;
      case "closed":
        return <span className="badge-closed">مغلقة ومؤرشفة</span>;
      default:
        return <span className="badge-ongoing">منظورة</span>;
    }
  };

  const getCaseTypeArabic = (type?: string) => {
    switch (type) {
      case "commercial": return "دعوى تجارية";
      case "labor": return "دعوى عمالية";
      case "personal_status": return "أحوال شخصية";
      case "execution": return "طلب تنفيذ";
      default: return type || "دعوى تجارية";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface text-on-surface flex items-center justify-center font-heading" dir="rtl">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-label-md text-on-surface-variant">جاري استدعاء الملف الكامل للقضية ومحرك الاستجابة السريعة...</p>
        </div>
      </div>
    );
  }

  const currentCase = caseRecord || ALL_225_CASES[0];

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col font-heading" dir="rtl">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-surface-container-lowest border-b border-outline-variant px-6 py-3.5 flex items-center justify-between shadow-level-1">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/cases")}
            className="p-2 rounded-soft bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant transition flex items-center gap-1 text-label-md font-semibold"
          >
            <ArrowRight className="w-4 h-4" />
            العودة للقضايا
          </button>

          <div className="h-6 w-px bg-outline-variant"></div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-title-md text-primary font-bold">
                ملف القضية: {currentCase.caseNumberInternal}
              </h1>
              {getStatusBadge(currentCase.status)}
            </div>
            <p className="text-label-sm text-on-surface-variant font-body">
              رقم القيد في ناجز: <span className="font-tabular font-semibold text-primary">{currentCase.najizCaseNumber || "44901928"}</span> | {currentCase.firmName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCreateModalOpen(true)}
            className="btn-secondary text-label-sm py-1.5 px-3 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            محرك القيد وتحديث القضية
          </button>

          <a
            href="https://najiz.sa"
            target="_blank"
            rel="noreferrer"
            className="btn-secondary text-label-sm py-1.5 px-3 flex items-center gap-1.5"
          >
            بوابة ناجز
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={() => alert(`تم مزامنة حالة القضية ${currentCase.caseNumberInternal} مع بوابة ناجز مباشرة!`)}
            className="btn-primary text-label-sm py-1.5 px-3.5 flex items-center gap-1.5 shadow-level-1"
          >
            <CheckCircle2 className="w-4 h-4" />
            مزامنة مع ناجز
          </button>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 max-w-container mx-auto w-full">
          {/* Case Summary Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="financial-card accent-navy rounded-card">
              <span className="text-label-sm text-on-surface-variant block">الموكل / الشركة المدعية</span>
              <span className="text-title-md font-bold text-on-surface block mt-1">{currentCase.clientName}</span>
              <span className="text-label-sm text-secondary font-body mt-1 block">اصالة / وكالة رسمية</span>
            </div>

            <div className="financial-card accent-blue rounded-card">
              <span className="text-label-sm text-on-surface-variant block">نوع الاختصاص والدرجة</span>
              <span className="text-title-md font-bold text-status-ongoing block mt-1">{getCaseTypeArabic(currentCase.caseType)}</span>
              <span className="text-label-sm text-on-surface-variant font-body mt-1 block">درجة ابتدائية الأولى</span>
            </div>

            <div className="financial-card accent-green rounded-card">
              <span className="text-label-sm text-on-surface-variant block">مبلغ المطالبة الأصلي</span>
              <span className="text-headline-lg-mobile font-bold text-secondary font-tabular block mt-1">{currentCase.claimAmount}</span>
              <span className="text-label-sm text-on-surface-variant font-body mt-1 block">دفعة الأمانات: 50,000 ر.س</span>
            </div>

            <div className="financial-card accent-amber rounded-card">
              <span className="text-label-sm text-on-surface-variant block">المحامي المسؤول والمكلف</span>
              <span className="text-title-md font-bold text-on-surface block mt-1">{currentCase.lawyerName}</span>
              <span className="text-label-sm text-on-surface-variant font-body mt-1 block">المستشار الشريك</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-outline-variant pb-3">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 rounded-soft text-label-md font-semibold transition ${
                activeTab === "overview" ? "btn-primary" : "btn-secondary"
              }`}
            >
              نظرة عامة وبيانات القيد
            </button>
            <button
              onClick={() => setActiveTab("hearings")}
              className={`px-4 py-2 rounded-soft text-label-md font-semibold transition ${
                activeTab === "hearings" ? "btn-primary" : "btn-secondary"
              }`}
            >
              جدول الجلسات والمواعيد (3)
            </button>
            <button
              onClick={() => setActiveTab("documents")}
              className={`px-4 py-2 rounded-soft text-label-md font-semibold transition ${
                activeTab === "documents" ? "btn-primary" : "btn-secondary"
              }`}
            >
              الأسانيد والمستندات ({uploadedFiles.length})
            </button>
            <button
              onClick={() => setActiveTab("finances")}
              className={`px-4 py-2 rounded-soft text-label-md font-semibold transition ${
                activeTab === "finances" ? "btn-primary" : "btn-secondary"
              }`}
            >
              العداد وحساب الأتعاب
            </button>
          </div>

          {/* Tab 1: Overview */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Info */}
              <div className="lg:col-span-2 space-y-6">
                <div className="card-level-1 p-6 rounded-card space-y-4">
                  <h3 className="text-title-md text-on-surface flex items-center gap-2 border-b border-outline-variant pb-3">
                    <Scale className="w-5 h-5 text-primary" />
                    بيانات القضية والأطراف (المملكة العربية السعودية)
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-body-md">
                    <div className="space-y-1 bg-surface-container-low p-3.5 rounded-soft border border-outline-variant">
                      <span className="text-label-sm text-on-surface-variant block">الرقم الداخلي</span>
                      <span className="font-semibold font-tabular text-primary">{currentCase.caseNumberInternal}</span>
                    </div>

                    <div className="space-y-1 bg-surface-container-low p-3.5 rounded-soft border border-outline-variant">
                      <span className="text-label-sm text-on-surface-variant block">رقم القيد في ناجز</span>
                      <span className="font-semibold font-tabular text-secondary">{currentCase.najizCaseNumber || "44901928"}</span>
                    </div>

                    <div className="space-y-1 bg-surface-container-low p-3.5 rounded-soft border border-outline-variant">
                      <span className="text-label-sm text-on-surface-variant block">الطرف الأول (المدعي / الموكل)</span>
                      <span className="font-semibold text-on-surface block">{currentCase.clientName}</span>
                      <div className="text-label-sm text-primary font-tabular flex items-center justify-between pt-1 border-t border-outline-variant/50">
                        <span>هوية/سجل: {newPlaintiffId}</span>
                        <span dir="ltr">{newPlaintiffPhone}</span>
                      </div>
                    </div>

                    <div className="space-y-1 bg-surface-container-low p-3.5 rounded-soft border border-outline-variant">
                      <span className="text-label-sm text-on-surface-variant block">الطرف الثاني (المدعى عليه / الخصم)</span>
                      <span className="font-semibold text-on-surface block">{newOpposingParty}</span>
                      <div className="text-label-sm text-primary font-tabular flex items-center justify-between pt-1 border-t border-outline-variant/50">
                        <span>هوية/سجل: {newDefendantId}</span>
                        <span dir="ltr">{newDefendantPhone}</span>
                      </div>
                    </div>

                    <div className="space-y-1 bg-surface-container-low p-3.5 rounded-soft border border-outline-variant md:col-span-2">
                      <span className="text-label-sm text-on-surface-variant block">المحكمة المختصة والدائرة القضائية</span>
                      <span className="font-semibold text-on-surface">{currentCase.courtName || newCourtName}</span>
                    </div>
                  </div>
                </div>

                {/* Legal Requirements Checklist */}
                <div className="card-level-1 p-6 rounded-card space-y-3">
                  <h3 className="text-title-md text-on-surface flex items-center gap-2 border-b border-outline-variant pb-3">
                    <ShieldCheck className="w-5 h-5 text-secondary" />
                    استيفاء شروط القيد النظامية (نظام القضاء السعودي)
                  </h3>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 rounded-soft bg-surface-container-low border border-outline-variant text-body-md">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
                        <span>الإخطار الكتابي المسبق قبل 15 يوماً (المادة 19 محاكم تجارية)</span>
                      </div>
                      <span className="badge-success">مكتمل ومرفق</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-soft bg-surface-container-low border border-outline-variant text-body-md">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
                        <span>الوكالة الشرعية الموثقة من منصة ناجز</span>
                      </div>
                      <span className="badge-success font-tabular">رقم: {newPoaNumber}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-soft bg-surface-container-low border border-outline-variant text-body-md">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
                        <span>عقد الاتفاقية وكشف الحساب المصادق عليه</span>
                      </div>
                      <span className="badge-success">معتمد 100%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar Info & Team */}
              <div className="space-y-6">
                <div className="card-level-1 p-5 rounded-card space-y-4">
                  <h3 className="text-label-md font-semibold text-on-surface border-b border-outline-variant pb-2">
                    فريق العمل المكلف
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-2.5 rounded-soft bg-surface-container-low border border-outline-variant">
                      <div className="w-8 h-8 rounded-card bg-primary text-on-primary flex items-center justify-center font-bold text-label-sm">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-label-md font-semibold text-on-surface">{currentCase.lawyerName}</p>
                        <p className="text-label-sm text-on-surface-variant font-body">المحامي الشريك المسؤول</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-2.5 rounded-soft bg-surface-container-low border border-outline-variant">
                      <div className="w-8 h-8 rounded-card bg-surface-container-high text-primary flex items-center justify-center font-bold text-label-sm">
                        <UserCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-label-md font-semibold text-on-surface">{newAssociateLawyer}</p>
                        <p className="text-label-sm text-on-surface-variant font-body">المحامي المساعد المكلف بالترافع</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card-level-1 p-5 rounded-card space-y-3">
                  <h3 className="text-label-md font-semibold text-on-surface border-b border-outline-variant pb-2">
                    المكتب والمالية
                  </h3>
                  <div className="space-y-2 text-label-md font-body">
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">المكتب:</span>
                      <span className="font-semibold text-on-surface">{currentCase.firmName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">تاريخ القيد:</span>
                      <span className="font-semibold font-tabular text-on-surface">{currentCase.openedAt || "2026-07-01"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">الدفعة المقدمة:</span>
                      <span className="font-semibold font-tabular text-secondary">{newTrustDeposit}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Hearings */}
          {activeTab === "hearings" && (
            <div className="card-level-1 p-6 rounded-card space-y-4">
              <h3 className="text-title-md text-on-surface flex items-center gap-2 border-b border-outline-variant pb-3">
                <Calendar className="w-5 h-5 text-primary" />
                أجندة الجلسات القضائية المحتسبة لهذه القضية
              </h3>

              <div className="space-y-3">
                <div className="card-interactive p-4 rounded-card flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-surface-container-high border border-outline-variant rounded-card p-3 text-center min-w-[70px]">
                      <span className="block text-headline-lg-mobile font-bold text-primary">28</span>
                      <span className="block text-label-sm text-on-surface-variant">يوليو 2026</span>
                    </div>
                    <div>
                      <h4 className="text-label-md font-semibold text-on-surface">جلسة المرافعة وتبادل المذكرات الأولى</h4>
                      <p className="text-label-sm text-on-surface-variant font-body">المحكمة التجارية بالرياض - الدائرة الابتدائية الأولى (قاعة 4)</p>
                      <span className="badge-ongoing mt-1 inline-block">جلسة قادمة</span>
                    </div>
                  </div>
                  <button className="btn-secondary text-label-sm">تفاصيل الجلسة</button>
                </div>

                <div className="card-interactive p-4 rounded-card flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-surface-container-high border border-outline-variant rounded-card p-3 text-center min-w-[70px]">
                      <span className="block text-headline-lg-mobile font-bold text-outline">10</span>
                      <span className="block text-label-sm text-on-surface-variant">يوليو 2026</span>
                    </div>
                    <div>
                      <h4 className="text-label-md font-semibold text-on-surface">جلسة استلام اللائحة التحضيرية</h4>
                      <p className="text-label-sm text-on-surface-variant font-body">تم تقديم المذكرة عبر بوابة ناجز</p>
                      <span className="badge-closed mt-1 inline-block">منتهية</span>
                    </div>
                  </div>
                  <button className="btn-secondary text-label-sm">عرض المحضر</button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Documents & Upload Dropzone */}
          {activeTab === "documents" && (
            <div className="card-level-1 p-6 rounded-card space-y-4">
              <div className="flex items-center justify-between border-b border-outline-variant pb-3">
                <h3 className="text-title-md text-on-surface flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  المستندات والأسانيد المرفقة الخاصة بهذه الدعوى
                </h3>
                <span className="text-label-sm text-primary font-body">OCR & Digital Seal Active</span>
              </div>

              {/* Upload Dropzone inside Documents Tab */}
              <label className="border-2 border-dashed border-outline-variant hover:border-primary/50 rounded-card p-4 flex flex-col items-center justify-center cursor-pointer bg-surface-container-low transition">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.docx,.png,.jpg"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Plus className="w-6 h-6 text-primary mb-1" />
                <span className="text-label-md font-semibold text-on-surface">اضغط هنا لرفع مستندات جديدة للقضية أو اسحب الملفات</span>
                <span className="text-label-sm text-on-surface-variant font-body mt-0.5">يدعم صيغ (PDF, DOCX, PNG, JPG)</span>
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="card-interactive p-4 rounded-card flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-6 h-6 text-primary shrink-0" />
                      <div className="overflow-hidden">
                        <p className="text-label-md font-semibold text-on-surface truncate">{file.name}</p>
                        <p className="text-label-sm text-on-surface-variant font-body">{file.size} | {file.type}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="badge-success">مفحوص OCR</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(file.id)}
                        className="p-1 rounded-soft hover:bg-surface-container-high text-error transition text-label-sm"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Finances & Live Timer */}
          {activeTab === "finances" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LiveTimer hourlyRate={650} caseId={currentCase.id} />

              <div className="card-level-1 p-6 rounded-card space-y-4">
                <h3 className="text-title-md text-on-surface border-b border-outline-variant pb-3">
                  سجل الساعات المحتسبة والرسوم
                </h3>

                <div className="space-y-2 text-body-md font-body">
                  <div className="flex justify-between p-3 rounded-soft bg-surface-container-low border border-outline-variant">
                    <span>دراسة الوقائع وإعداد الإخطار الكتابي:</span>
                    <span className="font-semibold font-tabular text-primary">3.5 ساعة (2,275 ر.س)</span>
                  </div>

                  <div className="flex justify-between p-3 rounded-soft bg-surface-container-low border border-outline-variant">
                    <span>صياغة المذكرة الجوابية الأولى:</span>
                    <span className="font-semibold font-tabular text-primary">5.0 ساعات (3,250 ر.س)</span>
                  </div>

                  <div className="flex justify-between p-3.5 rounded-soft bg-secondary-container/20 border border-secondary/30 font-semibold text-secondary">
                    <span>إجمالي الساعات المسجلة:</span>
                    <span className="font-tabular font-bold">8.5 ساعة (5,525 ر.س)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Case Intake & Update Engine Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-on-surface/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="card-level-2 max-w-2xl w-full max-h-[88vh] overflow-y-auto my-auto p-6 rounded-card space-y-5 font-heading text-right" dir="rtl">
            <div className="flex items-center justify-between border-b border-outline-variant pb-3">
              <div>
                <h3 className="text-title-md text-primary flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                  محرك قيد وتأسيس القضايا وتكليف فريق العمل (Intake Engine)
                </h3>
                <p className="text-label-sm text-on-surface-variant font-body">تزامن تلقائي مع ناجز محاكم وتوثيق وحفظ الأمانات</p>
              </div>
              <button onClick={() => setCreateModalOpen(false)} className="text-label-md text-on-surface-variant hover:text-on-surface">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewCaseSubmit} className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-surface-container-low p-3 rounded-card border border-outline-variant">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-label-sm font-semibold text-on-surface">الرقم الداخلي للقضية</label>
                    <span className="text-[10px] bg-secondary-container/50 text-secondary px-1.5 py-0.5 rounded-pill font-bold">تسلسلي آلي ⚡</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={newCaseNumber}
                    onChange={(e) => setNewCaseNumber(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-soft px-2.5 py-1.5 text-body-md text-primary font-tabular font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-label-sm font-semibold text-on-surface">رقم القيد في ناجز</label>
                  <input
                    type="text"
                    required
                    value={newNajizNumber}
                    onChange={(e) => setNewNajizNumber(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-soft px-2.5 py-1.5 text-body-md text-on-surface font-tabular"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-label-sm font-semibold text-on-surface">نوع الاختصاص والمحكمة</label>
                  <select
                    value={newCaseType}
                    onChange={(e) => {
                      setNewCaseType(e.target.value as any);
                      setSelectedNajizMainCatId("");
                      setSelectedNajizSubCatId("");
                    }}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-soft px-2 py-1.5 text-body-md text-on-surface font-semibold"
                  >
                    <option value="commercial">خامساً: المحاكم التجارية</option>
                    <option value="labor">سادساً: المحاكم العمالية</option>
                    <option value="personal_status">أولاً: محاكم الأحوال الشخصية</option>
                    <option value="execution">ثانياً: محاكم التنفيذ</option>
                    <option value="criminal">ثالثاً: المحاكم الجزائية</option>
                    <option value="general">رابعاً: المحاكم العامة</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-label-sm font-semibold text-on-surface">درجة التقاضي</label>
                  <select
                    value={newDegree}
                    onChange={(e) => setNewDegree(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-soft px-2 py-1.5 text-body-md text-on-surface"
                  >
                    <option value="درجة ابتدائية (الدرجة الأولى)">درجة ابتدائية (الدرجة الأولى)</option>
                    <option value="محكمة الاستئناف">محكمة الاستئناف</option>
                    <option value="المحكمة العليا">المحكمة العليا</option>
                    <option value="محكمة التنفيذ (تنفيذ الأحكام)">محكمة التنفيذ (تنفيذ الأحكام)</option>
                  </select>
                </div>
              </div>

              {/* Official Najiz Classification Manual Tree Dropdowns */}
              <div className="p-3.5 rounded-card bg-surface-container-low border border-outline-variant space-y-3">
                <div className="flex items-center justify-between text-body-md">
                  <span className="font-semibold text-primary flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-primary" />
                    دليل تصنيف جميع أنواع الدعاوى القضائية لوزارة العدل (moj.gov.sa)
                  </span>
                  <span className="text-label-sm text-on-surface-variant font-body">1443هـ - 2022م</span>
                </div>

                {/* Instant Search Bar for All MOJ Case Types */}
                <div className="relative">
                  <div className="flex items-center gap-2 bg-surface-container-lowest border border-outline-variant rounded-soft px-3 py-1.5 text-body-md">
                    <Search className="w-4 h-4 text-primary shrink-0" />
                    <input
                      type="text"
                      placeholder="ابحث فوراً في جميع تصانيف القضايا لوزارة العدل (مثال: نفقة، فسخ، سند لأمر، علامة تجارية، إيجار)..."
                      value={najizSearchQuery}
                      onChange={(e) => setNajizSearchQuery(e.target.value)}
                      className="w-full bg-transparent text-on-surface placeholder-on-surface-variant/50 focus:outline-none font-body"
                    />
                    {najizSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setNajizSearchQuery("")}
                        className="text-label-sm text-on-surface-variant hover:text-on-surface"
                      >
                        إلغاء
                      </button>
                    )}
                  </div>

                  {searchResultsNajiz.length > 0 && (
                    <div className="absolute z-20 top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-surface-container-lowest border border-primary/40 rounded-card shadow-level-2 p-1.5 space-y-1">
                      {searchResultsNajiz.map((res) => (
                        <div
                          key={`search-res-${res.id}`}
                          onClick={() => {
                            setSelectedNajizSubCatId(res.id);
                            setNajizSearchQuery("");
                          }}
                          className="p-2 rounded-soft hover:bg-surface-container-low cursor-pointer transition flex items-center justify-between text-body-md"
                        >
                          <div>
                            <span className="font-semibold text-on-surface">{res.name}</span>
                            <span className="text-label-sm text-primary font-body mr-2">({res.courtName} - {res.mainCategoryName})</span>
                          </div>
                          <span className="text-label-sm text-secondary font-semibold">تحديد القضية</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-label-sm font-semibold text-on-surface">التصنيف الرئيسي في ناجز</label>
                    <select
                      value={currentNajizMainCat?.id || ""}
                      onChange={(e) => {
                        setSelectedNajizMainCatId(e.target.value);
                        setSelectedNajizSubCatId("");
                      }}
                      className="w-full mt-1 bg-surface-container-lowest border border-outline-variant rounded-soft px-2.5 py-1.5 text-body-md text-on-surface font-semibold"
                    >
                      {availableNajizMainCats.map((mc) => (
                        <option key={mc.id} value={mc.id}>
                          {mc.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-label-sm font-semibold text-on-surface">التصنيف الفرعي المعتمد في ناجز</label>
                    <select
                      value={selectedNajizSubCatId}
                      onChange={(e) => setSelectedNajizSubCatId(e.target.value)}
                      className="w-full mt-1 bg-surface-container-lowest border border-outline-variant rounded-soft px-2.5 py-1.5 text-body-md text-primary font-semibold"
                    >
                      <option value="">-- اختر التصنيف الفرعي المعتمد --</option>
                      {availableNajizSubCats.map((sc) => (
                        <option key={sc.id} value={sc.id}>
                          {sc.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-label-md font-semibold text-on-surface">المحكمة المختصة والدائرة القضائية (اختيارات محددة)</label>
                <select
                  value={newCourtName}
                  onChange={(e) => setNewCourtName(e.target.value)}
                  className="w-full mt-1 bg-surface-container-lowest border border-outline-variant rounded-soft px-3 py-2 text-body-md text-on-surface"
                >
                  <option value="المحكمة التجارية بالرياض - الدائرة الابتدائية الأولى">المحكمة التجارية بالرياض - الدائرة الابتدائية الأولى</option>
                  <option value="المحكمة التجارية بجدة - الدائرة الثانية">المحكمة التجارية بجدة - الدائرة الثانية</option>
                  <option value="المحكمة العمالية بالرياض - الدائرة الأولى">المحكمة العمالية بالرياض - الدائرة الأولى</option>
                  <option value="محكمة التنفيذ بالرياض - الدائرة السادسة">محكمة التنفيذ بالرياض - الدائرة السادسة</option>
                  <option value="ديوان المظالم - المحكمة الإدارية بالرياض">ديوان المظالم - المحكمة الإدارية بالرياض</option>
                </select>
              </div>

              {/* Dynamic Saudi Judicial System Requirements Section based on newCaseType */}
              <div className="p-4 rounded-card bg-primary/5 border border-primary/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-label-md font-semibold text-primary flex items-center gap-1.5">
                    ⚖️ متطلبات القيد النظامية الذكية - نظام القضاء السعودي
                  </span>
                  <span className="text-label-sm font-body text-primary">نظام ناجز والتكامل العدلي</span>
                </div>

                {newCaseType === "commercial" && (
                  <div className="space-y-2 text-body-md">
                    <p className="text-on-surface font-semibold">1. متطلبات نظام المحاكم التجارية (المادة 19):</p>
                    <label className="flex items-center gap-2 cursor-pointer bg-surface-container-lowest p-2.5 rounded-soft border border-outline-variant">
                      <input
                        type="checkbox"
                        checked={commercialNoticeConfirmed}
                        onChange={(e) => setCommercialNoticeConfirmed(e.target.checked)}
                        className="w-4 h-4 accent-secondary"
                      />
                      <span className="text-on-surface">
                        تم إرسال الإخطار الكتابي المباشر للخصم قبل 15 يوماً من قيد الدعوى (شرط وجوبي المادة 19)
                      </span>
                    </label>
                    <p className="text-label-sm text-on-surface-variant font-body">الأسانيد المطلوبة: عقد التوريد/الاتفاقية، كشف الحساب المصادق عليه، صورة الإخطار.</p>
                  </div>
                )}

                {newCaseType === "labor" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-body-md">
                    <div>
                      <label className="text-label-sm font-semibold text-on-surface">رقم عقد العمل الموثق (منصة قوى QIWA)</label>
                      <input
                        type="text"
                        value={qiwaContractId}
                        onChange={(e) => setQiwaContractId(e.target.value)}
                        className="w-full mt-1 bg-surface-container-lowest border border-outline-variant rounded-soft px-3 py-1.5 text-body-md text-primary font-tabular"
                      />
                    </div>
                    <div>
                      <label className="text-label-sm font-semibold text-on-surface">رقم محضر التسوية / الصلح (منصة تراضي Taradhi)</label>
                      <input
                        type="text"
                        value={taradhiSettlementId}
                        onChange={(e) => setTaradhiSettlementId(e.target.value)}
                        className="w-full mt-1 bg-surface-container-lowest border border-outline-variant rounded-soft px-3 py-1.5 text-body-md text-primary font-tabular"
                      />
                    </div>
                    <div className="md:col-span-2 text-label-sm text-on-surface-variant font-body">
                      الأسانيد المطلوبة: برينت التأمينات الاجتماعية GOSI، عقد قوى الموثق، وثيقة الصلح أو محضر التعذر من منصة تراضي.
                    </div>
                  </div>
                )}

                {newCaseType === "execution" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-body-md">
                    <div>
                      <label className="text-label-sm font-semibold text-on-surface">نوع السند التنفيذي (Executive Title)</label>
                      <select
                        value={executiveTitleType}
                        onChange={(e) => setExecutiveTitleType(e.target.value)}
                        className="w-full mt-1 bg-surface-container-lowest border border-outline-variant rounded-soft px-2 py-1.5 text-body-md text-on-surface font-semibold"
                      >
                        <option value="سند لأمر نظامي (المادة 9)">سند لأمر نظامي (المادة 9)</option>
                        <option value="شيك محرر بدون رصيد قائم">شيك محرر بدون رصيد قائم</option>
                        <option value="عقد إيجار موثق (منصة إيجار Ejar)">عقد إيجار موثق (منصة إيجار Ejar)</option>
                        <option value="صك حكم قضائي نهائي واجب التنفيذ">صك حكم قضائي نهائي واجب التنفيذ</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-label-sm font-semibold text-on-surface">رقم السند التنفيذي المسجل</label>
                      <input
                        type="text"
                        value={executiveTitleId}
                        onChange={(e) => setExecutiveTitleId(e.target.value)}
                        className="w-full mt-1 bg-surface-container-lowest border border-outline-variant rounded-soft px-3 py-1.5 text-body-md text-primary font-tabular"
                      />
                    </div>
                    <div className="md:col-span-2 text-label-sm text-on-surface-variant font-body">
                      الأسانيد المطلوبة: أصل السند التنفيذي، ورقة الإعتراض/الورقة البنكية للامتناع عن الدفع.
                    </div>
                  </div>
                )}

                {newCaseType === "personal_status" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-body-md">
                    <div>
                      <label className="text-label-sm font-semibold text-on-surface">رقم محضر الصلح (منصة تراضٍ TARADHI)</label>
                      <input
                        type="text"
                        value={taradhiReconciliationId}
                        onChange={(e) => setTaradhiReconciliationId(e.target.value)}
                        className="w-full mt-1 bg-surface-container-lowest border border-outline-variant rounded-soft px-3 py-1.5 text-body-md text-primary font-tabular"
                      />
                    </div>
                    <div className="text-label-sm text-on-surface-variant font-body flex items-center">
                      الأسانيد المطلوبة: صك الزواج/الطلاق، الهوية الوطنية، محاضر منصة تراضٍ.
                    </div>
                  </div>
                )}

                {newCaseType === "administrative" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-body-md">
                    <div>
                      <label className="text-label-sm font-semibold text-on-surface">تاريخ التظلم الإداري المسبق (ديوان المظالم)</label>
                      <input
                        type="date"
                        value={adminGrievanceDate}
                        onChange={(e) => setAdminGrievanceDate(e.target.value)}
                        className="w-full mt-1 bg-surface-container-lowest border border-outline-variant rounded-soft px-3 py-1.5 text-body-md text-primary font-tabular"
                      />
                    </div>
                    <div className="text-label-sm text-on-surface-variant font-body flex items-center">
                      الأسانيد المطلوبة: صورة القرار الإداري المطعون فيه، إثبات تقديم التظلم للجهة الحكومية.
                    </div>
                  </div>
                )}
              </div>

              {/* Section 2: Parties & Details (أطراف الدعوى) */}
              <div className="p-3.5 rounded-card bg-surface-container-low border border-outline-variant space-y-4">
                {/* 1. Plaintiff Details (طرف المدعي / الموكل) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-outline-variant pb-2">
                    <span className="text-label-md font-semibold text-primary flex items-center gap-1.5">
                      <User className="w-4 h-4 text-primary" />
                      بيانات الطرف الأول (المدعي / الموكل)
                    </span>
                    <span className="text-label-sm text-secondary font-semibold">بيانات الاتصال والهوية</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="text-label-sm font-semibold text-on-surface">اسم الموكل / الشركة المدعية</label>
                      <input
                        type="text"
                        required
                        value={newClientName}
                        onChange={(e) => setNewClientName(e.target.value)}
                        className="w-full mt-1 bg-surface-container-lowest border border-outline-variant rounded-soft px-3 py-1.5 text-body-md text-on-surface"
                      />
                    </div>

                    <div>
                      <label className="text-label-sm font-semibold text-on-surface">رقم الهوية / السجل التجاري (المدعي)</label>
                      <input
                        type="text"
                        required
                        placeholder="1010984521"
                        value={newPlaintiffId}
                        onChange={(e) => setNewPlaintiffId(e.target.value)}
                        className="w-full mt-1 bg-surface-container-lowest border border-outline-variant rounded-soft px-3 py-1.5 text-body-md text-primary font-tabular"
                      />
                    </div>

                    <div>
                      <label className="text-label-sm font-semibold text-on-surface">رقم جوال المدعي (الموكل)</label>
                      <input
                        type="text"
                        required
                        placeholder="0501234567"
                        value={newPlaintiffPhone}
                        onChange={(e) => setNewPlaintiffPhone(e.target.value)}
                        className="w-full mt-1 bg-surface-container-lowest border border-outline-variant rounded-soft px-3 py-1.5 text-body-md text-primary font-tabular"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-label-sm font-semibold text-on-surface">صفة الموكل في الدعوى</label>
                      <select
                        value={newClientCapacity}
                        onChange={(e) => setNewClientCapacity(e.target.value)}
                        className="w-full mt-1 bg-surface-container-lowest border border-outline-variant rounded-soft px-2.5 py-1.5 text-body-md text-on-surface"
                      >
                        <option value="مدعي (اصالة)">مدعي (اصالة)</option>
                        <option value="مدعي (وكالة)">مدعي (وكالة)</option>
                        <option value="مدعى عليه">مدعى عليه</option>
                        <option value="منفذ ضده">منفذ ضده</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-label-sm font-semibold text-on-surface">رقم الوكالة / التوثيق (ناجز)</label>
                      <input
                        type="text"
                        required
                        value={newPoaNumber}
                        onChange={(e) => setNewPoaNumber(e.target.value)}
                        className="w-full mt-1 bg-surface-container-lowest border border-outline-variant rounded-soft px-3 py-1.5 text-body-md text-on-surface font-tabular"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Defendant Details (طرف المدعى عليه / الخصم) */}
                <div className="space-y-3 pt-3 border-t border-outline-variant">
                  <div className="flex items-center justify-between border-b border-outline-variant pb-2">
                    <span className="text-label-md font-semibold text-status-warning flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-status-warning" />
                      بيانات الطرف الثاني (المدعى عليه / الخصم)
                    </span>
                    <span className="text-label-sm text-on-surface-variant font-body">بيانات التبليغ القضائي</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="text-label-sm font-semibold text-on-surface">اسم الخصم / الشركة المدعى عليها</label>
                      <input
                        type="text"
                        required
                        value={newOpposingParty}
                        onChange={(e) => setNewOpposingParty(e.target.value)}
                        className="w-full mt-1 bg-surface-container-lowest border border-outline-variant rounded-soft px-3 py-1.5 text-body-md text-on-surface"
                      />
                    </div>

                    <div>
                      <label className="text-label-sm font-semibold text-on-surface">رقم الهوية / السجل التجاري (المدعى عليه)</label>
                      <input
                        type="text"
                        required
                        placeholder="1010776432"
                        value={newDefendantId}
                        onChange={(e) => setNewDefendantId(e.target.value)}
                        className="w-full mt-1 bg-surface-container-lowest border border-outline-variant rounded-soft px-3 py-1.5 text-body-md text-primary font-tabular"
                      />
                    </div>

                    <div>
                      <label className="text-label-sm font-semibold text-on-surface">رقم جوال المدعى عليه</label>
                      <input
                        type="text"
                        required
                        placeholder="0559876543"
                        value={newDefendantPhone}
                        onChange={(e) => setNewDefendantPhone(e.target.value)}
                        className="w-full mt-1 bg-surface-container-lowest border border-outline-variant rounded-soft px-3 py-1.5 text-body-md text-primary font-tabular"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Delegation */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-label-md font-semibold text-on-surface">المحامي الشريك المسؤول (من محامي المكتب)</label>
                  <select
                    value={newPartnerLawyer}
                    onChange={(e) => setNewPartnerLawyer(e.target.value)}
                    className="w-full mt-1 bg-surface-container-lowest border border-outline-variant rounded-soft px-3 py-2 text-body-md text-on-surface font-semibold"
                  >
                    {availableLawyers.map((l) => (
                      <option key={l.id} value={l.name}>
                        {l.name} - ({l.title})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-label-md font-semibold text-on-surface">المحامي المساعد المكلف بالترافع</label>
                  <select
                    value={newAssociateLawyer}
                    onChange={(e) => setNewAssociateLawyer(e.target.value)}
                    className="w-full mt-1 bg-surface-container-lowest border border-outline-variant rounded-soft px-3 py-2 text-body-md text-on-surface font-semibold"
                  >
                    {availableLawyers.map((l) => (
                      <option key={`assoc-${l.id}`} value={l.name}>
                        {l.name} - ({l.title})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Section 4: Finances */}
              <div className="grid grid-cols-3 gap-3 bg-surface-container-low p-3 rounded-card border border-outline-variant">
                <div>
                  <label className="text-label-sm font-semibold text-on-surface">مبلغ المطالبة الأصلي</label>
                  <input
                    type="text"
                    value={newClaimAmount}
                    onChange={(e) => setNewClaimAmount(e.target.value)}
                    className="w-full mt-1 bg-surface-container-lowest border border-outline-variant rounded-soft px-2.5 py-1.5 text-body-md text-primary font-tabular font-bold"
                  />
                </div>

                <div>
                  <label className="text-label-sm font-semibold text-on-surface">أتعاب العقد (اختياري)</label>
                  <input
                    type="text"
                    value={newContractFee}
                    onChange={(e) => setNewContractFee(e.target.value)}
                    className="w-full mt-1 bg-surface-container-lowest border border-outline-variant rounded-soft px-2.5 py-1.5 text-body-md text-on-surface font-tabular"
                  />
                </div>

                <div>
                  <label className="text-label-sm font-semibold text-secondary">دفعة الأمانات الأولية</label>
                  <input
                    type="text"
                    value={newTrustDeposit}
                    onChange={(e) => setNewTrustDeposit(e.target.value)}
                    className="w-full mt-1 bg-surface-container-lowest border border-secondary/40 rounded-soft px-2.5 py-1.5 text-body-md text-secondary font-tabular font-bold"
                  />
                </div>
              </div>

              {/* Section 5: Real File Upload Dropzone */}
              <div className="space-y-3 p-4 rounded-card bg-surface-container-low border border-outline-variant">
                <div className="flex items-center justify-between">
                  <label className="text-label-md font-semibold text-on-surface flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    رفع المستندات والأسانيد الأولية (العقد، الوكالة، الفواتير)
                  </label>
                  <span className="text-label-sm text-primary font-body">OCR Ready</span>
                </div>

                {/* File Drop Area */}
                <label className="border-2 border-dashed border-outline-variant hover:border-primary/50 rounded-card p-4 flex flex-col items-center justify-center cursor-pointer bg-surface-container-lowest transition">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.docx,.png,.jpg"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Plus className="w-6 h-6 text-primary mb-1" />
                  <span className="text-label-md font-semibold text-on-surface">اضغط هنا لرفع مستندات القضية أو اسحب الملفات</span>
                  <span className="text-label-sm text-on-surface-variant font-body mt-0.5">يدعم صيغ (PDF, DOCX, PNG, JPG)</span>
                </label>

                {/* Uploaded Files List */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2 pt-2">
                    {uploadedFiles.map((file) => (
                      <div
                        key={file.id}
                        className="p-2.5 rounded-soft bg-surface-container-lowest border border-outline-variant flex items-center justify-between text-body-md"
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <FileText className="w-4 h-4 text-primary shrink-0" />
                          <div className="truncate">
                            <p className="font-semibold text-on-surface truncate">{file.name}</p>
                            <p className="text-label-sm text-on-surface-variant font-body">{file.size} | {file.type}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="badge-success">
                            جاهز للتحليل OCR
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(file.id)}
                            className="p-1 rounded-soft hover:bg-surface-container-high text-error transition"
                            title="حذف الملف"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="btn-secondary"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="btn-primary inline-flex items-center gap-2 shadow-level-1"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  حفظ وتأكيد بيانات القضية
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
