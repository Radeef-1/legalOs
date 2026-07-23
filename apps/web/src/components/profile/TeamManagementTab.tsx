import React, { useState } from "react";
import { Users, UserPlus, ShieldCheck, Check, Key, Lock, Clock } from "lucide-react";

export function TeamManagementTab() {
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [delegationModalOpen, setDelegationModalOpen] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const mockTeam = [
    { id: "u-1", name: "د. عبد الرحمن بن فهد العتيبي", role: "شريك رئيسي (Firm Admin)", email: "salman@lawfirm.sa", cases: 25, status: "نشط 🟢" },
    { id: "u-2", name: "أ. سارة بنت خالد العتيبي", role: "مستشارة عقود (Senior Lawyer)", email: "sara@lawfirm.sa", cases: 15, status: "نشط 🟢" },
    { id: "u-3", name: "أ. طارق بن زياد التميمي", role: "محامي قضايا (Lawyer)", email: "tareq@lawfirm.sa", cases: 18, status: "نشط 🟢" },
    { id: "u-4", name: "أ. منيرة بنت سعيد الغامدي", role: "أخصائية شؤون مالية (Finance)", email: "finance@lawfirm.sa", cases: 0, status: "نشط 🟢" },
  ];

  const handleInviteUser = (e: React.FormEvent) => {
    e.preventDefault();
    setInviteModalOpen(false);
    setStatusMsg("تم إرسال دعوة الانضمام للعضو الجديد بنجاح 🟢");
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleCreateDelegation = (e: React.FormEvent) => {
    e.preventDefault();
    setDelegationModalOpen(false);
    setStatusMsg("تم إنشاء تفويض الصلاحيات المؤقت وتوثيقه في سجل التدقيق Audit Log 🟢");
    setTimeout(() => setStatusMsg(null), 3000);
  };

  return (
    <div className="space-y-6">
      {statusMsg && (
        <div className="p-3 rounded-card bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 text-label-md font-bold">
          {statusMsg}
        </div>
      )}

      {/* Header & Quick Action Buttons */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-title-md font-bold text-primary flex items-center gap-2">
            <Users className="w-5 h-5 text-secondary" />
            <span>إدارة فريق العمل والتفويضات</span>
          </h3>
          <p className="text-label-sm text-on-surface-variant font-body">
            إدارة أعضاء المكتب، توزيع الأدوار والصلاحيات، والتفويض المؤقت.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setDelegationModalOpen(true)}
            className="btn-secondary text-xs flex items-center gap-2"
          >
            <Clock className="w-4 h-4 text-amber-600" />
            إدارة التفويضات (Delegation)
          </button>
          <button
            onClick={() => setInviteModalOpen(true)}
            className="btn-primary text-xs flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            دعوة عضو جديد
          </button>
        </div>
      </div>

      {/* Team Members Table */}
      <div className="gestalt-region overflow-x-auto">
        <table className="w-full text-right text-body-md border-collapse">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-container-low text-label-sm text-primary font-bold">
              <th className="p-3">اسم المحامي/العضو</th>
              <th className="p-3">الدور الوظيفي (Role)</th>
              <th className="p-3">البريد الإلكتروني</th>
              <th className="p-3">القضايا المسندة</th>
              <th className="p-3">الحالة</th>
              <th className="p-3 text-left">الصلاحيات</th>
            </tr>
          </thead>
          <tbody>
            {mockTeam.map((u) => (
              <tr key={u.id} className="border-b border-outline-variant/60 hover:bg-surface-container-low/50 transition">
                <td className="p-3 font-semibold text-primary">{u.name}</td>
                <td className="p-3 text-label-sm font-semibold text-secondary">{u.role}</td>
                <td className="p-3 font-tabular text-on-surface-variant text-label-sm" dir="ltr">{u.email}</td>
                <td className="p-3 font-tabular text-on-surface-variant text-label-sm">{u.cases} قضية</td>
                <td className="p-3 font-bold text-emerald-700 text-label-sm">{u.status}</td>
                <td className="p-3 text-left">
                  <button className="btn-secondary py-1 px-2.5 text-[11px] font-bold">
                    تعديل الصلاحيات
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invite Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-card p-6 max-w-md w-full space-y-4 shadow-level-2" dir="rtl">
            <h3 className="text-title-md font-bold text-primary">دعوة محامي/عضو جديد للمكتب</h3>
            <form onSubmit={handleInviteUser} className="space-y-4">
              <div className="gestalt-group">
                <label className="text-label-sm font-semibold text-primary">اسم المحامي الكامل</label>
                <input type="text" required placeholder="د. محمد العتيبي" className="w-full bg-surface-container-low border border-outline-variant px-3 py-2 rounded-soft text-body-md" />
              </div>
              <div className="gestalt-group">
                <label className="text-label-sm font-semibold text-primary">البريد الإلكتروني الرسمي</label>
                <input type="email" required placeholder="lawyer@lawfirm.sa" className="w-full bg-surface-container-low border border-outline-variant px-3 py-2 rounded-soft text-body-md font-tabular" dir="ltr" />
              </div>
              <div className="gestalt-group">
                <label className="text-label-sm font-semibold text-primary">الدور والترخيص</label>
                <select className="w-full bg-surface-container-low border border-outline-variant px-3 py-2 rounded-soft text-body-md">
                  <option value="lawyer">مستشار/محامي ممارس (Senior Lawyer)</option>
                  <option value="assistant">مساعد قانوني (Legal Assistant)</option>
                  <option value="finance">مسؤول مالية (Finance Admin)</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setInviteModalOpen(false)} className="btn-secondary text-xs">إلغاء</button>
                <button type="submit" className="btn-primary text-xs">إرسال الدعوة</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delegation Modal */}
      {delegationModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-card p-6 max-w-md w-full space-y-4 shadow-level-2" dir="rtl">
            <h3 className="text-title-md font-bold text-primary flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <span>إدارة التفويض الصلاحيات المؤقت (Delegation)</span>
            </h3>
            <form onSubmit={handleCreateDelegation} className="space-y-4">
              <div className="gestalt-group">
                <label className="text-label-sm font-semibold text-primary">المحامي المفوض له</label>
                <select className="w-full bg-surface-container-low border border-outline-variant px-3 py-2 rounded-soft text-body-md">
                  <option value="u-2">أ. سارة بنت خالد العتيبي</option>
                  <option value="u-3">أ. طارق بن زياد التميمي</option>
                </select>
              </div>
              <div className="gestalt-group">
                <label className="text-label-sm font-semibold text-primary">تاريخ انتهاء التفويض</label>
                <input type="date" required className="w-full bg-surface-container-low border border-outline-variant px-3 py-2 rounded-soft text-body-md font-tabular" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setDelegationModalOpen(false)} className="btn-secondary text-xs">إلغاء</button>
                <button type="submit" className="btn-primary text-xs">اعتماد التفويض</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
