import React from "react";
import {
  Building2,
  ShieldCheck,
  Award,
  Users,
  Briefcase,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  Zap,
  TrendingUp,
  FileText,
  CreditCard,
} from "lucide-react";

export function ProfileOverviewTab() {
  return (
    <div className="space-y-6">
      {/* Firm Identity & Health Score Hero */}
      <div className="gestalt-region bg-gradient-to-r from-primary via-primary-container to-tertiary text-on-primary rounded-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-level-2">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-card bg-secondary text-on-secondary flex items-center justify-center text-title-lg font-bold shadow-md shrink-0">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-title-lg font-bold text-white">
                مكتب العتيبي للمحاماة والاستشارات القانونية والشرعية
              </h2>
              <span className="bg-secondary/20 text-secondary-container border border-secondary/40 text-label-sm px-2.5 py-0.5 rounded-pill font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                مكتمل الامتثال
              </span>
            </div>
            <p className="text-body-md text-white/70 font-body mt-1">
              ترخيص وزارة العدل رقم: <span className="font-tabular font-bold text-white">SA-LAW-2026-9900</span> | سجل تجاري: <span className="font-tabular font-bold text-white">1010998877</span>
            </p>
          </div>
        </div>

        {/* Firm Health Score Metric */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-card text-center min-w-[180px] shrink-0">
          <div className="text-label-sm text-white/80">درجة صحة المكتب (Firm Health Score)</div>
          <div className="text-headline-lg font-bold text-emerald-400 font-tabular my-1 flex items-center justify-center gap-1">
            <span>92%</span>
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-[11px] text-white/90 bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-pill font-bold inline-block">
            ممتاز (Excellent)
          </div>
        </div>
      </div>

      {/* Quick Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-level-1 p-4 rounded-card border border-outline-variant flex items-center gap-3">
          <div className="w-10 h-10 rounded-card bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-label-sm text-on-surface-variant">أعضاء الفريق</p>
            <p className="text-title-md font-bold text-primary font-tabular">15 محامياً ومستشاراً</p>
          </div>
        </div>

        <div className="card-level-1 p-4 rounded-card border border-outline-variant flex items-center gap-3">
          <div className="w-10 h-10 rounded-card bg-secondary/10 text-secondary flex items-center justify-center font-bold shrink-0">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <p className="text-label-sm text-on-surface-variant">القضايا النشطة</p>
            <p className="text-title-md font-bold text-secondary font-tabular">225 قضية</p>
          </div>
        </div>

        <div className="card-level-1 p-4 rounded-card border border-outline-variant flex items-center gap-3">
          <div className="w-10 h-10 rounded-card bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold shrink-0">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <p className="text-label-sm text-on-surface-variant">التخزين المستخدم</p>
            <p className="text-title-md font-bold text-blue-700 font-tabular">42 GB / 500 GB</p>
          </div>
        </div>

        <div className="card-level-1 p-4 rounded-card border border-outline-variant flex items-center gap-3">
          <div className="w-10 h-10 rounded-card bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <p className="text-label-sm text-on-surface-variant">رصيد الذكاء الاصطناعي</p>
            <p className="text-title-md font-bold text-amber-700 font-tabular">850,000 Tokens</p>
          </div>
        </div>
      </div>

      {/* License Expiry & Compliance Quick Banner */}
      <div className="p-4 rounded-card bg-amber-500/10 border border-amber-500/30 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <p className="text-label-md font-bold text-amber-900">تنبيه الامتثال: رخصة المحاماة والسجل التجاري</p>
            <p className="text-body-md text-amber-800 text-xs mt-0.5">
              متبقي 68 يوماً على تجديد رخصة المحاماة الرسمية (تاريخ الانتهاء: 30 سبتمبر 2026).
            </p>
          </div>
        </div>
        <button className="btn-secondary text-xs py-1.5 px-3 border-amber-500/40 text-amber-900 hover:bg-amber-500/20 font-bold">
          تجديد الرخصة الآن
        </button>
      </div>
    </div>
  );
}
