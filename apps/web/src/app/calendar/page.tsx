"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { ALL_225_CASES } from "@/data/seededFirmsData";
import {
  Calendar as CalendarIcon,
  Clock,
  Landmark,
  Plus,
  Video,
  CheckCircle2,
  Bell,
  Download,
  Filter,
  User,
  Scale,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Share2,
} from "lucide-react";

export default function CalendarPage() {
  const router = useRouter();

  // Hearings & Events State
  const [hearings, setHearings] = useState<any[]>([
    {
      id: "h-101",
      title: "جلسة المرافعة الأولى - دعوى تجارية",
      caseNumber: "CAS-2026-00226",
      clientName: "شركة التنمية والتطوير المحدودة",
      hearingDate: "2026-07-24",
      hearingTime: "10:00 ص",
      courtName: "المحكمة التجارية بالرياض - الدائرة الأولى",
      courtRoom: "قاعة الجلسات رقم 4 (افتراضي عبر ناجز)",
      lawyerName: "د. عبد الله السلمان",
      type: "court",
      status: "scheduled",
      notes: "مزامنة تلقائية مع ناجز محاكم - تقديم المذكرة الجوابية التكميلية.",
    },
    {
      id: "h-102",
      title: "جلسة استماع الخبراء المحاسبيين",
      caseNumber: "CAS-2026-00109",
      clientName: "مؤسسة الأعمال المتقدمة للمقاولات",
      hearingDate: "2026-07-26",
      hearingTime: "11:30 ص",
      courtName: "المحكمة التجارية بجدة - الدائرة الثانية",
      courtRoom: "قاعة الخبراء والمصفين 2",
      lawyerName: "أ. عبد العزيز الغامدي",
      type: "expert",
      status: "scheduled",
      notes: "تقديم التقرير المحاسبي الشرعي واحتساب أرباح الشراكة.",
    },
    {
      id: "h-103",
      title: "جلسة صلح وتسوية ودية",
      caseNumber: "CAS-2026-00084",
      clientName: "أ. محمد بن علي العتيبي",
      hearingDate: "2026-07-28",
      hearingTime: "01:00 م",
      courtName: "منصة تراضٍ (TARADHI) - مركز المصالحة",
      courtRoom: "غرفة الصلح الافتراضية 5",
      lawyerName: "د. عبد الله السلمان",
      type: "taradhi",
      status: "scheduled",
      notes: "جلسة صلح وتحرير محضر التوافق المعتمد بين الأطراف.",
    },
    {
      id: "h-104",
      title: "اجتماع تحضيري مع الموكل لمراجعة المذكرة",
      caseNumber: "CAS-2026-00192",
      clientName: "شركة الأبعاد العقارية",
      hearingDate: "2026-07-29",
      hearingTime: "04:00 م",
      courtName: "مكتب السلمان للمحاماة - الرياض",
      courtRoom: "قاعة الاجتماعات الرئيسية",
      lawyerName: "أ. خالد الدوسري",
      type: "meeting",
      status: "scheduled",
      notes: "مراجعة المستندات والأسانيد قبل الجلسة القضائية بـ 48 ساعة.",
    },
  ]);

  const [activeFilter, setActiveFilter] = useState<"all" | "court" | "expert" | "taradhi" | "meeting">("all");
  const [modalOpen, setModalOpen] = useState(false);

  // New Hearing Form State
  const [newTitle, setNewTitle] = useState("");
  const [newCaseNumber, setNewCaseNumber] = useState("CAS-2026-00226");
  const [newClientName, setNewClientName] = useState("شركة التنمية والتطوير المحدودة");
  const [newDate, setNewDate] = useState("2026-07-30");
  const [newTime, setNewTime] = useState("10:00 ص");
  const [newCourt, setNewCourt] = useState("المحكمة التجارية بالرياض - الدائرة الأولى");
  const [newLawyer, setNewLawyer] = useState("د. عبد الله السلمان");
  const [newType, setNewType] = useState("court");
  const [newNotes, setNewNotes] = useState("");

  const [syncSuccess, setSyncSuccess] = useState(false);

  // Filtered list
  const filteredHearings = activeFilter === "all" ? hearings : hearings.filter((h) => h.type === activeFilter);

  const handleAddHearingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created = {
      id: `h-${Date.now()}`,
      title: newTitle || "جلسة قضائية جديدة",
      caseNumber: newCaseNumber,
      clientName: newClientName,
      hearingDate: newDate,
      hearingTime: newTime,
      courtName: newCourt,
      courtRoom: "قاعة الجلسات الرقمية (تزامن ناجز)",
      lawyerName: newLawyer,
      type: newType,
      status: "scheduled",
      notes: newNotes || "تم الجدولة وإرسال التنبيهات الآلية للمحامي والموكل.",
    };

    setHearings([created, ...hearings]);
    setModalOpen(false);
    setNewTitle("");
    setNewNotes("");
  };

  const handleSyncNajizCalendar = () => {
    setSyncSuccess(true);
    setTimeout(() => {
      setSyncSuccess(false);
      alert("تمت مزامنة جَميع الجلسات والمواعيد القضائية مع جدول وزارة العدل (ناجز محاكم) بنجاح!");
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col md:flex-row font-heading" dir="rtl">
      <Sidebar />

      <main className="flex-1 p-6 md:p-8 space-y-6 max-w-[1600px] w-full mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-card bg-primary text-on-primary flex items-center justify-center font-semibold shadow-level-1">
              <CalendarIcon className="w-6 h-6 text-on-primary" />
            </div>
            <div>
              <h1 className="text-title-md text-primary font-bold flex items-center gap-2">
                التقويم القانوني ومواعيد الجلسات القضائية (Legal Calendar & Hearings)
                <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-pill font-body font-bold">
                  تزامن لحظي مع ناجز
                </span>
              </h1>
              <p className="text-label-sm text-on-surface-variant font-body">
                جدولة الجلسات، مواعيد الخبراء، جلسات منصة تراضٍ، واجتماعات الموكلين التفاعلية.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSyncNajizCalendar}
              className="btn-secondary text-label-sm py-2 px-3.5 flex items-center gap-1.5"
            >
              <RefreshCw className={`w-4 h-4 text-primary ${syncSuccess ? "animate-spin" : ""}`} />
              <span>مزامنة مع ناجز محاكم ⚡</span>
            </button>

            <button
              onClick={() => alert("جاري تصدير مواعيد الجلسات بصيغة iCal للربط مع Google Calendar و Outlook...")}
              className="btn-secondary text-label-sm py-2 px-3.5 flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>تصدير التقويم (Google / Outlook)</span>
            </button>

            <button
              onClick={() => setModalOpen(true)}
              className="btn-primary text-label-sm py-2 px-4 flex items-center gap-1.5 shadow-level-1"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة جلسة / موعد جديد</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-surface-container-lowest p-2 rounded-card border border-outline-variant shadow-level-1 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max">
            {[
              { id: "all", label: `جميع المواعيد والجلسات (${hearings.length})`, icon: CalendarIcon },
              { id: "court", label: "جلسات المحاكم الرسمية", icon: Landmark },
              { id: "expert", label: "جلسات الخبراء والمصفين", icon: Scale },
              { id: "taradhi", label: "جلسات منصة تراضٍ", icon: ShieldCheck },
              { id: "meeting", label: "اجتماعات الموكلين التحضيرية", icon: User },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-soft text-label-md transition-all font-semibold ${
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

        {/* Hearings List View */}
        <div className="space-y-4">
          {filteredHearings.map((h) => (
            <div
              key={h.id}
              className="card-level-1 p-6 rounded-card border border-outline-variant hover:border-primary/40 transition-all flex flex-wrap items-center justify-between gap-6 shadow-level-1"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-card bg-primary/10 text-primary flex flex-col items-center justify-center shrink-0 border border-primary/20">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                  <span className="text-[10px] font-bold font-tabular mt-0.5">{h.hearingDate.split("-")[2]} يوليو</span>
                </div>

                <div className="space-y-1 text-right">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-title-md font-bold text-on-surface">{h.title}</h3>
                    <span className="text-label-sm font-semibold text-primary font-tabular bg-primary/10 px-2.5 py-0.5 rounded-pill border border-primary/20">
                      {h.caseNumber}
                    </span>
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-pill ${
                        h.type === "court"
                          ? "bg-amber-500/10 text-amber-700 border border-amber-500/20"
                          : h.type === "expert"
                          ? "bg-purple-500/10 text-purple-700 border border-purple-500/20"
                          : h.type === "taradhi"
                          ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20"
                          : "bg-blue-500/10 text-blue-700 border border-blue-500/20"
                      }`}
                    >
                      {h.type === "court"
                        ? "جلسة محكمة"
                        : h.type === "expert"
                        ? "جلسة خبير"
                        : h.type === "taradhi"
                        ? "منصة تراضٍ"
                        : "اجتماع تحضيري"}
                    </span>
                  </div>

                  <p className="text-body-md text-on-surface-variant font-body">
                    الموكل: <span className="font-semibold text-on-surface">{h.clientName}</span> | المحامي المسؤول:{" "}
                    <span className="font-semibold text-primary">{h.lawyerName}</span>
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-label-sm text-on-surface-variant font-body pt-1">
                    <span className="flex items-center gap-1 font-semibold text-secondary">
                      <Clock className="w-4 h-4 text-secondary" />
                      التاريخ والوقت: {h.hearingDate} | الساعة {h.hearingTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <Landmark className="w-4 h-4 text-primary" />
                      {h.courtName} ({h.courtRoom})
                    </span>
                  </div>

                  {h.notes && (
                    <p className="text-label-sm text-on-surface-variant bg-surface-container-low p-2 rounded-soft border border-outline-variant font-body mt-2">
                      💡 ملاحظات التحضير: {h.notes}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => alert(`تم إرسال إشعار تذكير SMS والواتساب للموكل والمحامي للجلسة ${h.caseNumber}!`)}
                  className="btn-secondary text-label-sm py-1.5 px-3 flex items-center gap-1"
                >
                  <Bell className="w-4 h-4 text-secondary" />
                  إرسال تذكير
                </button>

                <button
                  onClick={() => router.push(`/cases/case-1`)}
                  className="btn-primary text-label-sm py-1.5 px-3.5 flex items-center gap-1 shadow-level-1"
                >
                  <Scale className="w-4 h-4" />
                  ملف القضية
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Add Hearing Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-on-surface/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card-level-2 max-w-lg w-full p-6 rounded-card space-y-4 text-right font-heading">
            <div className="flex items-center justify-between border-b border-outline-variant pb-2">
              <h3 className="text-title-md font-bold text-primary flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" />
                إضافة وقيد جلسة قضائية جديدة بالتقويم
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-on-surface-variant">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddHearingSubmit} className="space-y-4">
              <div>
                <label className="text-label-sm font-semibold text-on-surface">عنوان الجلسة / الموضوع</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: جلسة الاستماع والمرافعة الأولى"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full mt-1 bg-surface-container-lowest border border-outline-variant rounded-soft px-3 py-2 text-body-md text-on-surface"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-label-sm font-semibold text-on-surface">القضية المرتبطة</label>
                  <select
                    value={newCaseNumber}
                    onChange={(e) => setNewCaseNumber(e.target.value)}
                    className="w-full mt-1 bg-surface-container-lowest border border-outline-variant rounded-soft px-2.5 py-2 text-body-md text-primary font-semibold"
                  >
                    {ALL_225_CASES.slice(0, 10).map((c) => (
                      <option key={c.id} value={c.caseNumberInternal}>
                        {c.caseNumberInternal} - {c.clientName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-label-sm font-semibold text-on-surface">نوع الجلسة</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full mt-1 bg-surface-container-lowest border border-outline-variant rounded-soft px-2.5 py-2 text-body-md text-on-surface font-semibold"
                  >
                    <option value="court">جلسة محكمة مرافعة</option>
                    <option value="expert">جلسة خبير محاسبي / تصفية</option>
                    <option value="taradhi">جلسة صلح منصة تراضٍ</option>
                    <option value="meeting">اجتماع تحضيري مع الموكل</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-label-sm font-semibold text-on-surface">تاريخ الجلسة</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full mt-1 bg-surface-container-lowest border border-outline-variant rounded-soft px-3 py-1.5 text-body-md text-primary font-tabular"
                  />
                </div>

                <div>
                  <label className="text-label-sm font-semibold text-on-surface">وقت الجلسة</label>
                  <input
                    type="text"
                    required
                    placeholder="10:00 ص"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full mt-1 bg-surface-container-lowest border border-outline-variant rounded-soft px-3 py-1.5 text-body-md text-primary font-tabular"
                  />
                </div>
              </div>

              <div>
                <label className="text-label-sm font-semibold text-on-surface">المحكمة / مكان الجلسة</label>
                <input
                  type="text"
                  required
                  value={newCourt}
                  onChange={(e) => setNewCourt(e.target.value)}
                  className="w-full mt-1 bg-surface-container-lowest border border-outline-variant rounded-soft px-3 py-2 text-body-md text-on-surface"
                />
              </div>

              <div>
                <label className="text-label-sm font-semibold text-on-surface">الملاحظات والأسانيد المطلوبة</label>
                <textarea
                  rows={2}
                  placeholder="اكتب الأسانيد الواجب إعدادها قبل الجلسة..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full mt-1 bg-surface-container-lowest border border-outline-variant rounded-soft p-3 text-body-md text-on-surface"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full btn-primary py-3 rounded-card text-label-md font-bold shadow-level-1"
              >
                تأكيد إضافة وتزامن الجلسة
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
