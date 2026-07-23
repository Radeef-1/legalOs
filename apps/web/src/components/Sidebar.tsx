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
  UserPlus,
  Settings,
  Compass,
} from "lucide-react";
import { CommandKModal } from "./CommandKModal";
import { useTenant } from "./tenant/TenantProvider";
import { TenantLogo } from "./tenant/TenantLogo";
import { TenantTitle } from "./tenant/TenantTitle";

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { tenant } = useTenant();
  const [isSuperAdmin, setIsSuperAdmin] = React.useState(false);
  const [userFirmName, setUserFirmName] = React.useState("مكتب العتيبي للمحاماة والاستشارات القانونية والشرعية");
  const [activeRole, setActiveRole] = React.useState<"admin" | "lawyer" | "client">("admin");

  React.useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed.firmName) setUserFirmName(parsed.firmName);
        if (parsed.role) setActiveRole(parsed.role);
        if (parsed.role === "SUPER_ADMIN" || parsed.email === "admin@legalos.sa") {
          setIsSuperAdmin(true);
        }
      } catch (e) {}
    }
  }, []);

  const handleRoleChange = (newRole: "admin" | "lawyer" | "client") => {
    setActiveRole(newRole);
    localStorage.setItem("userRole", newRole);
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          parsed.role = newRole === "client" ? "CLIENT" : newRole === "lawyer" ? "LAWYER" : "SUPER_ADMIN";
          localStorage.setItem("user", JSON.stringify(parsed));
        } catch (e) {}
      }
    }
    if (newRole === "client") {
      router.push("/portal");
    } else {
      router.push("/");
    }
  };

  const handleLogout = () => {
    if (typeof document !== "undefined") {
      document.cookie = "accessToken=; path=/; max-age=0; SameSite=Lax";
    }
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
    { label: "منصة التعلم والأكاديمية", path: "/learning", icon: Compass, badge: "DAP" },
    { label: "التقارير وإقرار ZATCA", path: "/reports", icon: BarChart3 },
  ];

  const settingsNavItems = [
    { label: "إدارة المكتب والملف الشخصي", path: "/profile", icon: Building2, badge: "v9" },
    { label: "محرك الدعوات والعضويات", path: "/invitations", icon: UserPlus, badge: "v10" },
  ];

  return (
    <aside
      role="navigation"
      aria-label="القائمة الجانبية الرئيسية"
      className="w-full md:w-sidebar bg-primary text-on-primary p-4 flex flex-col justify-between shrink-0 min-h-[calc(100vh-57px)] space-y-6"
    >
      <div className="space-y-5">
        {/* Tenant Header Info */}
        <div className="p-3.5 rounded-card bg-primary-container/50 border border-white/10">
          <div className="flex items-center gap-3">
            <TenantLogo size="md" />
            <div className="overflow-hidden text-right">
              <p className="text-sm font-semibold text-white truncate">
                <TenantTitle fallback={userFirmName} />
              </p>
              <p className="text-[11px] text-primary-on-container font-body flex items-center gap-1 opacity-70">
                <ShieldCheck className="w-3 h-3 text-secondary font-bold" />
                <span>نظام التشغيل المعتمد</span>
              </p>
            </div>
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

        {/* Section 2: Engines & AI */}
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

        {/* Section 3: Settings & Governance */}
        <div className="space-y-1 pt-2 border-t border-white/10">
          <div className="flex items-center justify-between px-3 pb-1">
            <p className="text-label-sm uppercase text-white/40 tracking-wider flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5 text-secondary font-bold" />
              <span>الإعدادات والحوكمة</span>
            </p>
          </div>
          {settingsNavItems.map((item) => {
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

      <CommandKModal />
    </aside>
  );
}
