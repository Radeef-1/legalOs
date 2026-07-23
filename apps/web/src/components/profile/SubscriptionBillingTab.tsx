import React from "react";
import { CreditCard, Award, Check, Zap, Download, RefreshCw } from "lucide-react";

export function SubscriptionBillingTab() {
  return (
    <div className="space-y-6">
      {/* Active Plan Card */}
      <div className="gestalt-region bg-gradient-to-r from-primary via-primary-container to-secondary text-on-primary rounded-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-secondary text-on-secondary text-label-sm px-2.5 py-0.5 rounded-pill font-bold">
              الباقة الحالية: Enterprise SaaS 2026
            </span>
            <span className="text-emerald-300 font-bold text-xs">تجديد سنوي تلقائي</span>
          </div>
          <h3 className="text-title-lg font-bold text-white mt-2">
            باقة المكاتب والشركات القانونية الكبرى
          </h3>
          <p className="text-body-md text-white/70 font-body mt-1">
            تتضمن 15 مقعد محامي، تخزين 500GB، 1M AI Tokens، وربط ZATCA وناجز غير محدود.
          </p>
        </div>

        <div className="text-right font-tabular shrink-0">
          <div className="text-headline-lg font-bold text-white">12,500 ر.س / سنوياً</div>
          <div className="text-xs text-white/70">تاريخ التجديد القادم: 15 يناير 2027</div>
        </div>
      </div>

      {/* Resource Usage Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-level-1 p-4 rounded-card border border-outline-variant space-y-2">
          <div className="text-label-sm text-on-surface-variant">مقاعد المحامين المستهلكة</div>
          <div className="text-title-md font-bold text-primary font-tabular">15 / 20 مقعداً</div>
          <div className="w-full bg-surface-container-low h-2 rounded-pill overflow-hidden">
            <div className="bg-secondary h-full" style={{ width: "75%" }}></div>
          </div>
        </div>

        <div className="card-level-1 p-4 rounded-card border border-outline-variant space-y-2">
          <div className="text-label-sm text-on-surface-variant">التخزين السحابي المحمي</div>
          <div className="text-title-md font-bold text-primary font-tabular">42 GB / 500 GB</div>
          <div className="w-full bg-surface-container-low h-2 rounded-pill overflow-hidden">
            <div className="bg-blue-600 h-full" style={{ width: "8.4%" }}></div>
          </div>
        </div>

        <div className="card-level-1 p-4 rounded-card border border-outline-variant space-y-2">
          <div className="text-label-sm text-on-surface-variant">رصيد الذكاء الاصطناعي (AI Tokens)</div>
          <div className="text-title-md font-bold text-primary font-tabular">850K / 1M Tokens</div>
          <div className="w-full bg-surface-container-low h-2 rounded-pill overflow-hidden">
            <div className="bg-amber-500 h-full" style={{ width: "85%" }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
