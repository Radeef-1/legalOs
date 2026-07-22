"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { SEEDED_FIRMS, ALL_225_CASES, LawFirm, CaseRecord } from "@/data/seededFirmsData";
import { NAJIZ_OFFICIAL_CLASSIFICATIONS, ALL_FLAT_NAJIZ_SUB_CATEGORIES } from "@/data/najizClassificationsData";
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  Building2,
  UserCheck,
  Scale,
  Landmark,
  CheckCircle2,
  ChevronLeft,
  Users,
  User,
  FileText,
  BookOpen,
} from "lucide-react";

export default function CasesPage() {
  const router = useRouter();
  const [casesList, setCasesList] = useState<CaseRecord[]>(ALL_225_CASES);
  const [selectedFirmId, setSelectedFirmId] = useState<string>("all");
  const [selectedLawyerId, setSelectedLawyerId] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  // Auto-connect with Backend API
  React.useEffect(() => {
    const fetchApiCases = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const headers: any = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch("http://localhost:3000/v1/cases", { headers });
        if (res.ok) {
          const body = await res.json();
          if (body.success && Array.isArray(body.data) && body.data.length > 0) {
            setCasesList(body.data);
          }
        }
      } catch (err) {
        // Soft fallback to seeded firms dataset
      }
    };
    fetchApiCases();
  }, []);

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

  // Real File Uploads State
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

  // Get available lawyers based on selected firm
  const currentFirm = SEEDED_FIRMS.find((f) => f.id === selectedFirmId);
  const availableLawyers = selectedFirmId === "all"
    ? SEEDED_FIRMS.flatMap((f) => f.lawyers)
    : currentFirm
    ? currentFirm.lawyers
    : [];

  const handleCreateNewCaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created: CaseRecord = {
      id: `case-new-${Date.now()}`,
      firmId: selectedFirmId === "all" ? "firm-1" : selectedFirmId,
      firmName: selectedFirmId === "all" ? SEEDED_FIRMS[0].name : (currentFirm?.name || SEEDED_FIRMS[0].name),
      caseNumberInternal: newCaseNumber,
      najizCaseNumber: newNajizNumber,
      caseType: newCaseType,
      courtName: newCourtName,
      status: "open",
      clientName: newClientName,
      lawyerName: newPartnerLawyer,
      lawyerEmail: "lawyer@firma.sa",
      openedAt: new Date().toISOString().split("T")[0],
      claimAmount: newClaimAmount,
    };

    setCasesList((prev) => [created, ...prev]);
    setCreateModalOpen(false);
    alert(
      `تم قيد وتأسيس القضية بنجاح!\n` +
      `- رقم القيد في ناجز: ${newNajizNumber}\n` +
      `- الوكالة الشرعية: ${newPoaNumber}\n` +
      `- المحامي الشريك: ${newPartnerLawyer} | المحامي المكلف: ${newAssociateLawyer}\n` +
      `- الدفعة الأولية في الأمانات: ${newTrustDeposit}`
    );
  };

  // Filter cases
  const filteredCases = casesList.filter((c) => {
    if (selectedFirmId !== "all" && c.firmId !== selectedFirmId) return false;
    if (selectedLawyerId !== "all") {
      const lawyer = availableLawyers.find((l) => l.id === selectedLawyerId);
      if (lawyer && c.lawyerName !== lawyer.name) return false;
    }
    if (statusFilter && c.status !== statusFilter) return false;
    if (typeFilter && c.caseType !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchNum = c.caseNumberInternal.toLowerCase().includes(q);
      const matchNajiz = c.najizCaseNumber.includes(q);
      const matchLawyer = c.lawyerName.toLowerCase().includes(q);
      const matchClient = c.clientName.toLowerCase().includes(q);
      if (!matchNum && !matchNajiz && !matchLawyer && !matchClient) return false;
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <span className="badge-ongoing">مفتوحة</span>;
      case "in_progress":
        return <span className="badge-pending">قيد الترافع</span>;
      case "resolved":
        return <span className="badge-success">منتهية (صادر حكم)</span>;
      case "closed":
        return <span className="badge-closed">مغلقة ومؤرشفة</span>;
      default:
        return null;
    }
  };

  const getCaseTypeArabic = (type: string) => {
    switch (type) {
      case "commercial": return "تجاري";
      case "labor": return "عمالي";
      case "personal_status": return "أحوال شخصية";
      case "execution": return "تنفيذ";
      default: return type;
    }
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col font-heading" dir="rtl">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-surface-container-lowest border-b border-outline-variant px-6 py-3.5 flex items-center justify-between shadow-level-1">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-card bg-primary text-on-primary flex items-center justify-center font-bold shadow-level-1">
            <Scale className="w-5 h-5 text-on-primary" />
          </div>
          <div>
            <h1 className="text-title-md text-primary">
              سجل القضايا والمكاتب (Multi-Firm Law Engine)
            </h1>
            <p className="text-label-sm text-on-surface-variant font-body">
              إدارة 3 مكاتب محاماة | 15 محامياً | 225 قضية مسجلة
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCreateModalOpen(true)}
            className="btn-primary flex items-center gap-2 text-label-md shadow-level-1"
          >
            <Plus className="w-4 h-4" />
            فتح قضية جديدة
          </button>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Summary Cards (3 Firms, 15 Lawyers, 225 Cases) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="financial-card accent-navy rounded-card flex items-center justify-between">
              <div>
                <div className="text-label-md text-on-surface-variant">مكاتب المحاماة المسجلة</div>
                <div className="text-headline-lg-mobile font-bold text-primary font-tabular mt-1">3 مكاتب</div>
                <div className="text-label-sm text-on-surface-variant">الرياض | جدة | الدمام</div>
              </div>
              <Building2 className="w-8 h-8 text-primary/40" />
            </div>

            <div className="financial-card accent-blue rounded-card flex items-center justify-between">
              <div>
                <div className="text-label-md text-on-surface-variant">إجمالي المحامين والمستشارين</div>
                <div className="text-headline-lg-mobile font-bold text-status-ongoing font-tabular mt-1">15 محامياً</div>
                <div className="text-label-sm text-on-surface-variant">5 محامين لكل مكتب</div>
              </div>
              <Users className="w-8 h-8 text-status-ongoing/40" />
            </div>

            <div className="financial-card accent-green rounded-card flex items-center justify-between">
              <div>
                <div className="text-label-md text-on-surface-variant">إجمالي القضايا النشطة</div>
                <div className="text-headline-lg-mobile font-bold text-secondary font-tabular mt-1">225 قضية</div>
                <div className="text-label-sm text-on-surface-variant">15 قضية لكل محامٍ</div>
              </div>
              <Briefcase className="w-8 h-8 text-secondary/40" />
            </div>
          </div>

          {/* Law Firm Selector Tabs */}
          <div className="card-level-1 p-3 rounded-card flex flex-wrap items-center gap-2">
            <span className="text-label-md font-semibold text-on-surface-variant px-3">اختر المكتب:</span>
            <button
              onClick={() => {
                setSelectedFirmId("all");
                setSelectedLawyerId("all");
              }}
              className={`px-4 py-2 rounded-soft text-label-md font-semibold transition ${
                selectedFirmId === "all"
                  ? "btn-primary"
                  : "btn-secondary"
              }`}
            >
              جميع المكاتب (3 مكاتب - 225 قضية)
            </button>

            {SEEDED_FIRMS.map((firm) => (
              <button
                key={firm.id}
                onClick={() => {
                  setSelectedFirmId(firm.id);
                  setSelectedLawyerId("all");
                }}
                className={`px-4 py-2 rounded-soft text-label-md font-semibold transition flex items-center gap-2 ${
                  selectedFirmId === firm.id
                    ? "btn-primary"
                    : "btn-secondary"
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                {firm.name} ({firm.city})
              </button>
            ))}
          </div>

          {/* Filters Bar */}
          <div className="card-level-1 p-4 rounded-card grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-on-surface-variant absolute right-3 top-3" />
              <input
                type="text"
                placeholder="بحث برقم القضية، المحامي، أو الموكل..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-soft pr-9 pl-3 py-2 text-body-md text-on-surface placeholder-on-surface-variant/50 font-body"
              />
            </div>

            {/* Lawyer Filter */}
            <select
              value={selectedLawyerId}
              onChange={(e) => setSelectedLawyerId(e.target.value)}
              className="bg-surface-container-lowest border border-outline-variant rounded-soft px-3 py-2 text-body-md text-on-surface"
            >
              <option value="all">جميع المحامين (15 محامياً)</option>
              {availableLawyers.map((lawyer) => (
                <option key={lawyer.id} value={lawyer.id}>
                  {lawyer.name} ({lawyer.title})
                </option>
              ))}
            </select>

            {/* Case Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-surface-container-lowest border border-outline-variant rounded-soft px-3 py-2 text-body-md text-on-surface"
            >
              <option value="">جميع أنواع القضايا</option>
              <option value="commercial">قضايا تجارية</option>
              <option value="labor">قضايا عمالية</option>
              <option value="personal_status">أحوال شخصية</option>
              <option value="execution">محكمة التنفيذ</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-surface-container-lowest border border-outline-variant rounded-soft px-3 py-2 text-body-md text-on-surface"
            >
              <option value="">جميع الحالات</option>
              <option value="open">مفتوحة</option>
              <option value="in_progress">قيد الترافع</option>
              <option value="resolved">منتهية</option>
              <option value="closed">مغلقة</option>
            </select>
          </div>

          {/* Cases Data Table */}
          <div className="card-level-1 rounded-card overflow-hidden">
            <div className="p-4 border-b border-outline-variant flex items-center justify-between">
              <h2 className="text-title-md text-on-surface flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary" />
                قائمة القضايا (يعرض {filteredCases.length} من أصل 225 قضية)
              </h2>
              <span className="text-label-sm text-on-surface-variant font-body">تزامن تلقائي مع منصة ناجز</span>
            </div>

            <div className="overflow-x-auto">
              <table className="table-pro w-full text-right">
                <thead>
                  <tr>
                    <th>الرقم الداخلي</th>
                    <th>رقم ناجز</th>
                    <th>المكتب المسجل</th>
                    <th>المحامي المسؤول</th>
                    <th>نوع الدعوى والمحكمة</th>
                    <th>الموكل</th>
                    <th>مبلغ المطالبة</th>
                    <th>الحالة</th>
                    <th className="text-center">التفاصيل</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCases.slice(0, 50).map((c) => (
                    <tr key={c.id}>
                      <td className="font-semibold font-tabular text-primary">{c.caseNumberInternal}</td>
                      <td className="font-tabular font-semibold text-on-surface-variant">{c.najizCaseNumber}</td>
                      <td className="font-semibold text-on-surface">{c.firmName}</td>
                      <td className="font-semibold text-status-ongoing">{c.lawyerName}</td>
                      <td>
                        <div className="font-semibold text-on-surface">{getCaseTypeArabic(c.caseType)}</div>
                        <div className="text-label-sm text-on-surface-variant truncate max-w-[180px] font-body">{c.courtName}</div>
                      </td>
                      <td className="text-on-surface">{c.clientName}</td>
                      <td className="font-tabular font-semibold text-secondary">{c.claimAmount}</td>
                      <td>{getStatusBadge(c.status)}</td>
                      <td className="text-center">
                        <button
                          onClick={() => router.push(`/cases/${c.id}`)}
                          className="btn-secondary text-label-sm py-1 px-2.5 inline-flex items-center gap-1"
                        >
                          استعراض
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredCases.length > 50 && (
              <div className="p-3.5 bg-surface-container-low text-center text-label-sm text-on-surface-variant border-t border-outline-variant font-body">
                يتم عرض أول 50 قضية للحفاظ على سرعة الأداء (استخدم خيارات الفلترة المتقدمة للوصول لكافة الـ 225 قضية).
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Case Intake Engine Modal */}
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
                  اعتماد التكليف وقيد القضية المباشر
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
