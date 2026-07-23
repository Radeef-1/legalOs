import React from "react";
import { ShieldCheck, AlertTriangle, CheckCircle2, Landmark, FileText, Lock } from "lucide-react";

export function SaudiComplianceTab() {
  const complianceItems = [
    { title: "حالة الامتثال لنظام حماية البيانات الشخصية (PDPL)", desc: "مكتمل 100% — تم تشفير البيانات محلياً واستضافة السيرفرات بالرياض.", status: "امتثال كامل 🟢", daysLeft: null },
    { title: "رخصة ممارسة المحاماة (وزارة العدل MOJ)", desc: "رخصة رقم SA-LAW-2026-9900.", status: "سارية المفعول 🟢", daysLeft: "68 يوماً متبقية (تنبيه 90 يوم)" },
    { title: "السجل التجاري للمكتب (وزارة التجارة)", desc: "سجل رقم 1010998877.", status: "ساري المفعول 🟢", daysLeft: "295 يوماً متبقية" },
    { title: "ربط هيئة الزكاة والضريبة والجمارك (ZATCA Phase 2)", desc: "تم اعتماد الربط والفوترة الإلكترونية وتوليد الـ QR Code.", status: "مرتبط 🟢", daysLeft: null },
    { title: "ربط بوابة ناجز وتراضي الإلكترونية", desc: "ربط مباشر مع منصة ناجز لجلسات المحاكم والقضايا.", status: "نشط 🟢", daysLeft: null },
    { title: "العنوان الوطني المعتمد (واصل البريد السعودي)", desc: "7821 طريق الملك فهد - الرياض.", status: "محدث 🟢", daysLeft: null },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-4 rounded-card bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-emerald-700 shrink-0" />
          <div>
            <h3 className="text-title-md font-bold text-emerald-950">لوحة حوكمة الامتثال السعودي (Saudi Compliance Dashboard)</h3>
            <p className="text-body-md text-emerald-900 text-xs mt-0.5">
              مراقبة دورية فورية لتراخيص وزارة العدل، السجل التجاري، والالتزام بمتطلبات PDPL و ZATCA.
            </p>
          </div>
        </div>
        <span className="bg-emerald-600 text-white text-label-md px-3 py-1 rounded-pill font-bold">
          نسبة الامتثال: 100%
        </span>
      </div>

      {/* Compliance Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {complianceItems.map((item, idx) => (
          <div key={idx} className="gestalt-region flex flex-col justify-between space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-label-md font-bold text-primary flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{item.title}</span>
                </h4>
                <p className="text-label-sm text-on-surface-variant font-body mt-1 leading-relaxed">
                  {item.desc}
                </p>
              </div>
              <span className="text-[11px] font-bold bg-emerald-500/10 text-emerald-800 border border-emerald-500/20 px-2 py-0.5 rounded-pill shrink-0">
                {item.status}
              </span>
            </div>

            {item.daysLeft && (
              <div className="pt-2 border-t border-outline-variant/60 flex items-center justify-between text-xs font-body text-amber-800 font-semibold">
                <span className="flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>{item.daysLeft}</span>
                </span>
                <button className="text-primary hover:underline font-bold">تجديد الوثيقة</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
