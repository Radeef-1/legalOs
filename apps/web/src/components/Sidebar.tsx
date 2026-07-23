"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  Kanban,
  Calendar,
  FileText,
  Workflow,
  BarChart3,
  Globe,
  LogOut,
  Sparkles,
  Building2,
  ShieldCheck,
} from "lucide-react";

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isSuperAdmin, setIsSuperAdmin] = React.useState(false);
  const [userFirmName, setUserFirmName] = React.useState("مكتب السلمان للمحاماة");
  const [activeRole, setActiveRole] = React.useState<"admin" | "lawyer" | "client">("admin");

  React.useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed.firmName) setUserFirmName(parsed.firmName);
        if (parsed.role) setActiveRole(parsed.role);
        if (parsed.email === "admin@legalos.sa" || parsed.isSuperAdmin) {
          setIsSuperAdmin(true);
        }
      } catch (e) {}
    }
  }, []);

  const handleRoleChange = (newRole: "admin" | "lawyer" | "client") => {
    setActiveRole(newRole);
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        parsed.role = newRole;
        localStorage.setItem("user", JSON.stringify(parsed));
      } catch (e) {}
    }
    if (newRole === "client") {
      router.push("/portal");
    } else {
      router.push("/");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  const mainNavItems = [
    ...(isSuperAdmin ? [{ label: "مركز التشغيل القيادي", path: "/admin", icon: ShieldCheck, badge: "PRO" }] : []),
    { label: activeRole === "lawyer" ? "لوحة المحامي الفردي" : "لوحة التحكم الرئيسية", path: "/", icon: LayoutDashboard },
    { label: "إدارة القضايا والعملاء", path: "/cases", icon: Briefcase, badge: "حي" },
    { label: "لوحة المهام والإنذارات", path: "/tasks", icon: Kanban },
    { label: "التقويم وجلسات المحاكم", path: "/calendar", icon: Calendar },
    { label: "المستندات والآرشيف", path: "/documents", icon: FileText },
  ];

  const engineNavItems = [
    { label: "المساعد القانوني الذكي", path: "/ai-assistant", icon: Sparkles, badge: "AI" },
    { label: "منصة الربط (ناجز وتراضي)", path: "/integrations", icon: Workflow },
    { label: "التقارير وإقرار ZATCA", path: "/reports", icon: BarChart3 },
  ];

  return (
    <aside className="w-full md:w-sidebar bg-primary text-on-primary p-4 flex flex-col justify-between shrink-0 min-h-[calc(100vh-57px)] space-y-6">
      <div className="space-y-5">
        {/* Tenant Info & Multi-Firm Consultant Switcher */}
        <div className="p-3.5 rounded-card bg-primary-container/50 border border-white/10 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-card bg-secondary flex items-center justify-center font-bold text-on-secondary shadow-md shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="overflow-hidden text-right">
              <p className="text-sm font-semibold text-white truncate">{userFirmName}</p>
              <p className="text-[11px] text-primary-on-container font-body flex items-center gap-1 opacity-70">
                <ShieldCheck className="w-3 h-3" />
                <span>Multi-Tenant Multi-Firm</span>
              </p>
            </div>
          </div>

          {/* Switch Firm / Advisory Client Company */}
          <div className="pt-2 border-t border-white/10">
            <label className="text-[10px] text-white/50 font-body block mb-1">الشركة / الكيان الجاري استشارته:</label>
            <select
              value={userFirmName}
              onChange={(e) => {
                const newFirm = e.target.value;
                setUserFirmName(newFirm);
                const storedUser = localStorage.getItem("user");
                if (storedUser) {
                  try {
                    const parsed = JSON.parse(storedUser);
                    parsed.firmName = newFirm;
                    localStorage.setItem("user", JSON.stringify(parsed));
                  } catch (err) {}
                }
              }}
              className="w-full bg-white/10 text-white text-label-sm rounded-soft px-2 py-1.5 border border-white/20 focus:outline-none font-body font-semibold truncate"
            >
              <option value="مكتب السلمان للمحاماة والاستشارات" className="bg-primary text-white">🏛️ مكتب السلمان للمحاماة (المقر الرئيسي)</option>
              <option value="شركة تطوير العقارية (مستشار)" className="bg-primary text-white">⚖️ شركة تطوير العقارية (مستشار قانوني)</option>
              <option value="مجموعة الأعمال والتكنولوجيا (مستشار)" className="bg-primary text-white">⚖️ مجموعة الأعمال والتكنولوجيا (مستشار قانوني)</option>
              <option value="شركة الخدمات الصناعية (مستشار)" className="bg-primary text-white">⚖️ شركة الخدمات الصناعية (مستشار قانوني)</option>
            </select>
          </div>

          {/* Active View / Mode Switcher */}
          <div className="pt-2 border-t border-white/10">
            <label className="text-[10px] text-white/50 font-body block mb-1">عرض الواجهة الحالية:</label>
            <select
              value={activeRole}
              onChange={(e) => handleRoleChange(e.target.value as any)}
              className="w-full bg-white/10 text-white text-label-sm rounded-soft px-2.5 py-1.5 border border-white/20 focus:outline-none font-body"
            >
              <option value="admin" className="bg-primary text-white">👔 لوحة مدير المكتب (Firm Admin)</option>
              <option value="lawyer" className="bg-primary text-white">⚖️ لوحة المحامي المستشار (Lawyer/Consultant)</option>
              <option value="client" className="bg-primary text-white">👤 معاينة بوابة الموكلين (Client)</option>
            </select>
          </div>
        </div>

        {/* Section 1: Main Work */}
        <div className="space-y-1">
          <p className="text-label-sm uppercase text-white/40 px-3 pb-1 tracking-wider">
            {activeRole === "lawyer" ? "إدارة أعمال المحامي" : "إدارة المكتب والقضايا"}
          </p>
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-card text-label-md transition-all ${
                  isActive
                    ? "bg-white text-primary font-semibold shadow-level-1"
                    : "hover:bg-white/10 text-white/80 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon className={`w-4 h-4 ${isActive ? "text-primary" : "text-white/70"}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-label-sm px-1.5 py-0.5 rounded-soft font-semibold ${
                      isActive ? "bg-primary/10 text-primary" : "bg-white/20 text-white"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Section 2: Engines & Integrations */}
        <div className="space-y-1 pt-2 border-t border-white/10">
          <p className="text-label-sm uppercase text-white/40 px-3 pb-1 tracking-wider">
            المحركات والذكاء
          </p>
          {engineNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-card text-label-md transition-all ${
                  isActive
                    ? "bg-white text-primary font-semibold shadow-level-1"
                    : "hover:bg-white/10 text-white/80 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon className={`w-4 h-4 ${isActive ? "text-primary" : "text-white/70"}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-label-sm px-1.5 py-0.5 rounded-soft font-semibold bg-white/20 text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Section 3: Client Portal External Link */}
        <div className="space-y-1 pt-2 border-t border-white/10">
          <p className="text-label-sm uppercase text-white/40 px-3 pb-1 tracking-wider">
            استقبال الموكلين
          </p>
          <button
            onClick={() => router.push("/portal")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-card text-label-md transition-all ${
              pathname === "/portal"
                ? "bg-white text-primary font-semibold shadow-level-1"
                : "hover:bg-white/10 text-white/80 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-3 truncate">
              <Globe className="w-4 h-4 text-white/70" />
              <span className="truncate">بوابة الموكلين (رابط العميل)</span>
            </div>
            <span className="text-[10px] bg-secondary text-on-secondary px-1.5 py-0.5 rounded-soft font-semibold">
              Portal
            </span>
          </button>
        </div>
      </div>

      {/* Footer / Logout */}
      <div className="space-y-3 pt-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-card text-label-md text-white/70 hover:bg-error/20 hover:text-white transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
}
