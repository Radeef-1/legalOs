"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ProfileOverviewTab } from "@/components/profile/ProfileOverviewTab";
import { OrganizationInfoTab } from "@/components/profile/OrganizationInfoTab";
import { LegalDocumentsVaultTab } from "@/components/profile/LegalDocumentsVaultTab";
import { BrandingCenterTab } from "@/components/profile/BrandingCenterTab";
import { TeamManagementTab } from "@/components/profile/TeamManagementTab";
import { SaudiComplianceTab } from "@/components/profile/SaudiComplianceTab";
import { SecurityCenterTab } from "@/components/profile/SecurityCenterTab";
import { SubscriptionBillingTab } from "@/components/profile/SubscriptionBillingTab";
import { TrustProfileTab } from "@/components/profile/TrustProfileTab";
import { PreferencesTab } from "@/components/profile/PreferencesTab";
import { IntegrationsAiTab } from "@/components/profile/IntegrationsAiTab";
import {
  Building2,
  ShieldCheck,
  FileCheck,
  Palette,
  Users,
  Lock,
  CreditCard,
  Share2,
  LayoutDashboard,
  Award,
  TrendingUp,
  Globe,
  Sparkles,
} from "lucide-react";

export default function EnterpriseProfileControlCenterPage() {
  const [activeTab, setActiveTab] = useState<string>("overview");

  const tabs = [
    { id: "overview", label: "النظرة العامة وصحة المكتب", icon: LayoutDashboard, badge: "92%" },
    { id: "organization", label: "بيانات المنشأة والسجل", icon: Building2 },
    { id: "documents", label: "خزانة الوثائق والأختام والتوقيع", icon: FileCheck },
    { id: "branding", label: "الهوية البصرية والعلامة المائية", icon: Palette },
    { id: "team", label: "إدارة الفريق والصلاحيات والتفويض", icon: Users },
    { id: "compliance", label: "حوكمة الامتثال السعودي (PDPL & MOJ)", icon: ShieldCheck, badge: "100%" },
    { id: "security", label: "مركز الأمان والأجهزة والجلسات", icon: Lock },
    { id: "integrations-ai", label: "الذكاء الاصطناعي والربط (ZATCA & ناجز)", icon: Sparkles },
    { id: "billing", label: "الباقة، الموارد، والاشتراك", icon: CreditCard },
    { id: "preferences", label: "تفضيلات المستخدم والنظام", icon: Globe },
    { id: "trust-profile", label: "بطاقة الثقة العامة للمكتب", icon: Share2 },
  ];

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col font-heading" dir="rtl">
      {/* Top Navigation Header */}
      <header className="sticky top-0 z-50 bg-surface-container-lowest border-b border-outline-variant px-6 py-3.5 flex items-center justify-between shadow-level-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-card bg-primary text-on-primary flex items-center justify-center font-bold shadow-level-1">
            <Building2 className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h1 className="text-title-md font-bold text-primary flex items-center gap-2">
              <span>مركز إدارة وحوكمة المكتب والملف الشخصي</span>
              <span className="text-[10px] bg-secondary/10 text-secondary border border-secondary/20 px-2 py-0.5 rounded-pill font-bold">
                Control Center v9
              </span>
            </h1>
            <p className="text-label-sm text-on-surface-variant font-body">
              مكتب العتيبي للمحاماة والاستشارات القانونية والشرعية (ترخيص رقم SA-LAW-2026-9900)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-emerald-500/10 text-emerald-800 border border-emerald-500/30 text-label-sm px-3 py-1 rounded-pill font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>نظام تشغيل محامي موثق 100%</span>
          </span>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Sub-Navigation Tabs Bar */}
          <div className="flex items-center gap-2 overflow-x-auto border-b border-outline-variant pb-2 no-scrollbar">
            {tabs.map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-card text-label-md transition-all shrink-0 ${
                    isActive
                      ? "bg-primary text-on-primary font-bold shadow-level-1"
                      : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high font-semibold"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{t.label}</span>
                  {t.badge && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-pill font-bold ${isActive ? "bg-white/20 text-white" : "bg-primary/10 text-primary"}`}>
                      {t.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Sub-Tab View Rendering */}
          <div className="mt-4">
            {activeTab === "overview" && <ProfileOverviewTab />}
            {activeTab === "organization" && <OrganizationInfoTab />}
            {activeTab === "documents" && <LegalDocumentsVaultTab />}
            {activeTab === "branding" && <BrandingCenterTab />}
            {activeTab === "team" && <TeamManagementTab />}
            {activeTab === "compliance" && <SaudiComplianceTab />}
            {activeTab === "security" && <SecurityCenterTab />}
            {activeTab === "integrations-ai" && <IntegrationsAiTab />}
            {activeTab === "billing" && <SubscriptionBillingTab />}
            {activeTab === "preferences" && <PreferencesTab />}
            {activeTab === "trust-profile" && <TrustProfileTab />}
          </div>
        </main>
      </div>
    </div>
  );
}
