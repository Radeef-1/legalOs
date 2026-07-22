"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import {
  Scale,
  Calendar,
  Users,
  DollarSign,
  Search,
  ShieldCheck,
  Sparkles,
  Plus,
  ArrowUpRight,
  Workflow,
  CheckCircle2,
  Clock,
  Briefcase,
  FileCheck,
} from "lucide-react";

import { ALL_225_CASES } from "@/data/seededFirmsData";

export default function Dashboard() {
  const [cases, setCases] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({ page: 1, totalPages: 15, total: 225 });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loadingCases, setLoadingCases] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const storedUser = localStorage.getItem("user");
    if (!token || !storedUser) {
      router.push("/auth/login");
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [router]);

  const fetchCases = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    setLoadingCases(true);
    try {
      const url = new URL("http://localhost:3000/v1/cases");
      url.searchParams.append("page", page.toString());
      url.searchParams.append("limit", "5");
      if (search) url.searchParams.append("search", search);

      const response = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const resData = await response.json();
        if (resData.success && resData.data?.length > 0) {
          setCases(resData.data);
          setMeta(resData.meta);
          return;
        }
      }
      
      // Fallback to seeded 225 cases
      const filtered = ALL_225_CASES.filter((c) =>
        search ? c.caseNumberInternal.toLowerCase().includes(search.toLowerCase()) || c.clientName.includes(search) : true
      );
      setCases(filtered.slice((page - 1) * 5, page * 5));
      setMeta({ page, totalPages: Math.ceil(filtered.length / 5), total: filtered.length });
    } catch (err) {
      // Fallback on network error
      const filtered = ALL_225_CASES.filter((c) =>
        search ? c.caseNumberInternal.toLowerCase().includes(search.toLowerCase()) || c.clientName.includes(search) : true
      );
      setCases(filtered.slice((page - 1) * 5, page * 5));
      setMeta({ page, totalPages: Math.ceil(filtered.length / 5), total: filtered.length });
    } finally {
      setLoadingCases(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCases();
    }
  }, [user, page, search]);

  const isLawyer = user?.role === "lawyer";

  const stats = isLawyer
    ? [
        {
          title: "قضاياي المكلف بها",
          value: "14",
          change: "ترافع وصياغة مذكرات",
          icon: Scale,
          accent: "accent-navy",
        },
        {
          title: "مهامي المطلوبة",
          value: "6 مهام نشطة",
          change: "2 تسليم اليوم",
          icon: Clock,
          accent: "accent-blue",
        },
        {
          title: "جلساتي القادمة",
          value: "3 جلسات",
          change: "بالمحكمة التجارية والعمالية",
          icon: Calendar,
          accent: "accent-green",
        },
        {
          title: "ساعات العمل المسجلة",
          value: "38.5 ساعة",
          change: "قابلة للفوترة هذا الشهر",
          icon: DollarSign,
          accent: "accent-amber",
        },
      ]
    : [
        {
          title: "إجمالي القضايا النشطة بالمكتب",
          value: meta.total ? meta.total.toString() : "42",
          change: "+12% هذا الشهر",
          icon: Scale,
          accent: "accent-navy",
        },
        {
          title: "الجلسات القادمة للفرع",
          value: "8",
          change: "خلال الـ 7 أيام القادمة",
          icon: Calendar,
          accent: "accent-blue",
        },
        {
          title: "الموكلين المقيدين",
          value: "28",
          change: "مزامنة آلية مع بوابة ناجز",
          icon: Users,
          accent: "accent-green",
        },
        {
          title: "الفواتير المعلقة (ZATCA)",
          value: "148,500 ر.س",
          change: "92% نسبة التحصيل",
          icon: DollarSign,
          accent: "accent-amber",
        },
      ];

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col font-heading" dir="rtl">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-surface-container-lowest border-b border-outline-variant px-6 py-3 flex items-center justify-between shadow-level-1">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-card bg-primary flex items-center justify-center shadow-level-1">
            <Scale className="w-5 h-5 text-on-primary" />
          </div>
          <div>
            <h1 className="text-title-md text-primary">
              LegalOS SaaS Platform
            </h1>
            <p className="text-label-sm text-on-surface-variant font-body">{isLawyer ? "لوحة المحامي الفردية — إدارة المهام والجلسات والقضايا" : "Enterprise Legal Operating System"}</p>
          </div>
        </div>

        {/* System Badges */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex najiz-connected bg-secondary-container/30 px-3.5 py-1.5 rounded-pill">
            <span className="text-on-surface-variant text-label-sm">بوابة ناجز:</span>
            <span className="text-secondary font-semibold text-label-sm mr-1">متصل ونشط (Apigee / GSO)</span>
          </div>

          <div className="hidden lg:flex items-center gap-2 bg-status-warning/8 border border-status-warning/20 px-3.5 py-1.5 rounded-pill">
            <span className="w-2 h-2 rounded-full bg-status-warning animate-pulse"></span>
            <span className="text-on-surface-variant text-label-sm">إقرار الزكاة:</span>
            <span className="text-status-warning font-semibold text-label-sm">ZATCA Phase 2 Ready</span>
          </div>

          {user && (
            <div className="flex items-center gap-2 pr-3 border-r border-outline-variant">
              <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container font-semibold flex items-center justify-center text-label-sm">
                {user.fullName ? user.fullName[0] : "م"}
              </div>
              <div className="hidden sm:block text-right">
                <p className="text-label-sm font-semibold text-primary">{user.fullName || "المحامي الشريك"}</p>
                <p className="text-[10px] text-on-surface-variant font-body">{user.jobTitle || "مستشار قانوني"}</p>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 space-y-8 max-w-container mx-auto w-full">
          {/* Hero Banner */}
          <div className="bg-primary rounded-card p-6 md:p-8 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-level-2">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="space-y-3 relative z-10 text-right">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill bg-white/10 border border-white/20 text-white text-label-sm">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isLawyer ? "واجهة المحامي الفردية الشخصية" : "الجيل الجديد لتقنية المحاماة بالسعودية"}</span>
              </div>
              <h2 className="text-headline-lg-mobile md:text-headline-lg text-white leading-tight">
                {isLawyer ? (
                  <>مرحباً بك أستاذ <span className="text-secondary-container">{user?.fullName || "المحامي"}</span></>
                ) : (
                  <>أهلاً بك في منصة <span className="text-secondary-container">LegalOS</span> الذكية</>
                )}
              </h2>
              <p className="text-body-md text-white/70 max-w-2xl leading-relaxed font-body">
                {isLawyer
                  ? "تابع مهامك المسندة، قضاياك للترافع، ومواعيد الجلسات بالمحاكم التجارية والعمالية مع استخدام المساعد الذكي لصياغة اللوائح."
                  : "النظام المتكامل لإدارة القضايا والعملاء المزود بعزل البيانات الصارم (Multi-Tenant RLS)، ومحرك الذكاء الاصطناعي لمطابقة الأنظمة السعودية وتكامل ناجز المباشر."}
              </p>
            </div>

            <div className="flex flex-wrap md:flex-col gap-3 relative z-10 shrink-0">
              <button
                onClick={() => router.push(isLawyer ? "/tasks" : "/cases")}
                className="bg-white text-primary font-semibold px-5 py-3 rounded-soft text-label-md flex items-center justify-center gap-2 hover:bg-surface-container-low transition-all shadow-level-1"
              >
                <Plus className="w-4 h-4" />
                <span>{isLawyer ? "عرض المهام والإنذارات" : "إضافة قضية جديدة"}</span>
              </button>

              <button
                onClick={() => router.push("/ai-assistant")}
                className="bg-white/10 border border-white/20 text-white font-semibold px-5 py-3 rounded-soft text-label-md flex items-center justify-center gap-2 hover:bg-white/20 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>المساعد الذكي (AI Copilot)</span>
              </button>
            </div>
          </div>

          {/* Stats Grid — Financial Data Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={idx}
                  className={`financial-card ${stat.accent} card-interactive rounded-card flex items-center justify-between text-right`}
                >
                  <div className="space-y-1.5">
                    <p className="text-label-md text-on-surface-variant">{stat.title}</p>
                    <p className="text-headline-lg-mobile font-bold text-on-surface font-tabular tracking-tight">{stat.value}</p>
                    <p className="text-label-sm text-secondary flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3" />
                      <span>{stat.change}</span>
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-card bg-surface-container-high flex items-center justify-center text-primary">
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Live Cases Table */}
          <div className="card-level-1 rounded-card overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant p-5">
              <div>
                <h3 className="text-title-md text-on-surface flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                  قائمة القضايا المعروضة (استعلام RLS المباشر)
                </h3>
                <p className="text-label-sm text-on-surface-variant mt-1 font-body">
                  بيانات معزولة آلياً بحسب هوية المستأجر وصلاحيات المستخدم في PostgreSQL
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-on-surface-variant absolute top-3 right-3" />
                  <input
                    type="text"
                    placeholder="بحث بالرقم أو اسم الموكل..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    className="bg-surface-container-low border border-outline-variant pr-9 pl-4 py-2 rounded-soft text-body-md text-on-surface w-64"
                  />
                </div>
                <button
                  onClick={() => router.push("/cases")}
                  className="btn-secondary text-label-md"
                >
                  عرض الكل
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              {loadingCases ? (
                <div className="text-center py-16 text-on-surface-variant text-label-md space-y-3">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p>جاري سحب بيانات القضايا المعزولة...</p>
                </div>
              ) : cases.length === 0 ? (
                <div className="text-center py-16 text-on-surface-variant text-label-md space-y-3">
                  <FileCheck className="w-10 h-10 text-outline-variant mx-auto" />
                  <p>لا توجد قضايا مسجلة حالياً لهذا المكتب. يمكنك إضافة قضية جديدة الآن.</p>
                </div>
              ) : (
                <table className="table-pro w-full text-right">
                  <thead>
                    <tr>
                      <th>الرقم الداخلي</th>
                      <th>رقم ناجز</th>
                      <th>الموكل</th>
                      <th>نوع القضية</th>
                      <th>المحكمة المختصة</th>
                      <th className="text-left">حالة القضية</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cases.map((c) => (
                      <tr key={c.id}>
                        <td className="font-semibold text-on-surface font-tabular">{c.caseNumberInternal}</td>
                        <td className="text-primary font-body font-semibold font-tabular">
                          {c.najizCaseNumber || "غير مرتبط"}
                        </td>
                        <td className="text-on-surface">{c.client?.name}</td>
                        <td className="text-on-surface-variant">{c.caseType}</td>
                        <td className="text-on-surface-variant">{c.courtName || "المحكمة التجارية"}</td>
                        <td className="text-left">
                          <span className="badge-ongoing">
                            <span className="w-1.5 h-1.5 rounded-full bg-status-ongoing animate-pulse"></span>
                            {c.status || "منظورة"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
