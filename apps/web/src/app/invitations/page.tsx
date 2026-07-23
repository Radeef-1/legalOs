"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { CreateInviteModal } from "@/components/invitations/CreateInviteModal";
import { BulkInviteModal } from "@/components/invitations/BulkInviteModal";
import { InviteTimelineDrawer } from "@/components/invitations/InviteTimelineDrawer";
import {
  UserPlus,
  FileSpreadsheet,
  Clock,
  ShieldCheck,
  Send,
  RefreshCw,
  Copy,
  Trash2,
  TrendingUp,
  Search,
  Filter,
  CheckCircle2,
  Users,
} from "lucide-react";

export default function InvitationsControlCenterPage() {
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [selectedInviteForDrawer, setSelectedInviteForDrawer] = useState<any>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const [invitationsList, setInvitationsList] = useState<any[]>([
    {
      id: "inv-101",
      fullName: "د. عبد الرحمن بن فهد العتيبي",
      email: "salman@lawfirm.sa",
      phone: "+966549040268",
      type: "LAWYER",
      roleName: "شريك رئيسي (Firm Admin)",
      status: "ACCEPTED",
      expiresAt: "2026-09-30",
      channel: "SMS",
      createdAt: "2026-07-20",
      publicUrl: "http://localhost:3000/invite/inv-token-101",
    },
    {
      id: "inv-102",
      fullName: "أ. سارة بنت خالد العتيبي",
      email: "sara@lawfirm.sa",
      phone: "+966500000001",
      type: "LAWYER",
      roleName: "مستشارة عقود (Senior Lawyer)",
      status: "PENDING",
      expiresAt: "2026-08-15",
      channel: "LINK",
      createdAt: "2026-07-22",
      publicUrl: "http://localhost:3000/invite/inv-token-102",
    },
    {
      id: "inv-103",
      fullName: "شركة الأعمال الدولية (موكل)",
      email: "client@globalcorp.sa",
      phone: "+966500000002",
      type: "CLIENT",
      roleName: "بوابة الموكلين (Client Portal)",
      status: "PENDING",
      expiresAt: "2026-08-01",
      channel: "WHATSAPP",
      createdAt: "2026-07-23",
      publicUrl: "http://localhost:3000/invite/inv-token-103",
    },
  ]);

  const [analytics, setAnalytics] = useState({
    total: 3,
    pending: 2,
    accepted: 1,
    expired: 0,
    conversionRate: "100.0%",
  });

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setStatusMsg("تم نسخ رابط الدعوة المشفر إلى الحافظة بنجاح 🟢");
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleResend = (id: string) => {
    setStatusMsg("تمت إعادة إرسال الدعوة عبر الرسائل المباشرة بنجاح 🟢");
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleCancel = (id: string) => {
    setInvitationsList((prev) => prev.map((inv) => (inv.id === id ? { ...inv, status: "CANCELLED" } : inv)));
    setStatusMsg("تم إلغاء رابط الدعوة وحظره من الاستخدام 🟢");
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const filteredInvites = invitationsList.filter((inv) => {
    const matchesTab = activeTab === "ALL" || inv.status === activeTab;
    const matchesSearch =
      inv.fullName.includes(searchQuery) ||
      (inv.email && inv.email.includes(searchQuery)) ||
      (inv.phone && inv.phone.includes(searchQuery));
    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col font-heading" dir="rtl">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-surface-container-lowest border-b border-outline-variant px-6 py-3.5 flex items-center justify-between shadow-level-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-card bg-primary text-on-primary flex items-center justify-center font-bold shadow-level-1">
            <UserPlus className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h1 className="text-title-md font-bold text-primary flex items-center gap-2">
              <span>محرك إدارة الدعوات والعضويات المؤسسية</span>
              <span className="text-[10px] bg-secondary/10 text-secondary border border-secondary/20 px-2 py-0.5 rounded-pill font-bold">
                Invitation Engine v10
              </span>
            </h1>
            <p className="text-label-sm text-on-surface-variant font-body">
              مكتب العتيبي للمحاماة والاستشارات القانونية والشرعية
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setBulkModalOpen(true)}
            className="btn-secondary text-xs flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            استيراد جماعي (Bulk Import)
          </button>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="btn-primary text-xs flex items-center gap-2 shadow-level-1"
          >
            <UserPlus className="w-4 h-4" />
            إنشاء دعوة جديدة
          </button>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {statusMsg && (
            <div className="p-3 rounded-card bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 text-label-md font-bold">
              {statusMsg}
            </div>
          )}

          {/* Analytics Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card-level-1 p-4 rounded-card border border-outline-variant flex items-center gap-3">
              <div className="w-10 h-10 rounded-card bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-label-sm text-on-surface-variant">إجمالي الدعوات الصادرة</p>
                <p className="text-title-md font-bold text-primary font-tabular">{analytics.total} دعوة</p>
              </div>
            </div>

            <div className="card-level-1 p-4 rounded-card border border-outline-variant flex items-center gap-3">
              <div className="w-10 h-10 rounded-card bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-label-sm text-on-surface-variant">الدعوات المعلقة</p>
                <p className="text-title-md font-bold text-amber-700 font-tabular">{analytics.pending} معلقة</p>
              </div>
            </div>

            <div className="card-level-1 p-4 rounded-card border border-outline-variant flex items-center gap-3">
              <div className="w-10 h-10 rounded-card bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-label-sm text-on-surface-variant">الدعوات المقبولة</p>
                <p className="text-title-md font-bold text-emerald-700 font-tabular">{analytics.accepted} مقبولة</p>
              </div>
            </div>

            <div className="card-level-1 p-4 rounded-card border border-outline-variant flex items-center gap-3">
              <div className="w-10 h-10 rounded-card bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-label-sm text-on-surface-variant">نسبة التحويل القاطعة</p>
                <p className="text-title-md font-bold text-blue-700 font-tabular">{analytics.conversionRate}</p>
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {["ALL", "PENDING", "ACCEPTED", "CANCELLED"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-card text-label-md transition-all shrink-0 ${
                    activeTab === tab
                      ? "bg-primary text-on-primary font-bold shadow-level-1"
                      : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high font-semibold"
                  }`}
                >
                  {tab === "ALL" ? "الكل" : tab === "PENDING" ? "معلقة" : tab === "ACCEPTED" ? "مقبولة" : "ملغاة"}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 text-on-surface-variant absolute right-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="البحث بالاسم، الجوال أو البريد..."
                className="w-full bg-surface-container-low border border-outline-variant pr-9 pl-3 py-1.5 rounded-soft text-body-md"
              />
            </div>
          </div>

          {/* Invitations Table */}
          <div className="gestalt-region overflow-x-auto">
            <table className="w-full text-right text-body-md border-collapse">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container-low text-label-sm text-primary font-bold">
                  <th className="p-3">اسم المدعو</th>
                  <th className="p-3">نوع الدعوة / الدور</th>
                  <th className="p-3">وسيلة الاتصال</th>
                  <th className="p-3">قناة الإرسال</th>
                  <th className="p-3">الحالة</th>
                  <th className="p-3">تاريخ الانتهاء</th>
                  <th className="p-3 text-left">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvites.map((inv) => (
                  <tr key={inv.id} className="border-b border-outline-variant/60 hover:bg-surface-container-low/50 transition">
                    <td className="p-3 font-semibold text-primary">{inv.fullName}</td>
                    <td className="p-3 text-label-sm font-semibold text-secondary">{inv.roleName}</td>
                    <td className="p-3 font-tabular text-on-surface-variant text-label-sm" dir="ltr">{inv.email || inv.phone}</td>
                    <td className="p-3 text-label-sm font-bold text-primary">{inv.channel}</td>
                    <td className="p-3">
                      <span className={`text-[11px] px-2 py-0.5 rounded-pill font-bold ${inv.status === "ACCEPTED" ? "bg-emerald-500/10 text-emerald-700" : inv.status === "PENDING" ? "bg-amber-500/10 text-amber-700" : "bg-error/10 text-error"}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-3 font-tabular text-on-surface-variant text-label-sm">{inv.expiresAt}</td>
                    <td className="p-3 text-left space-x-2 space-x-reverse">
                      <button onClick={() => setSelectedInviteForDrawer(inv)} className="p-1.5 text-primary hover:bg-primary/10 rounded-soft" title="سجل التدقيق">
                        <Clock className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleCopyLink(inv.publicUrl)} className="p-1.5 text-secondary hover:bg-secondary/10 rounded-soft" title="نسخ الرابط">
                        <Copy className="w-4 h-4" />
                      </button>
                      {inv.status === "PENDING" && (
                        <button onClick={() => handleCancel(inv.id)} className="p-1.5 text-error hover:bg-error/10 rounded-soft" title="إلغاء الدعوة">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* Modals & Drawers */}
      <CreateInviteModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={(newInvite) => {
          setInvitationsList((prev) => [newInvite, ...prev]);
          setStatusMsg("تم إنشاء وإرسال الدعوة وتوليد الرابط المحمي بنجاح 🟢");
          setTimeout(() => setStatusMsg(null), 3000);
        }}
      />

      <BulkInviteModal
        isOpen={bulkModalOpen}
        onClose={() => setBulkModalOpen(false)}
        onSuccess={(count) => {
          setStatusMsg(`تمت معالجة وتوليد ${count} دعوة جماعية بنجاح 🟢`);
          setTimeout(() => setStatusMsg(null), 3000);
        }}
      />

      <InviteTimelineDrawer
        isOpen={Boolean(selectedInviteForDrawer)}
        onClose={() => setSelectedInviteForDrawer(null)}
        invite={selectedInviteForDrawer}
      />
    </div>
  );
}
