"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { SEEDED_FIRMS } from "@/data/seededFirmsData";
import { ShieldCheck, Building2, User, Key, ArrowRight, Scale } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("salman.partner@salman-law.sa");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const performSessionLogin = (userEmail: string, userName?: string, firmName?: string) => {
    // Find lawyer details or fallback
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
      fullName: matchedLawyer ? (matchedLawyer as any).name : userName || "المحامي الشريك",
      jobTitle: matchedLawyer ? (matchedLawyer as any).title : "مستشار قانوني",
      firmName: matchedFirm ? (matchedFirm as any).name : firmName || "مكتب المحاماة الشريك",
    };

    localStorage.setItem("accessToken", "demo-token-saudi-legalos-2026");
    localStorage.setItem("user", JSON.stringify(userObj));
    router.push("/");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("البريد الإلكتروني وكلمة المرور مطلوبان");
      setLoading(false);
      return;
    }

    try {
      // Attempt connection to backend API
      const response = await fetch("http://localhost:3000/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const resData = await response.json();
        if (resData.success && resData.data) {
          localStorage.setItem("accessToken", resData.data.accessToken);
          localStorage.setItem("user", JSON.stringify(resData.data.user));
          router.push("/");
          return;
        }
      }
      
      // Fallback to local session
      performSessionLogin(email);
    } catch (err: any) {
      // In case backend is offline, perform smooth client-side session login
      performSessionLogin(email);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 font-heading bg-surface text-on-surface" dir="rtl">
      {/* Background decorations — subtle tonal gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-primary-fixed/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-secondary-container/20 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-lg card-level-2 rounded-card p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-card bg-primary flex items-center justify-center mx-auto shadow-level-2">
            <Scale className="w-7 h-7 text-on-primary" />
          </div>
          <h2 className="text-headline-lg text-primary">
            تسجيل الدخول إلى LegalOS
          </h2>
          <p className="text-body-md text-on-surface-variant font-body">
            نظام تشغيل وإدارة المكاتب القانونية المتكامل بالربط المباشر مع منصة ناجز
          </p>
        </div>

        {error && (
          <div className="bg-error-container border border-error/20 text-error-on-container text-label-md px-4 py-3 rounded-card text-right">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-right">
          <div className="space-y-1">
            <label className="text-label-md text-on-surface-variant">البريد الإلكتروني (Username)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="salman.partner@salman-law.sa"
              className="w-full bg-surface-container-lowest border border-outline-variant px-4 py-2.5 rounded-soft text-body-md text-on-surface placeholder-outline text-left font-body"
              dir="ltr"
            />
          </div>

          <div className="space-y-1">
            <label className="text-label-md text-on-surface-variant">كلمة المرور (Password)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-surface-container-lowest border border-outline-variant px-4 py-2.5 rounded-soft text-body-md text-on-surface placeholder-outline text-left font-body"
              dir="ltr"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 rounded-soft text-label-md flex items-center justify-center gap-2 shadow-level-1"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
            ) : (
              "دخول النظام الفوري"
            )}
          </button>
        </form>

        {/* Quick Login Section for the 3 Law Firms */}
        <div className="border-t border-outline-variant pt-4 space-y-3">
          <p className="text-label-md font-semibold text-primary text-center">
            ⚡ الدخول السريع لأحد المكاتب المعتمدة (Quick Demo Login):
          </p>

          <div className="grid grid-cols-1 gap-2">
            {SEEDED_FIRMS.map((firm) => {
              const mainLawyer = firm.lawyers[0];
              return (
                <button
                  key={firm.id}
                  onClick={() => {
                    setEmail(mainLawyer.email);
                    setPassword("password123");
                    performSessionLogin(mainLawyer.email, mainLawyer.name, firm.name);
                  }}
                  className="w-full p-3 rounded-card card-interactive flex items-center justify-between text-right group"
                >
                  <div>
                    <div className="text-label-md font-semibold text-on-surface group-hover:text-primary transition">
                      {firm.name} ({firm.city})
                    </div>
                    <div className="text-label-sm text-on-surface-variant font-body">
                      المحامي: {mainLawyer.name}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-primary rotate-180 opacity-0 group-hover:opacity-100 transition" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
