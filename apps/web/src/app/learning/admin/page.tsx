"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import {
  TrendingUp,
  Users,
  CheckCircle2,
  HelpCircle,
  Plus,
  Compass,
  BarChart3,
  Search,
} from "lucide-react";

export default function AdminAdoptionStudioPage() {
  const [analytics, setAnalytics] = useState({
    totalTutorials: 12,
    totalUsersEngaged: 18,
    completedTutorials: 42,
    completionRate: "96.5%",
    averageTimePerTutorial: "1.8 mins",
    certifiedUsersCount: 14,
  });

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col font-heading" dir="rtl">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-surface-container-lowest border-b border-outline-variant px-6 py-3.5 flex items-center justify-between shadow-level-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-card bg-primary text-on-primary flex items-center justify-center font-bold shadow-level-1">
            <Compass className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h1 className="text-title-md font-bold text-primary flex items-center gap-2">
              <span>استوديو تحليلات ومحرك التعلم (Admin Adoption Studio)</span>
              <span className="text-[10px] bg-secondary/10 text-secondary border border-secondary/20 px-2 py-0.5 rounded-pill font-bold">
                Admin DAP Studio
              </span>
            </h1>
            <p className="text-label-sm text-on-surface-variant font-body">
              قياس معدلات تعلم وفهم الفريق والموكلين وتخصيص الجولات والتلميحات
            </p>
          </div>
        </div>

        <button className="btn-primary text-xs flex items-center gap-2 shadow-level-1">
          <Plus className="w-4 h-4" />
          <span>إنشاء جولة تفاعلية جديدة</span>
        </button>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card-level-1 p-4 rounded-card border border-outline-variant flex items-center gap-3">
              <div className="w-10 h-10 rounded-card bg-primary/10 text-primary flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-label-sm text-on-surface-variant">إجمالي المستخدمين المتفاعلين</p>
                <p className="text-title-md font-bold text-primary font-tabular">{analytics.totalUsersEngaged} مستخدم</p>
              </div>
            </div>

            <div className="card-level-1 p-4 rounded-card border border-outline-variant flex items-center gap-3">
              <div className="w-10 h-10 rounded-card bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-label-sm text-on-surface-variant">الدروس والجولات المكتملة</p>
                <p className="text-title-md font-bold text-emerald-700 font-tabular">{analytics.completedTutorials} جولة</p>
              </div>
            </div>

            <div className="card-level-1 p-4 rounded-card border border-outline-variant flex items-center gap-3">
              <div className="w-10 h-10 rounded-card bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-label-sm text-on-surface-variant">معدل الاستكمال والفهم</p>
                <p className="text-title-md font-bold text-blue-700 font-tabular">{analytics.completionRate}</p>
              </div>
            </div>

            <div className="card-level-1 p-4 rounded-card border border-outline-variant flex items-center gap-3">
              <div className="w-10 h-10 rounded-card bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <p className="text-label-sm text-on-surface-variant">متوسط زمن الجولة المصغرة</p>
                <p className="text-title-md font-bold text-amber-700 font-tabular">{analytics.averageTimePerTutorial}</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
