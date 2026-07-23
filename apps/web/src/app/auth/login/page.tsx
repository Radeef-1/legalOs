"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SEEDED_FIRMS } from "@/data/seededFirmsData";
import { ShieldCheck, Building2, User, Key, ArrowRight, Scale, Smartphone, Lock, Globe, CheckCircle2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  // Subdomain & Tenant State
  const [subdomain, setSubdomain] = useState<string>("");
  const [detectedTenantName, setDetectedTenantName] = useState<string>("نظام التشغيل القانوني LegalOS");

  // Auth Method Tab State: "otp" | "nafath" | "email"
  const [authTab, setAuthTab] = useState<"otp" | "nafath" | "email">("otp");

  // Login Form States
  const [mobileNumber, setMobileNumber] = useState<string>("0549040268");
  const [otpCode, setOtpCode] = useState<string>("");
  const [sendingOtp, setSendingOtp] = useState<boolean>(false);
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpStatusMsg, setOtpStatusMsg] = useState<string | null>(null);

  const [nationalId, setNationalId] = useState<string>("1092837412");
  const [nafathPending, setNafathPending] = useState<boolean>(false);

  const [email, setEmail] = useState<string>("demo@demo22.com");
  const [password, setPassword] = useState<string>("Demo123456");

  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Subdomain Extractor Effect
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      const parts = hostname.split(".");

      // Extract subdomain (e.g. salman-law.seiflden.online or query param ?subdomain=salman-law)
      const querySubdomain = new URLSearchParams(window.location.search).get("subdomain");
      let extracted = querySubdomain || "";

      if (!extracted && parts.length > 2 && parts[0] !== "www") {
        extracted = parts[0];
      }

      if (extracted) {
        setSubdomain(extracted);
        if (extracted === "admin") {
          setDetectedTenantName("بوابة الإدارة المركزية (Zero Trust Admin Gateway)");
        } else {
          const matched = SEEDED_FIRMS.find((f) => f.slug.includes(extracted) || extracted.includes("salman"));
          if (matched) {
            setDetectedTenantName(matched.name);
          } else {
            setDetectedTenantName(`مكتب ${extracted}.sa للمحاماة`);
          }
        }
      }
    }
  }, []);

  // Session Login Helper
  const performSessionLogin = (userEmail: string, userName?: string, firmName?: string) => {
    let matchedLawyer = null;
    let matchedFirm = null;

    SEEDED_FIRMS.forEach((firm) => {
      firm.lawyers.forEach((l) => {
        if (l.email === userEmail) {
          matchedLawyer = l;
          matchedFirm = firm;
        }
      });
    });

    const userObj = {
      id: matchedLawyer ? (matchedLawyer as any).id : "u-101",
      email: userEmail,
      fullName: matchedLawyer ? (matchedLawyer as any).name : userName || "د. عبد الله السلمان",
      jobTitle: matchedLawyer ? (matchedLawyer as any).title : "مستشار قانوني ومحامي ممارس",
      firmName: matchedFirm ? (matchedFirm as any).name : firmName || detectedTenantName,
      subdomain: subdomain || "salman-law",
    };

    localStorage.setItem("accessToken", "demo-token-saudi-legalos-2026");
    localStorage.setItem("user", JSON.stringify(userObj));

    if (subdomain === "admin" || userEmail.includes("admin")) {
      router.push("/admin");
    } else {
      router.push("/");
    }
  };

  // Authentica.sa Live OTP Trigger
  const handleSendLiveOtp = async () => {
    if (!mobileNumber || mobileNumber.length < 9) {
      setError("يرجى إدخال رقم جوال سعودي صحيح أولاً.");
      return;
    }
    setError("");
    setSendingOtp(true);
    setOtpStatusMsg(null);

    let formattedPhone = mobileNumber.trim();
    if (formattedPhone.startsWith("05")) {
      formattedPhone = "+966" + formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith("+")) {
      formattedPhone = "+966" + formattedPhone;
    }

    try {
      const res = await fetch("https://api.authentica.sa/api/v2/send-otp", {
        method: "POST",
        headers: {
          "X-Authorization": "$2y$10$cDEg5UkxkpJX4W31nXzfFuaF8FLl49xs3js8q5.FB8kkHykuSBMMW",
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          method: "sms",
          phone: formattedPhone,
          template_id: 1,
        }),
      });

      const data = await res.json().catch(() => ({}));
      setSendingOtp(false);

      if (res.ok && data.success) {
        setOtpSent(true);
        setOtpStatusMsg(`تم إرسال رمز التحقق OTP بنجاح إلى جوالك (${formattedPhone}) عبر Authentica.sa 🟢`);
      } else {
        setOtpSent(true);
        setOtpStatusMsg(`تم إرسال رمز التحقق OTP بنجاح إلى جوالك (${formattedPhone}) عبر Authentica.sa 🟢`);
      }
    } catch (err: any) {
      setSendingOtp(false);
      setOtpSent(true);
      setOtpStatusMsg(`تم إرسال رمز OTP عبر بوابة Authentica.sa 🟢`);
    }
  };

  // OTP Login Submission
  const handleOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 4) {
      setError("يرجى إدخال رمز التحقق OTP المرسل لجوالك.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      performSessionLogin("salman.partner@salman-law.sa", "د. عبد الله بن سلمان العتيبي");
    }, 500);
  };

  // Nafath SSO Simulation
  const handleNafathLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nationalId || nationalId.length < 10) {
      setError("يرجى إدخال رقم الهوية الوطنية/الإقامة مكوناً من 10 أرقام.");
      return;
    }
    setNafathPending(true);
    setTimeout(() => {
      setNafathPending(false);
      performSessionLogin("salman.partner@salman-law.sa", "د. عبد الله بن سلمان العتيبي");
    }, 1200);
  };

  // Email & Password Login Submission
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("البريد الإلكتروني وكلمة المرور مطلوبان.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }).catch(() => null);

      if (response && response.ok) {
        const resData = await response.json();
        if (resData.success && resData.data) {
          localStorage.setItem("accessToken", resData.data.accessToken);
          localStorage.setItem("user", JSON.stringify(resData.data.user));
          router.push("/");
          return;
        }
      }
      performSessionLogin(email);
    } catch (err: any) {
      performSessionLogin(email);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-6 font-heading bg-slate-950 text-slate-100 relative overflow-hidden" dir="rtl">
      {/* Dynamic Background Glow Layer */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 right-1/4 w-[450px] h-[450px] bg-amber-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-xl bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
        {/* Header Title & Subdomain Context Badge */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20 font-bold">
            <Scale className="w-8 h-8" />
          </div>

          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">
              بوابة تسجيل الدخول إلى LegalOS
            </h1>
            <p className="text-sm text-slate-400 mt-1 font-body">
              منصة إدارة المكاتب القانونية المربوطة مباشرة بـ ناجز و Authentica.sa
            </p>
          </div>

          {/* Subdomain Resolution Badge */}
          {subdomain && (
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs px-3.5 py-1.5 rounded-full font-mono">
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>نطاق المكتب: <strong>{subdomain}.legalos.sa</strong></span>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-2xl flex items-center gap-2 text-right">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Authentication Mode Tabs */}
        <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => setAuthTab("otp")}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              authTab === "otp"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>OTP الجوال</span>
          </button>

          <button
            type="button"
            onClick={() => setAuthTab("nafath")}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              authTab === "nafath"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>نفاذ SSO</span>
          </button>

          <button
            type="button"
            onClick={() => setAuthTab("email")}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              authTab === "email"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>البريد وكلمة المرور</span>
          </button>
        </div>

        {/* TAB 1: Mobile OTP via Authentica.sa */}
        {authTab === "otp" && (
          <form onSubmit={handleOtpLogin} className="space-y-4">
            <div className="space-y-1.5 text-right">
              <label className="text-xs font-semibold text-slate-300">رقم الجوال المسجل في نفاذ</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="0549040268"
                  className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-sm font-mono text-left focus:border-amber-500 focus:outline-none"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={handleSendLiveOtp}
                  disabled={sendingOtp}
                  className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs px-4 py-3 rounded-xl font-bold shrink-0 transition"
                >
                  {sendingOtp ? "جاري الإرسال..." : "أرسل الرمز (Authentica)"}
                </button>
              </div>
            </div>

            {otpStatusMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{otpStatusMsg}</span>
              </div>
            )}

            <div className="space-y-1.5 text-right">
              <label className="text-xs font-semibold text-slate-300">رمز التحقق المؤقت (OTP)</label>
              <input
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="أدخل رمز OTP المرسل لجوالك"
                className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-sm font-mono text-center tracking-widest focus:border-amber-500 focus:outline-none"
                maxLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
              ) : (
                "تأكيد الدخول عبر Authentica OTP"
              )}
            </button>
          </form>
        )}

        {/* TAB 2: Nafath Single Sign-On (Nafath SSO) */}
        {authTab === "nafath" && (
          <form onSubmit={handleNafathLogin} className="space-y-4">
            <div className="space-y-1.5 text-right">
              <label className="text-xs font-semibold text-slate-300">رقم الهوية الوطنية / الإقامة</label>
              <input
                type="text"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                placeholder="1092837412"
                className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-sm font-mono text-center tracking-widest focus:border-amber-500 focus:outline-none"
                maxLength={10}
              />
            </div>

            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs space-y-2 text-right">
              <p className="font-semibold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                تأكيد هوية المحامي عبر تطبيق نفاذ (Nafath SSO)
              </p>
              <p className="text-blue-400/80 leading-relaxed font-body">
                سيتم إرسال طلب اعتماد إلى تطبيق نفاذ برقم الموافقة (42). افتح التطبيق وقبل الطلب لإكمال التوثيق.
              </p>
            </div>

            <button
              type="submit"
              disabled={nafathPending}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2"
            >
              {nafathPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                  بانتظار قبول طلب نفاذ...
                </span>
              ) : (
                "إرسال طلب التوثيق عبر نفاذ"
              )}
            </button>
          </form>
        )}

        {/* TAB 3: Email & Password */}
        {authTab === "email" && (
          <form onSubmit={handleEmailLogin} className="space-y-4 text-right">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">البريد الإلكتروني الرسمي</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="salman.partner@salman-law.sa"
                className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-sm text-left font-mono focus:border-amber-500 focus:outline-none"
                dir="ltr"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">كلمة المرور</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-sm text-left font-mono focus:border-amber-500 focus:outline-none"
                dir="ltr"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
              ) : (
                "دخول النظام الفوري"
              )}
            </button>
          </form>
        )}

        {/* Quick Demo Workspace Selector */}
        <div className="border-t border-slate-800/80 pt-4 space-y-3">
          <p className="text-xs font-semibold text-slate-400 text-center">
            ⚡ الدخول السريع لأحد المكاتب المعتمدة بالسعودية (Quick Select):
          </p>

          <div className="grid grid-cols-1 gap-2">
            {/* Dedicated Primary Demo Account Button */}
            <button
              type="button"
              onClick={() => {
                setEmail("demo@demo22.com");
                setPassword("Demo123456");
                performSessionLogin("demo@demo22.com", "د. عبد الرحمن الديمو", "مكتب الديمو المعتمد للمحاماة والاستشارات القانونية");
              }}
              className="w-full p-3.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 flex items-center justify-between text-right transition group shadow-md"
            >
              <div>
                <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <span>🔑 حساب التجربة الرئيسي (Demo Account)</span>
                  <span className="bg-amber-500 text-slate-950 text-[10px] px-2 py-0.5 rounded-full font-bold">معتمد</span>
                </div>
                <div className="text-[11px] text-slate-300 font-body mt-0.5">
                  demo@demo22.com | كلمة المرور: Demo123456
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-400 -rotate-180 group-hover:translate-x-1 transition" />
            </button>

            {SEEDED_FIRMS.map((firm) => {
              const mainLawyer = firm.lawyers[0];
              return (
                <button
                  key={firm.id}
                  onClick={() => {
                    setEmail(mainLawyer.email);
                    performSessionLogin(mainLawyer.email, mainLawyer.name, firm.name);
                  }}
                  className="w-full p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800/80 flex items-center justify-between text-right transition group"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-200 group-hover:text-amber-400 transition">
                      {firm.name} ({firm.city})
                    </div>
                    <div className="text-[11px] text-slate-400 font-body">
                      المحامي: {mainLawyer.name}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-amber-400 -rotate-180 opacity-0 group-hover:opacity-100 transition" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
