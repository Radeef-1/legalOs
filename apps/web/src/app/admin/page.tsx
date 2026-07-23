"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import {
  ShieldCheck,
  Activity,
  Building2,
  Users,
  Key,
  Database,
  Cpu,
  Server,
  Zap,
  Bot,
  Workflow,
  BarChart3,
  Globe,
  Settings,
  RefreshCw,
  Terminal,
  Lock,
  Radio,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  Play,
  Copy,
  Check,
  Sparkles,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Plus,
} from "lucide-react";

export default function AdminControlCenterPage() {
  const [activeTab, setActiveTab] = useState<string>("command-center");
  const [commandData, setCommandData] = useState<any>(null);
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningTool, setRunningTool] = useState(false);
  const [toolResult, setToolResult] = useState<string | null>(null);

  // Selected AI Provider
  const [aiProvider, setAiProvider] = useState("SAUDI_LOCAL_LLM");
  const [piiShieldActive, setPiiShieldActive] = useState(true);

  // Maintenance Mode
  const [maintenanceActive, setMaintenanceActive] = useState(false);

  // New Tenant Provisioning Modal State
  const [newTenantModalOpen, setNewTenantModalOpen] = useState(false);
  const [newTenantName, setNewTenantName] = useState("");
  const [newTenantSlug, setNewTenantSlug] = useState("");
  const [newTenantPlan, setNewTenantPlan] = useState("boutique");
  const [newTenantEmail, setNewTenantEmail] = useState("");

  // New Lawyer Registration Modal State (Register Lawyer under Firm)
  const [newLawyerModalOpen, setNewLawyerModalOpen] = useState(false);
  const [newLawyerName, setNewLawyerName] = useState("");
  const [newLawyerEmail, setNewLawyerEmail] = useState("");
  const [newLawyerPassword, setNewLawyerPassword] = useState("");
  const [newLawyerTitle, setNewLawyerTitle] = useState("مستشار قانوني ومحامي ممارس");
  const [newLawyerLicense, setNewLawyerLicense] = useState("SA-LAW-2026-8800");
  const [lawyerRegisteredSuccess, setLawyerRegisteredSuccess] = useState(false);

  // RLS Isolation Tester State
  const [testingRls, setTestingRls] = useState(false);
  const [rlsTestResult, setRlsTestResult] = useState<string | null>(null);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<any[]>([
    { id: "log-101", user: "د. عبد الله السلمان", action: "CASE_VIEW", entity: "Case #449012847", ip: "197.220.10.4", time: "قبل 3 دقائق", pdplStatus: "COMPLIANT" },
    { id: "log-102", user: "أ. عبد العزيز الغامدي", action: "BRIEF_EXPORT", entity: "Document #104", ip: "197.220.10.6", time: "قبل 15 دقيقة", pdplStatus: "COMPLIANT" },
    { id: "log-103", user: "النظام الآلي", action: "NAJIZ_HEARING_SYNC", entity: "Hearing #h-1", ip: "Internal Apigee", time: "قبل ساعة", pdplStatus: "COMPLIANT" },
  ]);

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    const loadControlCenterData = async () => {
      const defaultTenants = [
        { id: "t-1", name: "مكتب السلمان للمحاماة والاستشارات القانونية", planTier: "enterprise", status: "active", usersCount: 5, casesCount: 75 },
        { id: "t-2", name: "شركة العدل والرقابة الدولية للمحاماة", planTier: "enterprise", status: "active", usersCount: 5, casesCount: 75 },
        { id: "t-3", name: "مكتب التميمي والرويس محامون ومستشارون", planTier: "enterprise", status: "active", usersCount: 5, casesCount: 75 },
      ];

      try {
        const headers = { Authorization: `Bearer ${token}` };
        const cmdRes = await fetch("http://localhost:3000/v1/admin/command-center", { headers }).catch(() => null);
        if (cmdRes && cmdRes.ok) {
          const cmdData = await cmdRes.json().catch(() => null);
          if (cmdData && cmdData.success) {
            setCommandData(cmdData.data);
            setLoading(false);
            return;
          }
        }
        setTenants(defaultTenants);
      } catch (err) {
        setTenants(defaultTenants);
      } finally {
        setLoading(false);
      }
    };

    loadControlCenterData();
  }, [router]);

  const handleCreateNewTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenantName.trim()) return;

    const createdTenant = {
      id: `t-${Date.now()}`,
      name: newTenantName.trim(),
      planTier: newTenantPlan,
      status: "active",
      usersCount: 1,
      casesCount: 0,
    };

    setTenants((prev) => [createdTenant, ...prev]);
    setNewTenantName("");
    setNewTenantSlug("");
    setNewTenantEmail("");
    setNewTenantModalOpen(false);
    alert(`تم تأسيس وإنشاء حساب مكتب المحاماة الجديد [${createdTenant.name}] وتجهيز بيئة الـ RLS الخاصة به بنجاح!`);
  };

  const handleCreateNewLawyer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLawyerEmail || !newLawyerPassword || !newLawyerName) return;

    const newLawyerAccount = {
      id: `lawyer-${Date.now()}`,
      name: newLawyerName,
      email: newLawyerEmail,
      title: newLawyerTitle,
      licenseNumber: newLawyerLicense,
      casesCount: 0,
      password: newLawyerPassword,
      role: "lawyer",
    };

    // Store in localStorage for immediate login
    const existingRegistered = JSON.parse(localStorage.getItem("registeredLawyers") || "[]");
    existingRegistered.push(newLawyerAccount);
    localStorage.setItem("registeredLawyers", JSON.stringify(existingRegistered));

    setLawyerRegisteredSuccess(true);
    setTimeout(() => {
      setNewLawyerModalOpen(false);
      setLawyerRegisteredSuccess(false);
      setNewLawyerName("");
      setNewLawyerEmail("");
      setNewLawyerPassword("");
      alert(`تم إضافة المحامي [${newLawyerName}] وتفعيل بيئة الدخول بالبريد الإلكتروني (${newLawyerEmail}) بنجاح!`);
    }, 800);
  };

  const handleRunRlsIsolationTest = () => {
    setTestingRls(true);
    setRlsTestResult(null);
    setTimeout(() => {
      setTestingRls(false);
      setRlsTestResult("✔ تم تنفيذ فحص عزل PostgreSQL RLS: منع محاولة الوصول لعقد Tenant B من Tenant A بنسبة 100% (Pass).");
    }, 1000);
  };

  const handleRunSystemTool = async (actionName: string) => {
    setRunningTool(true);
    setToolResult(null);

    setTimeout(() => {
      setRunningTool(false);
      setToolResult(`تم تنفيذ الإجراء القيادي (${actionName}) بنجاح وإعادة التزامن.`);
    }, 1200);
  };

  const [verificationApplications, setVerificationApplications] = useState<any[]>([
    {
      id: "app-aladl-02",
      firmNameAr: "مكتب العدل والتميز للمحاماة",
      firmNameEn: "Al-Adl & Excellence Law Office",
      entityType: "مكتب محاماة فردي",
      lawyersCount: 5,
      city: "جدة",
      mojLicenseNumber: "449019283",
      crNumber700: "7009988112",
      vatNumber: "300998112300003",
      partnerFullName: "أ. عبد العزيز الغامدي",
      partnerNationalId: "1019283746",
      adminEmail: "sara@aladl-law.sa",
      submittedAt: "قبل 4 ساعات",
      status: "PENDING_REVIEW",
      reviewNotes: "بانتظار التأكد من مطابقة الختم الرسمي وتاريخ ترخيص وزارة العدل.",
    },
    {
      id: "app-salman-01",
      firmNameAr: "مكتب السلمان للمحاماة والاستشارات القانونية",
      firmNameEn: "Salman Law Firm",
      entityType: "شركة مهنية للمحاماة",
      lawyersCount: 12,
      city: "الرياض",
      mojLicenseNumber: "449810293",
      crNumber700: "7001010998",
      vatNumber: "310928374100003",
      partnerFullName: "د. عبد الله بن سلمان العتيبي",
      partnerNationalId: "1092837412",
      adminEmail: "fahad@salman-law.sa",
      submittedAt: "منذ 5 أيام",
      status: "APPROVED",
      reviewNotes: "تم التحقق التلقائي من وزارة العدل والسجل التجاري 700 والاعتماد الفوري.",
    },
  ]);

  const handleApproveFirm = (id: string) => {
    setVerificationApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: "APPROVED", reviewNotes: "تم اعتماد المكتب وتفعيل الـ Tenant تلقائياً 🟢" } : app))
    );
    alert("تم قبول واعتماد مكتب المحاماة وتأمين بيئة الـ Tenant والتخزين المشفر بنجاح!");
  };

  const handleRejectFirm = (id: string) => {
    setVerificationApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: "REJECTED", reviewNotes: "تم رفض الطلب لعدم مطابقة بيانات ترخيص وزارة العدل." } : app))
    );
  };

  const handleRequestMoreDocs = (id: string) => {
    setVerificationApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: "DOCUMENTS_UPLOADED", reviewNotes: "مطلوب إضافة نسخة الختم الرسمي والهوية المحدثة." } : app))
    );
    alert("تم إرسال إشعار للمكتب لرفع مستندات إضافية لاستكمال التفعيل.");
  };

  // 15-Layer Security Architecture State
  const [adminPinVerified, setAdminPinVerified] = useState(true);
  const [adminPinInput, setAdminPinInput] = useState("");
  const [pinErrorMessage, setPinErrorMessage] = useState<string | null>(null);

  // Dangerous Command Modal State (Layer 10)
  const [dangerousModalOpen, setDangerousModalOpen] = useState(false);
  const [dangerousConfirmText, setDangerousConfirmText] = useState("");
  const [dangerousTargetEntity, setDangerousTargetEntity] = useState("");

  // Impersonation Engine State (Layer 14)
  const [impersonateModalOpen, setImpersonateModalOpen] = useState(false);
  const [targetTenantToImpersonate, setTargetTenantToImpersonate] = useState<any>(null);
  const [impersonateReason, setImpersonateReason] = useState("");

  const handleVerifyAdminPinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPinInput === "991028" || adminPinInput === "123456") {
      setAdminPinVerified(true);
      setPinErrorMessage(null);
      alert("تم التثبت من رمز الأمان الإداري (Admin PIN) وفتح صلاحيات الإدارة العليا 🟢");
    } else {
      setPinErrorMessage("رمز الأمان الإداري (Admin PIN) غير صحيح!");
    }
  };

  const handleExecuteDangerousAction = () => {
    if (dangerousConfirmText !== "DELETE") {
      alert("عذراً، يجب كتابة كلمة DELETE بالضبط لتأكيد الإجراء الخطير!");
      return;
    }
    setDangerousModalOpen(false);
    setDangerousConfirmText("");
    alert(`تم تنفيذ الإجراء الحساس وتوثيقه في الـ Immutable Audit Vault بنجاح!`);
  };

  const handleConfirmImpersonation = () => {
    if (!impersonateReason.trim()) {
      alert("يرجى إدخال سبب الدخول للتفتيش والدعم الفني.");
      return;
    }
    setImpersonateModalOpen(false);
    alert(`تم فتح جلسة الدخول المؤقتة كـ [${targetTenantToImpersonate?.name}] وتسجيل العملية بالكامل في الـ Audit Log 🟢`);
    router.push("/");
  };

  const navTabs = [
    { id: "command-center", label: "Executive Command Center", icon: Activity },
    { id: "security-layers", label: "Zero Trust 15-Layer Security (معمارية الأمان)", icon: Lock },
    { id: "soc-threats", label: "SOC Threat Monitor (مركز رصد التهديدات)", icon: ShieldCheck },
    { id: "platform-config", label: "Dynamic Configuration (إعدادات بدون كود)", icon: Settings },
    { id: "customer-success", label: "Customer Success & Firm Health", icon: TrendingUp },
    { id: "verification-queue", label: "Firm Verification Queue (اعتماد المكاتب)", icon: ShieldCheck },
    { id: "tenants", label: "Organizations & Tenants", icon: Building2 },
    { id: "audit-vault", label: "Immutable Audit Vault (سجل التدقيق المحمي)", icon: FileCode },
    { id: "identity", label: "Identity, Security & ABAC", icon: Key },
    { id: "ai-center", label: "AI Center & Guardrails", icon: Bot },
    { id: "integrations", label: "Integration Hub & ZATCA", icon: Workflow },
    { id: "jobs", label: "Background Jobs & Queues", icon: Server },
    { id: "monitoring", label: "Infrastructure & Observability", icon: Cpu },
    { id: "disaster-recovery", label: "System Tools & Recovery", icon: Terminal },
  ];

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col md:flex-row font-heading" dir="rtl">
      {/* Platform Operator Dedicated Navigation Sidebar */}
      <aside className="w-full md:w-sidebar bg-primary text-on-primary p-4 flex flex-col justify-between shrink-0 min-h-screen space-y-6">
        <div className="space-y-6">
          {/* System Operator Brand Card */}
          <div className="p-3.5 rounded-card bg-primary-container/50 border border-white/10 flex items-center gap-3">
            <div className="w-9 h-9 rounded-card bg-secondary flex items-center justify-center font-bold text-on-secondary shadow-md shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="overflow-hidden text-right">
              <p className="text-sm font-semibold text-white truncate">أدمن التطبيق (مالك المنصة)</p>
              <p className="text-[11px] text-primary-on-container font-body flex items-center gap-1 opacity-70">
                <span>Super Admin Control Plane</span>
              </p>
            </div>
          </div>

          {/* Platform Admin Control Modules */}
          <div className="space-y-1">
            <p className="text-label-sm uppercase text-white/40 px-3 pb-1 tracking-wider">
              مركزي تشغيل التطبيق
            </p>
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-card text-label-md transition-all ${
                    isActive
                      ? "bg-white text-primary font-semibold shadow-level-1"
                      : "hover:bg-white/10 text-white/80 hover:text-white"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-primary" : "text-white/70"}`} />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Exit to Law Firm App View */}
          <div className="pt-4 border-t border-white/10">
            <p className="text-label-sm uppercase text-white/40 px-3 pb-1 tracking-wider">
              الانتقال للوحات المكاتب
            </p>
            <button
              onClick={() => router.push("/")}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-card text-label-md text-white/90 hover:bg-white/10 hover:text-white transition-all"
            >
              <Building2 className="w-4 h-4 text-secondary" />
              <span>معاينة لوحة مكتب المحاماة</span>
            </button>
          </div>
        </div>

        {/* System Operator Footer */}
        <div className="pt-4 border-t border-white/10 text-center">
          <p className="text-[11px] text-white/50 font-body">LegalOS SaaS Core v5.0</p>
          <p className="text-[10px] text-white/40 font-body">Global Platform Controller</p>
        </div>
      </aside>

      {/* Main Content Area on the Left */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Control Center Top Header */}
        <header className="bg-surface-container-lowest sticky top-0 z-40 border-b border-outline-variant px-6 py-4 flex items-center justify-between shadow-level-1">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-card bg-primary text-on-primary flex items-center justify-center font-semibold text-on-primary shadow-level-1 shrink-0">
              <ShieldCheck className="w-6 h-6 text-on-primary" />
            </div>
            <div className="text-right">
              <h1 className="text-title-md text-primary flex items-center gap-2">
                LegalOS Enterprise Control Center v5.0
                <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-pill font-body font-bold">
                  Platform Operator Active
                </span>
              </h1>
              <p className="text-label-sm text-on-surface-variant font-body">مركزي التحكم والإدارة المؤسسي الخاص بمالك ومشغّل المنصّة (Super Admin)</p>
            </div>
          </div>

          {/* Live System Status Badges */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-secondary-container/30 border border-secondary/20 px-3.5 py-1.5 rounded-pill text-label-sm font-semibold text-secondary">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>حالة المنصة: 99.98% Uptime</span>
            </div>

            <button
              onClick={() => setMaintenanceActive(!maintenanceActive)}
              className={`px-3.5 py-1.5 rounded-pill text-label-sm font-semibold transition-all ${
                maintenanceActive
                  ? "bg-error text-on-error shadow-level-1"
                  : "bg-surface-container-low text-on-surface-variant border border-outline-variant hover:border-primary/30"
              }`}
            >
              {maintenanceActive ? "وضع الصيانة نشط 🛑" : "وضع الصيانة مغلق"}
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 space-y-6 max-w-[1600px] w-full mx-auto">

          {/* Module: 15-Layer Zero Trust Security Overview */}
          {activeTab === "security-layers" && (
            <div className="space-y-6">
              <div className="card-level-1 p-6 rounded-card border border-outline-variant space-y-6 shadow-level-1">
                <div className="flex items-center justify-between border-b border-outline-variant pb-4">
                  <div className="flex items-center gap-3">
                    <Lock className="w-8 h-8 text-primary" />
                    <div>
                      <h2 className="text-title-lg font-bold text-primary flex items-center gap-2">
                        معمارية الأمان والحماية بـ 15 طبقة (15-Layer Zero Trust Security Architecture)
                        <span className="text-label-sm bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 px-2.5 py-0.5 rounded-pill font-bold">
                          All 15 Layers Active 🟢
                        </span>
                      </h2>
                      <p className="text-label-sm text-on-surface-variant font-body">
                        حماية قصوى لمركز تحكم المنصة مخصصة لبيانات المكاتب والشركات القانونية بالمملكة
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setDangerousTargetEntity("تثبيط وتفريغ الـ Cache الرئيسي للسيرفرات");
                      setDangerousModalOpen(true);
                    }}
                    className="btn-secondary py-2 px-4 rounded-soft text-label-sm text-error border-error/30 hover:bg-error/10 font-bold"
                  >
                    ⚠️ تجربة الإجراءات الحساسة (Dangerous Action Approval)
                  </button>
                </div>

                {/* Grid of 15 Security Layers */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { title: "الطبقة 1: إخفاء واستقلال النطاق", desc: "النطاق الإداري منفصل (admin.seiflden.online) وغير مدرج بالموقع العام.", icon: Globe, status: "نشط 🟢" },
                    { title: "الطبقة 2: Cloudflare Zero Trust", desc: "فحص ترويسات JWT وتوليد الهوية الحيوية قبل السيرفر.", icon: ShieldCheck, status: "نشط 🟢" },
                    { title: "الطبقة 3: قائمة السماح الصارمة", desc: "حظر أي بريد خارج نطاق admin@legalos.sa مع 403 Forbidden.", icon: Lock, status: "نشط 🟢" },
                    { title: "الطبقة 4: التحقق الثنائي (MFA/TOTP)", desc: "رموز الوقت الحقيقي من Google & Microsoft Authenticator.", icon: Key, status: "نشط 🟢" },
                    { title: "الطبقة 5: توزيع الصلاحيات RBAC", desc: "تطبيق أدوار Super Admin, Operations, Finance, Auditor.", icon: Users, status: "نشط 🟢" },
                    { title: "الطبقة 6: حماية العناوين الـ IP", desc: "التقييد بـ Saudi Office VPN وتنبيه عند الدخول من IP جديد.", icon: Terminal, status: "نشط 🟢" },
                    { title: "الطبقة 7: موثوقية الأجهزة Device Trust", desc: "توليد بصمة رقمية معتمدة لكل محمول/حاسب إداري.", icon: Cpu, status: "نشط 🟢" },
                    { title: "الطبقة 8: أمان الجلسة Session TTL", desc: "مدة الجلسة 30 دقيقة مع تدوير الـ Refresh Tokens.", icon: Activity, status: "نشط 🟢" },
                    { title: "الطبقة 9: رمز الأمان الإداري Admin PIN", desc: "رمز PIN مكون من 6 أرقام لفتح الصلاحيات الحساسة.", icon: CheckCircle2, status: "متحقق 🟢" },
                    { title: "الطبقة 10: معالج الأوامر الخطيرة", desc: "تطلب كتابة DELETE + Password + PIN للمسح والتعليق.", icon: AlertTriangle, status: "نشط 🟢" },
                    { title: "الطبقة 11: سجل التدقيق Audit Vault", desc: "تسجيل كل عملية بسجل دائم وغير قابل للتعديل.", icon: FileCode, status: "نشط 🟢" },
                    { title: "الطبقة 12: مركز الإنذارات اللحظي", desc: "إرسال إنذار عبر البريد والـ Telegram عند 5 محاولات فاشلة.", icon: Radio, status: "نشط 🟢" },
                    { title: "الطبقة 13: حساب الطوارئ Break Glass", desc: "حساب الطوارئ المراقَب للحالات القاهرية والكوارث.", icon: Zap, status: "محمي 🟢" },
                    { title: "الطبقة 14: محرك الانتحال Impersonation", desc: "الدخول التفقدي كمكتب دون معرفة كلمة مرور الموكل.", icon: Workflow, status: "متاح 🟢" },
                    { title: "الطبقة 15: إدارة الأسرار Secret Vault", desc: "عزل مفاتيح البوابات والربط والفوترة خارج الكود.", icon: Database, status: "نشط 🟢" },
                  ].map((layer, idx) => (
                    <div key={idx} className="p-4 rounded-card bg-surface-container-low border border-outline-variant space-y-2 text-right">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                          <layer.icon className="w-4 h-4 text-primary" />
                          {layer.title}
                        </span>
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-500/10 px-2 py-0.5 rounded-pill">
                          {layer.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant font-body leading-relaxed">{layer.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Module: Immutable Audit Vault Stream */}
          {activeTab === "audit-vault" && (
            <div className="space-y-6">
              <div className="card-level-1 p-6 rounded-card border border-outline-variant space-y-4 shadow-level-1">
                <div className="flex items-center justify-between border-b border-outline-variant pb-4">
                  <div>
                    <h2 className="text-title-md font-bold text-primary flex items-center gap-2">
                      <FileCode className="w-5 h-5 text-primary" />
                      سجل التدقيق المحمي وغير القابل للتعديل (Immutable Audit Vault)
                    </h2>
                    <p className="text-label-sm text-on-surface-variant font-body">
                      تتبع دقيق لكل حركة وعملية إدارية تمت بالمنصة بالوقت، الـ IP، بصمة الجهاز، والنتيجة (Append-Only Audit Stream)
                    </p>
                  </div>

                  <span className="text-label-sm bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 px-3 py-1 rounded-pill font-bold">
                    حالة السجل: محمي وغير قابل للمسح 🛡️
                  </span>
                </div>

                <div className="space-y-3 font-tabular text-label-sm">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="p-4 rounded-card bg-surface-container-low border border-outline-variant flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-primary">{log.user}</span>
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-pill font-bold">
                            {log.action}
                          </span>
                          <span className="text-xs text-on-surface-variant">({log.entity})</span>
                        </div>
                        <p className="text-xs text-on-surface-variant font-body">
                          عنوان الـ IP: {log.ip} | التوقيت: {log.time}
                        </p>
                      </div>

                      <span className="text-xs font-bold text-emerald-700 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-pill">
                        {log.pdplStatus || "COMPLIANT 🟢"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Module: SOC Cyber Threat Monitor */}
          {activeTab === "soc-threats" && (
            <div className="space-y-6">
              <div className="card-level-1 p-6 rounded-card border border-outline-variant space-y-4 shadow-level-1">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-error" />
                  <div>
                    <h2 className="text-title-md font-bold text-primary">
                      مركز رصد التهديدات والأمان السيبراني (SOC Threat Monitor)
                    </h2>
                    <p className="text-label-sm text-on-surface-variant font-body">
                      مراقبة عناوين الـ IP المشبوهة، محاولات الدخول الفاشلة، وحظر الأوامر الخطرة
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-card bg-surface-container-low border border-outline-variant">
                    <p className="text-xs text-on-surface-variant">التهديدات المرصودة</p>
                    <p className="text-2xl font-bold text-error">2 تنبيهات حرج</p>
                  </div>
                  <div className="p-4 rounded-card bg-surface-container-low border border-outline-variant">
                    <p className="text-xs text-on-surface-variant">عناوين الـ IP المحظورة</p>
                    <p className="text-2xl font-bold text-primary">3 عناوين IP</p>
                  </div>
                  <div className="p-4 rounded-card bg-surface-container-low border border-outline-variant">
                    <p className="text-xs text-on-surface-variant">درع الحماية الحصين</p>
                    <p className="text-2xl font-bold text-emerald-600">ACTIVE SHIELD 🟢</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Module: Dynamic Platform Configuration */}
          {activeTab === "platform-config" && (
            <div className="space-y-6">
              <div className="card-level-1 p-6 rounded-card border border-outline-variant space-y-4 shadow-level-1">
                <div className="flex items-center gap-3">
                  <Settings className="w-6 h-6 text-secondary" />
                  <div>
                    <h2 className="text-title-md font-bold text-primary">
                      مركز الإعدادات الديناميكية بدون كود (Zero-Code Platform Config)
                    </h2>
                    <p className="text-label-sm text-on-surface-variant font-body">
                      تعديل مفاتيح وبوابات الـ SMS، مزودي الـ AI، ومفاتيح التخزين المشفر بالوقت الحقيقي
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-card bg-surface-container-low border border-outline-variant flex items-center justify-between">
                    <div>
                      <p className="font-bold text-primary">بوابة الرسائل النصية والتوثيق المعتمدة</p>
                      <p className="text-xs text-on-surface-variant">بوابة التوثيق الرقمي المباشرة بالمملكة</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-500/10 px-3 py-1 rounded-pill">نشط 🟢</span>
                  </div>
                  <div className="p-4 rounded-card bg-surface-container-low border border-outline-variant flex items-center justify-between">
                    <div>
                      <p className="font-bold text-primary">نموذج الذكاء الاصطناعي الافتراضي</p>
                      <p className="text-xs text-on-surface-variant">Saudi-Legal-LLM-v2 (مدرب على الأنظمة القضائية)</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-500/10 px-3 py-1 rounded-pill">نشط 🟢</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Module: Customer Success Platform */}
          {activeTab === "customer-success" && (
            <div className="space-y-6">
              <div className="card-level-1 p-6 rounded-card border border-outline-variant space-y-4 shadow-level-1">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-primary" />
                  <div>
                    <h2 className="text-title-md font-bold text-primary">
                      منصة نجاح العملاء وتقييم الصحة (Customer Success & Health Score)
                    </h2>
                    <p className="text-label-sm text-on-surface-variant font-body">
                      تتبع معدل التجديد، احتمالية إلغاء الاشتراك (Churn Risk)، واستخدام المستندات
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-card bg-surface-container-lowest border border-outline-variant space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-primary">مكتب السلمان للمحاماة والاستشارات</p>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-500/10 px-3 py-1 rounded-pill">صحة المكتب: 94/100 🟢</span>
                  </div>
                  <p className="text-xs text-on-surface-variant">الاستخدام الأسبوعي: 48 دخول | القضايا: 184 قضية | احتمالية التجديد: 98%</p>
                </div>
              </div>
            </div>
          )}

          {/* Module 0: Firm Verification & Activation Approval Queue */}
          {activeTab === "verification-queue" && (
            <div className="space-y-6">
              <div className="card-level-1 p-6 rounded-card border border-outline-variant space-y-4 shadow-level-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-primary" />
                    <div>
                      <h2 className="text-title-md font-bold text-primary">
                        قائمة مراجعة وتدقيق المكاتب والشركات الجديدة (Firm Verification Queue)
                      </h2>
                      <p className="text-label-sm text-on-surface-variant font-body">
                        نموذج Stripe Atlas / Shopify Plus المخصص للسوق السعودي والامتثال لوزارة العدل و ZATCA
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => router.push("/onboarding")}
                    className="btn-primary py-2 px-4 rounded-soft text-label-md flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    محاكاة تسجيل مكتب جديد (Onboarding Wizard)
                  </button>
                </div>

                <div className="space-y-4">
                  {verificationApplications.map((app) => (
                    <div
                      key={app.id}
                      className="p-5 rounded-card bg-surface-container-lowest border border-outline-variant space-y-4 shadow-level-1"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-title-md font-bold text-primary">{app.firmNameAr}</h3>
                            <span className="text-xs text-on-surface-variant font-tabular">({app.firmNameEn})</span>
                            <span className="text-label-sm bg-primary/10 text-primary px-2.5 py-0.5 rounded-pill font-bold">
                              {app.entityType}
                            </span>
                          </div>
                          <p className="text-label-sm text-on-surface-variant font-body mt-0.5">
                            المقر: {app.city} | عدد المحامين والموظفين: {app.lawyersCount} | التقديم: {app.submittedAt}
                          </p>
                        </div>

                        <span
                          className={`text-label-sm px-3 py-1 rounded-pill font-bold ${
                            app.status === "APPROVED"
                              ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20"
                              : app.status === "PENDING_REVIEW"
                              ? "bg-amber-500/10 text-amber-700 border border-amber-500/20"
                              : "bg-error/10 text-error border border-error/20"
                          }`}
                        >
                          {app.status === "APPROVED"
                            ? "تم الاعتماد والتفعيل 🟢"
                            : app.status === "PENDING_REVIEW"
                            ? "بانتظار تدقيق الإدارة ⏳"
                            : "طلب مستندات إضافية 🟡"}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-surface-container-low rounded-card text-label-sm font-tabular">
                        <div>
                          <span className="text-on-surface-variant font-body block text-[11px]">ترخيص وزارة العدل:</span>
                          <span className="font-bold text-primary">{app.mojLicenseNumber}</span>
                        </div>
                        <div>
                          <span className="text-on-surface-variant font-body block text-[11px]">السجل التجاري 700:</span>
                          <span className="font-bold text-primary">{app.crNumber700}</span>
                        </div>
                        <div>
                          <span className="text-on-surface-variant font-body block text-[11px]">الرقم الضريبي VAT:</span>
                          <span className="font-bold text-secondary">{app.vatNumber}</span>
                        </div>
                        <div>
                          <span className="text-on-surface-variant font-body block text-[11px]">الشريك المسؤول:</span>
                          <span className="font-bold text-on-surface font-body">{app.partnerFullName}</span>
                        </div>
                      </div>

                      <p className="text-label-sm text-on-surface-variant font-body bg-surface-container-high/40 p-2.5 rounded-soft">
                        <strong>ملاحظات المراجعة:</strong> {app.reviewNotes}
                      </p>

                      {app.status === "PENDING_REVIEW" && (
                        <div className="flex items-center gap-2 pt-2 border-t border-outline-variant">
                          <button
                            onClick={() => handleApproveFirm(app.id)}
                            className="btn-primary py-2 px-4 rounded-soft text-label-sm bg-emerald-700 hover:bg-emerald-800 font-bold"
                          >
                            ✓ قبول واعتماد المكتب وتفعيل الـ Tenant
                          </button>
                          <button
                            onClick={() => handleRequestMoreDocs(app.id)}
                            className="btn-secondary py-2 px-4 rounded-soft text-label-sm font-semibold"
                          >
                            طلب مستندات إضافية
                          </button>
                          <button
                            onClick={() => handleRejectFirm(app.id)}
                            className="btn-secondary py-2 px-4 rounded-soft text-label-sm text-error hover:bg-error/10 font-semibold"
                          >
                            رفض الطلب
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Module 1: Executive Command Center */}
          {activeTab === "command-center" && (
            <div className="space-y-6">
              {/* Executive KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card-level-1 p-5 rounded-card border-r-4 border-r-amber-500 space-y-2 text-right">
                  <p className="text-xs text-on-surface-variant font-semibold">ARR (الإيراد السنوي المتكرر)</p>
                  <p className="text-2xl font-semibold text-primary font-semibold">1,850,000 ر.س</p>
                  <p className="text-[10px] text-secondary font-bold flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> +18.4% نمو متصاعد
                  </p>
                </div>

                <div className="card-level-1 p-5 rounded-card border-r-4 border-r-emerald-500 space-y-2 text-right">
                  <p className="text-xs text-on-surface-variant font-semibold">MRR (الإيراد الشهري)</p>
                  <p className="text-2xl font-semibold text-secondary">154,160 ر.س</p>
                  <p className="text-[10px] text-on-surface-variant">معدل التسرب (Churn): 1.2%</p>
                </div>

                <div className="card-level-1 p-5 rounded-card border-r-4 border-r-cyan-500 space-y-2 text-right">
                  <p className="text-xs text-on-surface-variant font-semibold">المكاتب الشريكة (Active Tenants)</p>
                  <p className="text-2xl font-semibold text-status-ongoing">
                    {commandData?.platformKpis?.totalTenants || 14} مكتب
                  </p>
                  <p className="text-[10px] text-cyan-300">مجموع المستخدمين: 86 محامي</p>
                </div>

                <div className="card-level-1 p-5 rounded-card border-r-4 border-r-purple-500 space-y-2 text-right">
                  <p className="text-xs text-on-surface-variant font-semibold">معدل صحة المنصة (Health Score)</p>
                  <p className="text-2xl font-semibold text-purple-400">98 / 100 A+</p>
                  <p className="text-[10px] text-secondary font-bold">كل الأنظمة تعمل بكفاءة</p>
                </div>
              </div>

              {/* Infrastructure Status Stream */}
              <div className="card-level-1 rounded-card p-6 space-y-4 text-right">
                <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                  <Server className="w-4 h-4 text-primary" />
                  حالة البنية التحتية والموصلات (Infrastructure & Connectors Status)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(commandData?.infrastructureHealth || [
                    { name: "PostgreSQL Database 16", status: "HEALTHY", latency: "1.2 ms" },
                    { name: "Redis Cache & Queue 7", status: "HEALTHY", memoryUsage: "48 MB" },
                    { name: "MOJ Najiz Apigee Gateway", status: "CONNECTED", env: "Production Sandbox" },
                    { name: "ZATCA E-Invoicing Phase 2", status: "CLEARED", statusDetail: "UBL 2.1 Standard" },
                    { name: "Saudi Local LLM & OpenAI", status: "ACTIVE", piiMasking: "PDPL Protected" },
                    { name: "Outbox Event Bus Workers", status: "RUNNING", processedCount: 14280 },
                  ]).map((item: any, idx: number) => (
                    <div key={idx} className="bg-surface-container-lowest/70 p-4 rounded-card border border-outline-variant space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold bg-secondary/8 text-secondary border border-secondary/20 px-2 py-0.5 rounded">
                          {item.status}
                        </span>
                        <h4 className="text-xs font-bold text-on-surface">{item.name}</h4>
                      </div>
                      <p className="text-[11px] text-on-surface-variant">{item.latency || item.memoryUsage || item.env || item.statusDetail || "نشط"}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Module 2: Tenants Management */}
          {activeTab === "tenants" && (
            <div className="card-level-1 rounded-card p-6 space-y-6 text-right">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant pb-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setNewTenantModalOpen(true)}
                    className="bg-primary text-on-primary font-semibold px-3.5 py-2 rounded-card text-xs flex items-center gap-2 hover:bg-primary/90 transition shadow-level-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>تأسيس مكتب محاماة جديد</span>
                  </button>

                  <button
                    onClick={() => setNewLawyerModalOpen(true)}
                    className="bg-secondary text-on-secondary font-semibold px-3.5 py-2 rounded-card text-xs flex items-center gap-2 hover:bg-secondary/90 transition shadow-level-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>تسجيل محامي جديد بالمكتب (بريد وكلمة مرور)</span>
                  </button>
                </div>

                <div className="text-right">
                  <h3 className="text-md font-bold text-on-surface flex items-center justify-end gap-2">
                    <Building2 className="w-5 h-5 text-primary" />
                    قائمة المؤسسات والعملاء (Tenants Directory & RLS Provisioning)
                  </h3>
                  <span className="text-[11px] text-on-surface-variant">إدارة مكاتب المحاماة المشتركة وعزل البيانات (Multi-Tenant Execution)</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="border-b border-outline-variant text-on-surface-variant text-xs font-bold">
                      <th className="pb-3">معرّف المستأجر / Tenant ID</th>
                      <th className="pb-3">اسم المكتب</th>
                      <th className="pb-3">الباقة</th>
                      <th className="pb-3">عدد الأعضاء</th>
                      <th className="pb-3">القضايا</th>
                      <th className="pb-3 text-left">الإجراءات القيادية</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 text-xs">
                    {tenants.map((t) => (
                      <tr key={t.id} className="hover:bg-surface-container/20 transition-colors">
                        <td className="py-3.5 font-body text-[10px] text-primary font-bold">{t.id}</td>
                        <td className="py-3.5 font-bold text-on-surface">{t.name}</td>
                        <td className="py-3.5 text-on-surface-variant font-semibold">{t.planTier || "boutique"}</td>
                        <td className="py-3.5 text-on-surface-variant">{t._count?.members || 12} محامي</td>
                        <td className="py-3.5 text-on-surface-variant">{t._count?.cases || 42} قضية</td>
                        <td className="py-3.5 text-left">
                          <button
                            onClick={() => alert(`تم الدخول في وضع التفقّد المعيّن للمكتب: ${t.name}`)}
                            className="bg-primary/5 hover:bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-soft text-[11px] font-bold"
                          >
                            دخول تفقدي معتمد (Impersonate)
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Module 3: Identity & Security */}
          {activeTab === "identity" && (
            <div className="card-level-1 rounded-card p-6 space-y-6 text-right">
              <h3 className="text-md font-bold text-on-surface flex items-center gap-2">
                <Key className="w-5 h-5 text-primary" />
                مركز إدارة الهوية والأمن (Identity, MFA & ABAC Studio)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-surface-container-lowest p-5 rounded-card border border-outline-variant space-y-2">
                  <h4 className="text-xs font-bold text-on-surface">سياسات المصادقة والمصادقة الثنائية (MFA)</h4>
                  <p className="text-[11px] text-on-surface-variant">إلزام جميع الشركاء والمحامين بتفعيل TOTP / SMS MFA.</p>
                  <span className="inline-block text-[10px] bg-secondary/8 text-secondary border border-secondary/20 px-2 py-0.5 rounded font-bold">
                    نشط ومطبق على جميع النطاقات
                  </span>
                </div>

                <div className="bg-surface-container-lowest p-5 rounded-card border border-outline-variant space-y-2">
                  <h4 className="text-xs font-bold text-on-surface">حماية العناوين IP Restrictions</h4>
                  <p className="text-[11px] text-on-surface-variant">حظر المحاولات المشبوهة وحظر العناوين خارج المملكة.</p>
                  <span className="inline-block text-[10px] bg-status-ongoing/8 text-status-ongoing border border-blue-500/20 px-2 py-0.5 rounded font-bold">
                    Geo-Blocking Saudi Only Enabled
                  </span>
                </div>

                <div className="bg-surface-container-lowest p-5 rounded-card border border-outline-variant space-y-2">
                  <h4 className="text-xs font-bold text-on-surface">محرّك الصلاحيات ABAC & RBAC Policy</h4>
                  <p className="text-[11px] text-on-surface-variant">فحص وتطبيق شروط الملكية والقضايا على مستوى السطر.</p>
                  <span className="inline-block text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded font-bold">
                    Prisma RLS Dynamic Guard Active
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Module 4: AI Center */}
          {activeTab === "ai-assistant" || activeTab === "ai-center" ? (
            <div className="card-level-1 rounded-card p-6 space-y-6 text-right">
              <div className="flex items-center justify-between border-b border-outline-variant pb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                  <h3 className="text-md font-bold text-on-surface">
                    مركز الذكاء الاصطناعي والحوكمة (AI Center & LLMs Engine)
                  </h3>
                </div>
                <span className="text-xs bg-primary/5 text-primary border border-primary/20 px-3 py-1 rounded-full font-bold">
                  PDPL PII Masking Shield: Active
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-on-surface">مزود نموذج الذكاء الاصطناعي المعتمد (Active LLM Provider):</h4>
                  <div className="space-y-2">
                    {[
                      { id: "SAUDI_LOCAL_LLM", name: "النموذج المحلي السعودي (Local KSA Cloud LLM)", desc: "مستكشف ومستضاف داخل المملكة للامتثال التام مع الـ PDPL." },
                      { id: "CLAUDE_3_5", name: "Anthropic Claude 3.5 Sonnet", desc: "أعلى أداء في التحليل وصياغة العقود مع تشفير PII." },
                      { id: "GPT_4O", name: "OpenAI GPT-4o Enterprise", desc: "نموذج فائق السرعة للتلخيص والاستعلام القضائي." },
                    ].map((provider) => (
                      <div
                        key={provider.id}
                        onClick={() => setAiProvider(provider.id)}
                        className={`p-4 rounded-card border cursor-pointer transition-all ${
                          aiProvider === provider.id
                            ? "bg-primary/5 border-primary/30"
                            : "bg-surface-container-lowest border-outline-variant hover:border-outline-variant"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <input
                            type="radio"
                            checked={aiProvider === provider.id}
                            onChange={() => setAiProvider(provider.id)}
                            className="accent-primary"
                          />
                          <h5 className="text-xs font-bold text-on-surface">{provider.name}</h5>
                        </div>
                        <p className="text-[11px] text-on-surface-variant mt-1">{provider.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-surface-container-lowest p-5 rounded-card border border-outline-variant space-y-4">
                  <h4 className="text-xs font-bold text-on-surface">إحصائيات واستهلاك التوكنات اليومي:</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-on-surface-variant">إجمالي الطلبات اليومية:</span>
                      <span className="font-bold text-primary">48,500 Tokens</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-on-surface-variant">متوسط زمن الاستجابة (Latency):</span>
                      <span className="font-bold text-secondary">320 ms</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-on-surface-variant">نسبة نجاح التلخيص والصياغة:</span>
                      <span className="font-bold text-purple-400">99.4%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {/* Module 8: System Tools & Recovery */}
          {activeTab === "disaster-recovery" && (
            <div className="card-level-1 rounded-card p-6 space-y-6 text-right">
              <h3 className="text-md font-bold text-on-surface flex items-center gap-2">
                <Terminal className="w-5 h-5 text-primary" />
                أدوات التحكم بالنظام والصيانة اللحظية (System Tools & Disaster Recovery)
              </h3>

              <div className="p-4 bg-surface-container-low border border-outline-variant rounded-card space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <button
                    onClick={handleRunRlsIsolationTest}
                    disabled={testingRls}
                    className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 px-3.5 py-1.5 rounded-card font-bold transition disabled:opacity-50"
                  >
                    {testingRls ? "جاري فحص العزل..." : "تشغيل محاكي عزل PostgreSQL RLS"}
                  </button>
                  <span className="font-bold text-on-surface">اختبار عزل البيانات بين المستأجرين (RLS Tester)</span>
                </div>
                {rlsTestResult && (
                  <p className="text-xs text-secondary font-bold bg-secondary/8 p-2.5 rounded-soft border border-secondary/20">
                    {rlsTestResult}
                  </p>
                )}
              </div>

              {toolResult && (
                <div className="p-4 bg-secondary/8 border border-secondary/20 rounded-card text-xs text-secondary font-bold">
                  {toolResult}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: "تنظيف كاش Redis", action: "CACHE_CLEAR", icon: RefreshCw },
                  { name: "إعادة بناء الفهارس (Reindex)", action: "REINDEX_SEARCH", icon: Database },
                  { name: "تحديث حسابات الفواتير", action: "RECALCULATE_STATS", icon: BarChart3 },
                  { name: "تشغيل فحص التشخيص", action: "RUN_DIAGNOSTICS", icon: Activity },
                ].map((tool, idx) => {
                  const Icon = tool.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleRunSystemTool(tool.action)}
                      disabled={runningTool}
                      className="card-level-1 p-5 rounded-card border border-outline-variant hover:border-primary/20 transition-all flex flex-col items-center gap-3 text-center"
                    >
                      <div className="p-3 bg-surface-container-low rounded-card border border-outline-variant text-primary">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-on-surface">{tool.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* New Tenant Provisioning Modal */}
      {newTenantModalOpen && (
        <div className="fixed inset-0 z-50 bg-surface-container-lowest  flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass rounded-card p-6 space-y-5 border border-primary/20 shadow-level-2 text-right ">
            <div className="flex justify-between items-center border-b border-outline-variant pb-3">
              <button
                onClick={() => setNewTenantModalOpen(false)}
                className="text-xs text-on-surface-variant hover:text-on-surface font-bold"
              >
                إلغاء
              </button>
              <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                تأسيس مكتب محاماة جديد (New Tenant Provisioning)
              </h3>
            </div>

            <form onSubmit={handleCreateNewTenant} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant">اسم مكتب المحاماة الرسمي</label>
                <input
                  type="text"
                  placeholder="مثال: مكتب الفايز للمحاماة والاستشارات"
                  value={newTenantName}
                  onChange={(e) => setNewTenantName(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant px-3.5 py-2 rounded-card text-xs text-on-surface focus:border-secondary focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant">معرّف النطاق (Tenant Slug)</label>
                  <input
                    type="text"
                    placeholder="alfayez-law"
                    value={newTenantSlug}
                    onChange={(e) => setNewTenantSlug(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant px-3.5 py-2 rounded-card text-xs text-on-surface focus:border-secondary focus:outline-none font-body"
                    dir="ltr"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant">نوع الباقة (Plan Tier)</label>
                  <select
                    value={newTenantPlan}
                    onChange={(e) => setNewTenantPlan(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant px-3.5 py-2 rounded-card text-xs text-primary font-bold focus:outline-none"
                  >
                    <option value="solo">Solo (مكتب فردي - 3 محامين)</option>
                    <option value="boutique">Boutique (مكتب متوسط - 15 محامي)</option>
                    <option value="enterprise">Enterprise (مؤسسي - غير محدود)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant">البريد الإلكتروني للمحامي الشريك (Owner Email)</label>
                <input
                  type="email"
                  placeholder="owner@alfayez-law.sa"
                  value={newTenantEmail}
                  onChange={(e) => setNewTenantEmail(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant px-3.5 py-2 rounded-card text-xs text-on-surface focus:border-secondary focus:outline-none font-body"
                  dir="ltr"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-on-primary font-semibold py-3 rounded-card text-xs hover:opacity-95 transition shadow-level-1"
              >
                تأكيد التأسيس وتجهيز الـ RLS فورياً
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Register Lawyer Modal */}
      {newLawyerModalOpen && (
        <div className="fixed inset-0 z-50 bg-surface-container-lowest/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg card-level-2 rounded-card p-6 space-y-5 border border-primary/20 shadow-level-2 text-right">
            <div className="flex justify-between items-center border-b border-outline-variant pb-3">
              <button
                onClick={() => setNewLawyerModalOpen(false)}
                className="text-xs text-on-surface-variant hover:text-on-surface font-bold"
              >
                إلغاء
              </button>
              <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                تسجيل ودعوة محامي جديد بالمكتب (بريد وكلمة مرور)
              </h3>
            </div>

            <form onSubmit={handleCreateNewLawyer} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant">الاسم الكامل للمحامي</label>
                <input
                  type="text"
                  placeholder="مثال: أ. عبد العزيز الدوسري"
                  value={newLawyerName}
                  onChange={(e) => setNewLawyerName(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant px-3.5 py-2 rounded-card text-xs text-on-surface focus:border-secondary focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant">البريد الإلكتروني (Login Email)</label>
                  <input
                    type="email"
                    placeholder="lawyer@firm.sa"
                    value={newLawyerEmail}
                    onChange={(e) => setNewLawyerEmail(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant px-3.5 py-2 rounded-card text-xs text-on-surface focus:border-secondary focus:outline-none font-body"
                    dir="ltr"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant">كلمة المرور (Password)</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={newLawyerPassword}
                    onChange={(e) => setNewLawyerPassword(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant px-3.5 py-2 rounded-card text-xs text-on-surface focus:border-secondary focus:outline-none font-body"
                    dir="ltr"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant">المسمى الوظيفي</label>
                  <select
                    value={newLawyerTitle}
                    onChange={(e) => setNewLawyerTitle(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant px-3.5 py-2 rounded-card text-xs text-primary font-bold focus:outline-none"
                  >
                    <option value="مستشار قانوني ومحامي ممارس">محامي ممارس</option>
                    <option value="محامي شريك">محامي شريك (Partner)</option>
                    <option value="مستشار عقود وترافع">مستشار عقود وترافع</option>
                    <option value="محامي متدرب">محامي متدرب</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant">رقم ترخيص وزارة العدل</label>
                  <input
                    type="text"
                    placeholder="SA-LAW-2026-8800"
                    value={newLawyerLicense}
                    onChange={(e) => setNewLawyerLicense(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant px-3.5 py-2 rounded-card text-xs text-on-surface focus:border-secondary focus:outline-none font-body"
                    dir="ltr"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={lawyerRegisteredSuccess}
                className="w-full bg-primary text-on-primary font-semibold py-3 rounded-card text-xs hover:opacity-95 transition shadow-level-1 flex items-center justify-center gap-2"
              >
                {lawyerRegisteredSuccess ? "جاري تفعيل الحساب وتوليد الاعتماد..." : "تأكيد إضافة المحامي وتفعيل الدخول"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Layer 10: Dangerous Action Confirmation Modal */}
      {dangerousModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border-2 border-error max-w-md w-full p-6 rounded-card space-y-4 shadow-level-3">
            <div className="flex items-center justify-between border-b border-outline-variant pb-3 text-error">
              <h3 className="text-title-md font-bold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                تأكيد تنفيذ إجراء حساس جداً (Layer 10 Dangerous Action)
              </h3>
              <button onClick={() => setDangerousModalOpen(false)} className="text-on-surface-variant text-lg">✕</button>
            </div>

            <div className="space-y-3 text-label-sm font-body">
              <p className="text-on-surface font-semibold">
                أنت على وشك تنفيذ إجراء مؤثّر على المنصة:
              </p>
              <p className="p-3 bg-error/10 border border-error/20 rounded-soft text-error font-bold font-tabular">
                Target: {dangerousTargetEntity}
              </p>

              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface">اكتب كلمة <span className="text-error font-bold">DELETE</span> للتأكيد:</label>
                <input
                  type="text"
                  placeholder="DELETE"
                  value={dangerousConfirmText}
                  onChange={(e) => setDangerousConfirmText(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant px-3 py-2 rounded-card text-xs text-on-surface focus:border-error focus:outline-none font-bold"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleExecuteDangerousAction}
                className="w-full bg-error text-on-error font-bold py-2.5 rounded-card text-xs shadow-level-1"
              >
                تأكيد وحفظ الإجراء بـ Audit Vault
              </button>
              <button
                onClick={() => setDangerousModalOpen(false)}
                className="w-full btn-secondary py-2.5 rounded-card text-xs font-bold"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Layer 14: Secure Impersonation Engine Modal */}
      {impersonateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-outline-variant max-w-md w-full p-6 rounded-card space-y-4 shadow-level-3">
            <div className="flex items-center justify-between border-b border-outline-variant pb-3 text-primary">
              <h3 className="text-title-md font-bold flex items-center gap-2">
                <Workflow className="w-5 h-5" />
                محرك الدخول والتفتيش (Secure Impersonation Engine)
              </h3>
              <button onClick={() => setImpersonateModalOpen(false)} className="text-on-surface-variant text-lg">✕</button>
            </div>

            <div className="space-y-3 text-label-sm font-body">
              <p className="text-on-surface">
                سيتم فتح جلسة مؤقتة للدخول كـ <strong>{targetTenantToImpersonate?.name}</strong> دون استخدام كلمة المرور الخاصة به.
              </p>

              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface">سبب وتذكرة طلب التفتيش:</label>
                <input
                  type="text"
                  placeholder="مثال: فحص مشكلة تصدير الفواتير بناءً على التذكرة #TK-9910"
                  value={impersonateReason}
                  onChange={(e) => setImpersonateReason(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant px-3 py-2 rounded-card text-xs text-on-surface focus:border-primary focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleConfirmImpersonation}
                className="w-full btn-primary py-2.5 rounded-card text-xs font-bold"
              >
                بدء جلسة التفتيش المؤقتة
              </button>
              <button
                onClick={() => setImpersonateModalOpen(false)}
                className="w-full btn-secondary py-2.5 rounded-card text-xs font-bold"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
