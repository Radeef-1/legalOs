"use client";

import React, { useState } from "react";
import { Check, ChevronRight, ChevronLeft, Briefcase, FileText, UserCheck, Sparkles } from "lucide-react";

interface Step {
  title: string;
  description: string;
  fields: { name: string; label: string; type: string; placeholder?: string; options?: string[] }[];
}

interface AdaptiveFormWizardProps {
  title: string;
  steps: Step[];
  onSubmit: (formData: Record<string, any>) => void;
}

export function AdaptiveFormWizard({ title, steps, onSubmit }: AdaptiveFormWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onSubmit(formData);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const activeStep = steps[currentStep];

  return (
    <div className="w-full max-w-lg bg-slate-900 text-white rounded-3xl border border-slate-800 p-5 shadow-2xl animate-in zoom-in-95 duration-200">
      <div className="border-b border-slate-800 pb-3 mb-4">
        <h3 className="font-bold text-base text-white flex items-center justify-between">
          <span>{title}</span>
          <span className="text-xs font-mono bg-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded-full border border-indigo-500/30">
            الخطوة {currentStep + 1} من {steps.length}
          </span>
        </h3>
      </div>

      {/* Stepper Progress Bar */}
      <div className="flex items-center gap-1.5 mb-6">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className={`h-2 flex-1 rounded-full transition-all duration-300 ${
              idx <= currentStep ? "bg-indigo-500 shadow-md shadow-indigo-500/50" : "bg-slate-800"
            }`}
          />
        ))}
      </div>

      {/* Step Header */}
      <div className="mb-4">
        <h4 className="font-bold text-sm text-indigo-300">{activeStep.title}</h4>
        <p className="text-xs text-slate-400 mt-0.5">{activeStep.description}</p>
      </div>

      {/* Step Inputs */}
      <div className="space-y-4 my-4">
        {activeStep.fields.map((field) => (
          <div key={field.name} className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300">{field.label}</label>
            {field.type === "select" ? (
              <select
                value={formData[field.name] || ""}
                onChange={(e) => handleInputChange(field.name, e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="">اختر {field.label}...</option>
                {field.options?.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : field.type === "textarea" ? (
              <textarea
                value={formData[field.name] || ""}
                onChange={(e) => handleInputChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            ) : (
              <input
                type={field.type}
                value={formData[field.name] || ""}
                onChange={(e) => handleInputChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Navigation Controls */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <button
          onClick={handlePrev}
          disabled={currentStep === 0}
          className="text-xs text-slate-400 hover:text-white disabled:opacity-30 px-3 py-2 rounded-lg flex items-center gap-1"
        >
          <ChevronRight className="w-4 h-4" />
          السابق
        </button>

        <button
          onClick={handleNext}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-6 py-2.5 rounded-xl flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
        >
          {currentStep === steps.length - 1 ? (
            <>
              حفظ البيانات وحفظ القضية 🪄
              <Check className="w-4 h-4" />
            </>
          ) : (
            <>
              التالي
              <ChevronLeft className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
