"use client";

import React, { useState } from "react";
import { Compass, X, ArrowLeft, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

export interface TourStep {
  stepIndex: number;
  title: string;
  description: string;
  targetElementSelector?: string;
}

interface ProductTourOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  tourTitle: string;
  steps: TourStep[];
}

export function ProductTourOverlay({ isOpen, onClose, tourTitle, steps }: ProductTourOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen || !steps || steps.length === 0) return null;

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onClose();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="bg-surface-container-lowest border border-outline-variant rounded-card p-6 max-w-md w-full space-y-4 shadow-level-2 gestalt-region animate-in fade-in zoom-in duration-200"
        dir="rtl"
      >
        <div className="flex items-center justify-between border-b border-outline-variant pb-3">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-secondary" />
            <h3 className="text-title-md font-bold text-primary">{tourTitle}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-surface-container-low rounded-soft text-on-surface-variant"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-secondary">
            <span>الخطوة {currentStep + 1} من {steps.length}</span>
            <span className="bg-secondary/10 px-2 py-0.5 rounded-pill">{step.title}</span>
          </div>
          <p className="text-body-md text-on-surface text-sm leading-relaxed font-body">
            {step.description}
          </p>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-outline-variant">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="btn-secondary text-xs flex items-center gap-1 disabled:opacity-40"
          >
            <ArrowRight className="w-4 h-4" />
            <span>السابق</span>
          </button>

          <div className="flex gap-1">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-pill transition-all ${
                  idx === currentStep ? "bg-secondary w-5" : "bg-outline-variant"
                }`}
              />
            ))}
          </div>

          <button onClick={handleNext} className="btn-primary text-xs flex items-center gap-1 shadow-level-1">
            <span>{isLastStep ? "إنهاء الجولة 🟢" : "التالي"}</span>
            {!isLastStep && <ArrowLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
