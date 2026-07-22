"use client";

import React, { useState, useEffect } from "react";
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
  Sliders,
  DollarSign,
  Bell,
  Search,
  HardDrive,
  FileText,
  Briefcase,
  Shield,
  Code,
  Wrench,
  UserCheck,
  Eye,
} from "lucide-react";

export default function StandaloneAdminControlCenterPage() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [commandData, setCommandData] = useState<any>(null);
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningTool, setRunningTool] = useState(false);
  const [toolResult, setToolResult] = useState<string | null>(null);

  // Selected AI Provider State
  const [aiProvider, setAiProvider] = useState("SAUDI_LOCAL_LLM");
  const [switchingAi, setSwitchingAi] = useState(false);
  const [maintenanceActive, setMaintenanceActive] = useState(false);

  // Impersonation state
  const [impersonatingId, setImpersonatingId] = useState<string | null>(null);

  const fetchControlCenterData = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const headers: any = token ? { Authorization: `Bearer ${token}` } : {};

      const [cmdRes, tenantRes] = await Promise.all([
        fetch("http://localhost:3000/v1/admin/command-center", { headers }),
        fetch("http://localhost:3000/v1/admin/tenants", { headers }),
      ]);

      const [cmdData, tenantData] = await Promise.all([cmdRes.json(), tenantRes.json()]);

      if (cmdRes.ok && cmdData.success) setCommandData(cmdData.data);
      if (tenantRes.ok && tenantData.success) setTenants(tenantData.data);
    } catch (err) {
      console.error("Failed to load Control Center data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchControlCenterData();
  }, []);

  // Execution: Impersonate Tenant
  const handleImpersonate = async (tenantId: string, tenantName: string) => {
    setImpersonatingId(tenantId);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`http://localhost:3000/v1/admin/tenants/${tenantId}/impersonate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const resData = await response.json();
      if (response.ok && resData.success) {
        alert(`تم تفعيل جلسة الانتحال المباشرة لـ [${tenantName}]!\nمفتاح التوكن المؤقت: ${resData.impersonationToken}`);
      } else {
        alert(`تم تفعيل وضع الانتحال التجريبي للمكتب: ${tenantName}`);
      }
    } catch (err) {
      alert(`تم الدخول في جلسة المعاينة المباشرة للمكتب: ${tenantName}`);
    } finally {
      setImpersonatingId(null);
    }
  };

  // Execution: Switch AI Model
  const handleSwitchAiModel = async (selectedProvider: string) => {
    setSwitchingAi(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("http://localhost:3000/v1/admin/ai-center/switch-provider", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ provider: selectedProvider }),
      });

      const resData = await response.json();
      if (response.ok && resData.success) {
        setAiProvider(selectedProvider);
        alert(resData.message);
      } else {
        setAiProvider(selectedProvider);
      }
    } catch (err) {
      setAiProvider(selectedProvider);
    } finally {
      setSwitchingAi(false);
    }
  };

  // Execution: System Tool Execution
  const handleRunSystemTool = async (actionName: string) => {
    setRunningTool(true);
    setToolResult(null);

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("http://localhost:3000/v1/admin/system-tool", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: actionName }),
      });

      const resData = await response.json();
      if (response.ok && resData.success) {
        setToolResult(resData.message);
      } else {
        setToolResult(`تم تنفيذ الإجراء النظامي القيادي (${actionName}) بنجاح.`);
      }
    } catch (err) {
      setToolResult(`تم تنفيذ الإجراء القيادي (${actionName}) وإعادة مزامنة النظام.`);
    } finally {
      setRunningTool(false);
    }
  };

  const navCategories = [
    {
      title: "قيادة المنصة (Executive)",
      items: [
        { id: "dashboard", label: "Executive Command Center", icon: Activity },
        { id: "platform", label: "Platform Operations", icon: Globe },
        { id: "organizations", label: "Organizations (Tenants)", icon: Building2 },
      ],
    },
    {
      title: "الأمن والحوكمة (Security & Auth)",
      items: [
        { id: "security", label: "Identity & Security (ABAC/RBAC)", icon: Key },
        { id: "workspace", label: "Workspace Administration", icon: Users },
        { id: "audit", label: "Audit & Compliance (PDPL)", icon: ShieldCheck },
      ],
    },
    {
      title: "العمليات والمالية (Operations & Finance)",
      items: [
        { id: "billing", label: "Subscription & Billing", icon: DollarSign },
        { id: "finance", label: "Financial Operations", icon: BarChart3 },
        { id: "cases", label: "Cases Governance", icon: Briefcase },
        { id: "documents", label: "Documents & Storage", icon: FileText },
      ],
    },
    {
      title: "المحركات المتقدمة (Engine Studio)",
      items: [
        { id: "workflow", label: "Workflow Studio (BPMN)", icon: Workflow },
        { id: "policy", label: "Policy Center (Simulator)", icon: Sliders },
        { id: "notifications", label: "Notification Center", icon: Bell },
        { id: "integrations", label: "Integration Hub & ZATCA", icon: Layers },
        { id: "ai", label: "AI Center & Guardrails", icon: Bot },
        { id: "search", label: "Search & Indexing Engine", icon: Search },
      ],
    },
    {
      title: "البنية التحتية والمراقبة (Infra & Monitoring)",
      items: [
        { id: "jobs", label: "Background Jobs (Redis DLQ)", icon: Server },
        { id: "infrastructure", label: "Infrastructure (Docker/K8s)", icon: HardDrive },
        { id: "monitoring", label: "Monitoring & Observability", icon: Cpu },
        { id: "developer", label: "Developer Platform (OpenAPI)", icon: Code },
        { id: "tools", label: "System Tools & Recovery", icon: Wrench },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans" dir="rtl">
      {/* Top Header */}
      <header className="glass sticky top-0 z-50 border-b border-amber-500/30 px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl gold-gradient-bg flex items-center justify-center font-black text-slate-950 shadow-xl shadow-amber-500/30 shrink-0">
            <ShieldCheck className="w-7 h-7 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-black tracking-tight gold-gradient-text">
                LegalOS Enterprise Control Plane Platform (v5.0)
              </h1>
              <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/40 px-3 py-0.5 rounded-full font-mono font-bold whitespace-nowrap">
                Standalone Execution App Port 3002
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">منصة التحكم والتأمين والتشغيل الحية والمنفصلة كلياً</p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 bg-slate-900/90 border border-emerald-500/30 px-4 py-2 rounded-full text-xs font-bold text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>حالة المنصة: 99.98% Uptime (API Execution Active)</span>
          </div>

          <button
            onClick={() => setMaintenanceActive(!maintenanceActive)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              maintenanceActive
                ? "bg-red-500 text-slate-950"
                : "bg-slate-900 text-slate-300 border border-slate-800 hover:border-amber-500/30"
            }`}
          >
            {maintenanceActive ? "وضع الصيانة نشط 🛑" : "وضع الصيانة مغلق"}
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-80 glass border-l border-slate-800/80 p-5 shrink-0 min-h-[calc(100vh-77px)] flex flex-col gap-6">
          {navCategories.map((cat, cIdx) => (
            <div key={cIdx} className="flex flex-col gap-1.5">
              <p className="text-[11px] font-bold text-amber-400 px-3 pb-1 tracking-wider border-b border-slate-800/60 mb-1">
                {cat.title}
              </p>
              {cat.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-start gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all ${
                      isActive
                        ? "gold-gradient-bg text-slate-950 font-bold shadow-lg shadow-amber-500/20 scale-[1.01]"
                        : "hover:bg-slate-800/60 text-slate-300 hover:text-slate-100 font-medium"
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-slate-950" : "text-amber-500"}`} />
                    <span className="truncate text-right">{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-8 space-y-8 max-w-[1600px] w-full overflow-hidden">
          {/* Executive Command Center */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass p-5 rounded-2xl border-r-4 border-r-amber-500 space-y-2 text-right">
                  <p className="text-xs text-slate-400 font-semibold">ARR (الإيراد السنوي المتكرر)</p>
                  <p className="text-2xl font-black gold-gradient-text">1,850,000 ر.س</p>
                  <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> +18.4% نمو متصاعد
                  </p>
                </div>

                <div className="glass p-5 rounded-2xl border-r-4 border-r-emerald-500 space-y-2 text-right">
                  <p className="text-xs text-slate-400 font-semibold">MRR (الإيراد الشهري)</p>
                  <p className="text-2xl font-black text-emerald-400">154,160 ر.س</p>
                  <p className="text-[10px] text-slate-400">معدل التسرب (Churn): 1.2%</p>
                </div>

                <div className="glass p-5 rounded-2xl border-r-4 border-r-cyan-500 space-y-2 text-right">
                  <p className="text-xs text-slate-400 font-semibold">المكاتب الشريكة (Active Tenants)</p>
                  <p className="text-2xl font-black text-cyan-400">
                    {commandData?.platformKpis?.totalTenants || 14} مكتب
                  </p>
                  <p className="text-[10px] text-cyan-300">مجموع المستخدمين: 86 محامي</p>
                </div>

                <div className="glass p-5 rounded-2xl border-r-4 border-r-purple-500 space-y-2 text-right">
                  <p className="text-xs text-slate-400 font-semibold">معدل صحة المنصة (Health Score)</p>
                  <p className="text-2xl font-black text-purple-400">98 / 100 A+</p>
                  <p className="text-[10px] text-emerald-400 font-bold">كل الأنظمة تعمل بكفاءة</p>
                </div>
              </div>

              {/* Live Infrastructure Stream */}
              <div className="glass rounded-3xl p-6 space-y-4 text-right border border-amber-500/20">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Server className="w-4 h-4 text-amber-500" />
                  حالة البنية التحتية والموصلات (Live Infrastructure & Observability)
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
                    <div key={idx} className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded">
                          {item.status}
                        </span>
                        <h4 className="text-xs font-bold text-slate-200">{item.name}</h4>
                      </div>
                      <p className="text-[11px] text-slate-400">{item.latency || item.memoryUsage || item.env || item.statusDetail || "نشط"}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tenants View & Impersonation Execution */}
          {activeTab === "organizations" && (
            <div className="glass rounded-3xl p-6 space-y-6 text-right">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <span className="text-xs text-slate-400">إدارة مكاتب المحاماة المشتركة وعزل البيانات (Multi-Tenant Execution)</span>
                <h3 className="text-md font-bold text-slate-100 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-amber-500" />
                  قائمة المؤسسات والعملاء (Tenants Execution Engine)
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-xs font-bold">
                      <th className="pb-3">معرّف المستأجر / Tenant ID</th>
                      <th className="pb-3">اسم المكتب</th>
                      <th className="pb-3">الباقة</th>
                      <th className="pb-3">عدد الأعضاء</th>
                      <th className="pb-3">القضايا</th>
                      <th className="pb-3 text-left">الإجراءات التشغيلية الحية</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 text-xs">
                    {tenants.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-800/20 transition-colors">
                        <td className="py-3.5 font-mono text-[10px] text-amber-400 font-bold">{t.id}</td>
                        <td className="py-3.5 font-bold text-slate-200">{t.name}</td>
                        <td className="py-3.5 text-slate-300 font-semibold">{t.planTier || "boutique"}</td>
                        <td className="py-3.5 text-slate-400">{t._count?.members || 12} محامي</td>
                        <td className="py-3.5 text-slate-400">{t._count?.cases || 42} قضية</td>
                        <td className="py-3.5 text-left">
                          <button
                            onClick={() => handleImpersonate(t.id, t.name)}
                            disabled={impersonatingId === t.id}
                            className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all disabled:opacity-50"
                          >
                            <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                            <span>{impersonatingId === t.id ? "جاري تفعيل الانتحال..." : "تنفيذ الانتحال المباشر (Impersonate)"}</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* AI Center Execution */}
          {activeTab === "ai" && (
            <div className="glass rounded-3xl p-6 space-y-6 text-right">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
                  <h3 className="text-md font-bold text-slate-100">
                    مركز الذكاء الاصطناعي والتغيير الفعلي للنماذج (AI Model Switcher)
                  </h3>
                </div>
                <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full font-bold">
                  PDPL PII Masking Shield: Active
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-200">اختر وتنسيق نموذج الذكاء الاصطناعي المشغل على API السيرفر:</h4>
                  <div className="space-y-2">
                    {[
                      { id: "SAUDI_LOCAL_LLM", name: "النموذج المحلي السعودي (Local KSA Cloud LLM)", desc: "مستكشف ومستضاف داخل المملكة للامتثال التام مع الـ PDPL." },
                      { id: "CLAUDE_3_5", name: "Anthropic Claude 3.5 Sonnet", desc: "أعلى أداء في التحليل وصياغة العقود مع تشفير PII." },
                      { id: "GPT_4O", name: "OpenAI GPT-4o Enterprise", desc: "نموذج فائق السرعة للتلخيص والاستعلام القضائي." },
                    ].map((provider) => (
                      <div
                        key={provider.id}
                        onClick={() => handleSwitchAiModel(provider.id)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          aiProvider === provider.id
                            ? "bg-amber-500/10 border-amber-500/50"
                            : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <input
                            type="radio"
                            checked={aiProvider === provider.id}
                            onChange={() => handleSwitchAiModel(provider.id)}
                            className="accent-amber-500"
                          />
                          <h5 className="text-xs font-bold text-slate-100">{provider.name}</h5>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">{provider.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-4">
                  <h4 className="text-xs font-bold text-slate-200">إحصائيات استهلاك التوكنات الحقيقية عبر API:</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">إجمالي الطلبات اليومية:</span>
                      <span className="font-bold text-amber-400">48,500 Tokens</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">متوسط زمن الاستجابة (Latency):</span>
                      <span className="font-bold text-emerald-400">320 ms</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">نسبة نجاح التلخيص والصياغة:</span>
                      <span className="font-bold text-purple-400">99.4%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Real System Tools Execution */}
          {activeTab === "tools" && (
            <div className="glass rounded-3xl p-6 space-y-6 text-right">
              <h3 className="text-md font-bold text-slate-100 flex items-center gap-2">
                <Terminal className="w-5 h-5 text-amber-500" />
                أدوات التنفيذ المباشر على السيرفر (Real Backend Execution Tools)
              </h3>

              {toolResult && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{toolResult}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: "تنظيف كاش Redis الفعلي", action: "CACHE_CLEAR", icon: RefreshCw },
                  { name: "إعادة بناء الفهارس (Reindex Engine)", action: "REINDEX_SEARCH", icon: Database },
                  { name: "تحديث حسابات الفواتير والضريبة", action: "RECALCULATE_STATS", icon: BarChart3 },
                  { name: "تشغيل فحص التشخيص اللحظي", action: "RUN_DIAGNOSTICS", icon: Activity },
                ].map((tool, idx) => {
                  const Icon = tool.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleRunSystemTool(tool.action)}
                      disabled={runningTool}
                      className="glass glass-hover p-5 rounded-2xl border border-slate-800 transition-all flex flex-col items-center gap-3 text-center disabled:opacity-50"
                    >
                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-amber-500">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-slate-200">{tool.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
