import React, { useState } from "react";
import { Lock, ShieldCheck, Key, Smartphone, Laptop, LogOut, Terminal } from "lucide-react";

export function SecurityCenterTab() {
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const mockSessions = [
    { id: "s-1", device: "Windows PC (Riyadh, KSA)", browser: "Chrome 126", ip: "185.192.208.12", current: true, date: "الآن (نشط)" },
    { id: "s-2", device: "iPhone 15 Pro (Riyadh, KSA)", browser: "Mobile Safari", ip: "185.192.208.44", current: false, date: "منذ ساعتين" },
  ];

  const handleLogoutAll = () => {
    setStatusMsg("تم إنهاء كافة الجلسات النشطة على الأجهزة الأخرى بنجاح 🟢");
    setTimeout(() => setStatusMsg(null), 3000);
  };

  return (
    <div className="space-y-6">
      {statusMsg && (
        <div className="p-3 rounded-card bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 text-label-md font-bold">
          {statusMsg}
        </div>
      )}

      {/* 01. Password & 2FA */}
      <div className="gestalt-region space-y-4">
        <h3 className="text-title-md font-bold text-primary flex items-center gap-2 border-b border-outline-variant pb-2">
          <Lock className="w-5 h-5 text-secondary" />
          <span>إعدادات كلمة المرور والتوثيق الثنائي (2FA)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-card border border-outline-variant bg-surface-container-low flex items-center justify-between">
            <div>
              <h4 className="text-label-md font-bold text-primary">المصادقة الثنائية (MFA / TOTP)</h4>
              <p className="text-label-sm text-on-surface-variant my-1">
                حماية إضافية عبر Google أو Microsoft Authenticator.
              </p>
              <span className="text-xs font-bold text-emerald-700">مفعّل 🟢</span>
            </div>
            <button className="btn-secondary text-xs">إدارة المفاتيح</button>
          </div>

          <div className="p-4 rounded-card border border-outline-variant bg-surface-container-low flex items-center justify-between">
            <div>
              <h4 className="text-label-md font-bold text-primary">المفاتيح البيومترية (Passkeys)</h4>
              <p className="text-label-sm text-on-surface-variant my-1">
                تسجيل الدخول ببصمة الاصبع أو التعرف على الوجه.
              </p>
              <span className="text-xs font-bold text-emerald-700">جاهز 🟢</span>
            </div>
            <button className="btn-secondary text-xs">إضافة Passkey</button>
          </div>
        </div>
      </div>

      {/* 02. Active Sessions */}
      <div className="gestalt-region space-y-4">
        <div className="flex items-center justify-between border-b border-outline-variant pb-2 flex-wrap gap-2">
          <h3 className="text-title-md font-bold text-primary flex items-center gap-2">
            <Laptop className="w-5 h-5 text-primary" />
            <span>الجلسات والأجهزة النشطة (Active Sessions)</span>
          </h3>
          <button onClick={handleLogoutAll} className="btn-secondary text-xs text-error border-error/30 hover:bg-error/10 flex items-center gap-2">
            <LogOut className="w-3.5 h-3.5" />
            تسجيل الخروج من كل الأجهزة
          </button>
        </div>

        <div className="space-y-3">
          {mockSessions.map((s) => (
            <div key={s.id} className="p-3.5 rounded-card border border-outline-variant flex items-center justify-between flex-wrap gap-2 bg-surface-container-lowest">
              <div className="flex items-center gap-3">
                <Laptop className="w-5 h-5 text-primary" />
                <div>
                  <div className="text-label-md font-bold text-primary flex items-center gap-2">
                    <span>{s.device}</span>
                    {s.current && <span className="bg-emerald-500/10 text-emerald-700 text-[10px] px-2 py-0.5 rounded-pill font-bold">الجهاز الحالي</span>}
                  </div>
                  <div className="text-label-sm text-on-surface-variant font-tabular">
                    {s.browser} • IP: {s.ip} • {s.date}
                  </div>
                </div>
              </div>
              {!s.current && (
                <button className="text-xs text-error font-bold hover:underline">إنهاء الجلسة</button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
