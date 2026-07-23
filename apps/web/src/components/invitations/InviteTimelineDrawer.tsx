import React from "react";
import { X, Clock, ShieldCheck, CheckCircle2, Eye, Key, Smartphone, Globe } from "lucide-react";

interface InviteTimelineDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  invite: any;
}

export function InviteTimelineDrawer({ isOpen, onClose, invite }: InviteTimelineDrawerProps) {
  if (!isOpen || !invite) return null;

  const mockTimeline = [
    { title: "تم انشاء رمز التوكن المحمي HMAC", time: "09:00 ص", status: "CREATED", desc: "تم توليد التوكن برقم تعريفي فريد وبصمة حماية." },
    { title: "تم إرسال الدعوة عبر الرسائل النصية SMS", time: "09:01 ص", status: "SENT", desc: "تم التمرير عبر مزود التوثيق المباشر Authentica.sa." },
    { title: "تأكيد وصول الرسالة لجوال المدعو", time: "09:02 ص", status: "DELIVERED", desc: "تم التأكيد من شبكة الاتصالات السعودية." },
    { title: "فتح ورؤية رابط الدعوة", time: "09:08 ص", status: "OPENED", desc: "تم فتح الرابط من جهاز Windows PC • IP: 185.192.208.12" },
    { title: "تأكيد رمز التحقق الثنائي (OTP)", time: "09:12 ص", status: "VERIFIED", desc: "تم التحقق الفوري من رمز الجوال بنجاح 🟢" },
    { title: "قبول الدعوة وتأطير الصلاحيات", time: "09:18 ص", status: "ACCEPTED", desc: "تمت إضافة العضوية ومزامنة الصلاحيات بـ Membership Service." },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-end">
      <div className="bg-surface-container-lowest border-r border-outline-variant w-full max-w-md h-full p-6 space-y-6 shadow-level-2 overflow-y-auto" dir="rtl">
        <div className="flex items-center justify-between border-b border-outline-variant pb-4">
          <div>
            <h3 className="text-title-md font-bold text-primary flex items-center gap-2">
              <Clock className="w-5 h-5 text-secondary" />
              <span>السجل الزمني وتدقيق أمان الدعوة</span>
            </h3>
            <p className="text-label-sm text-on-surface-variant font-body mt-0.5">
              تتبع دورة حياة الدعوة وبصمة التوكن التفاعلية
            </p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-surface-container-low rounded-soft text-on-surface-variant">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Invite Info Box */}
        <div className="p-4 rounded-card bg-surface-container-low border border-outline-variant space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-label-sm font-bold text-primary">{invite.fullName}</span>
            <span className="bg-emerald-500/10 text-emerald-800 text-[11px] px-2 py-0.5 rounded-pill font-bold">{invite.status}</span>
          </div>
          <p className="text-label-sm text-on-surface-variant font-tabular" dir="ltr">{invite.email || invite.phone}</p>
          <p className="text-xs text-secondary font-bold">الدور: {invite.roleName}</p>
        </div>

        {/* Timeline Events List */}
        <div className="space-y-4 relative before:absolute before:top-2 before:bottom-2 before:right-3.5 before:w-0.5 before:bg-outline-variant">
          {mockTimeline.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 relative pr-8">
              <div className="w-7 h-7 rounded-pill bg-primary text-on-primary flex items-center justify-center text-xs font-bold shrink-0 absolute right-0 z-10">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="gestalt-region w-full p-3 rounded-card bg-surface-container-lowest border border-outline-variant space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-label-sm font-bold text-primary">{item.title}</h4>
                  <span className="text-[11px] text-on-surface-variant font-tabular">{item.time}</span>
                </div>
                <p className="text-xs text-on-surface-variant font-body">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
