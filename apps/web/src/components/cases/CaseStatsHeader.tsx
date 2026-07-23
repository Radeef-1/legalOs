import React from "react";
import { Scale, Briefcase, Landmark, UserCheck } from "lucide-react";

interface CaseStatsHeaderProps {
  totalCases: number;
  activeCases: number;
  courtHearings: number;
  settledCases: number;
}

export function CaseStatsHeader({
  totalCases,
  activeCases,
  courtHearings,
  settledCases,
}: CaseStatsHeaderProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="card-level-1 p-4 rounded-card border border-outline-variant flex items-center gap-3">
        <div className="w-10 h-10 rounded-card bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
          <Briefcase className="w-5 h-5" />
        </div>
        <div>
          <p className="text-label-sm text-on-surface-variant">إجمالي القضايا</p>
          <p className="text-title-md font-bold text-primary font-tabular">{totalCases}</p>
        </div>
      </div>

      <div className="card-level-1 p-4 rounded-card border border-outline-variant flex items-center gap-3">
        <div className="w-10 h-10 rounded-card bg-secondary/10 text-secondary flex items-center justify-center font-bold shrink-0">
          <Scale className="w-5 h-5" />
        </div>
        <div>
          <p className="text-label-sm text-on-surface-variant">القضايا المنظورة</p>
          <p className="text-title-md font-bold text-secondary font-tabular">{activeCases}</p>
        </div>
      </div>

      <div className="card-level-1 p-4 rounded-card border border-outline-variant flex items-center gap-3">
        <div className="w-10 h-10 rounded-card bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold shrink-0">
          <Landmark className="w-5 h-5" />
        </div>
        <div>
          <p className="text-label-sm text-on-surface-variant">الجلسات القادمة</p>
          <p className="text-title-md font-bold text-blue-700 font-tabular">{courtHearings}</p>
        </div>
      </div>

      <div className="card-level-1 p-4 rounded-card border border-outline-variant flex items-center gap-3">
        <div className="w-10 h-10 rounded-card bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold shrink-0">
          <UserCheck className="w-5 h-5" />
        </div>
        <div>
          <p className="text-label-sm text-on-surface-variant">القضايا المنتهية</p>
          <p className="text-title-md font-bold text-emerald-700 font-tabular">{settledCases}</p>
        </div>
      </div>
    </div>
  );
}
