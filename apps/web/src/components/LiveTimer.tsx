"use client";

import React, { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Save, Clock, DollarSign } from "lucide-react";

interface LiveTimerProps {
  hourlyRate?: number;
  caseId?: string;
  onSaveTimeEntry?: (hours: number, totalAmount: number, description: string) => void;
}

export function LiveTimer({ hourlyRate = 500, caseId, onSaveTimeEntry }: LiveTimerProps) {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [description, setDescription] = useState("");

  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setSeconds(0);
  };

  const hours = (seconds / 3600).toFixed(2);
  const totalAmount = (parseFloat(hours) * hourlyRate).toFixed(2);

  const formatDisplayTime = () => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSave = () => {
    if (onSaveTimeEntry && seconds > 0) {
      onSaveTimeEntry(parseFloat(hours), parseFloat(totalAmount), description || "دراسة وصياغة مذكرة قانونية");
      resetTimer();
      setDescription("");
    }
  };

  return (
    <div className="card-level-1 p-4 rounded-card flex flex-col gap-3 font-heading" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          <h3 className="text-label-md font-semibold text-on-surface">عداد الساعات القانونية الحية (Live Stopwatch)</h3>
        </div>
        <span className="badge-ongoing font-tabular">
          سعر الساعة: {hourlyRate} ر.س
        </span>
      </div>

      <div className="flex items-center justify-between bg-surface-container-low p-3 rounded-card border border-outline-variant">
        <div className="font-tabular text-2xl font-bold text-primary tracking-wider">
          {formatDisplayTime()}
        </div>
        <div className="flex flex-col text-left font-tabular">
          <span className="text-label-sm text-on-surface-variant">الساعات: {hours} ساعة</span>
          <span className="text-label-md font-semibold text-secondary">{totalAmount} ر.س</span>
        </div>
      </div>

      <input
        type="text"
        placeholder="وصف النشاط القانوني (مثل: كتابة مذكرة جوابية / الاجتماع بالعميل)..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full bg-surface-container-lowest border border-outline-variant rounded-soft px-3 py-2 text-body-md text-on-surface placeholder-on-surface-variant/50"
      />

      <div className="flex items-center gap-2">
        <button
          onClick={toggleTimer}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-soft font-semibold text-label-md transition ${
            isActive
              ? "bg-status-warning/10 text-status-warning border border-status-warning/30 hover:bg-status-warning/20"
              : "btn-primary"
          }`}
        >
          {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isActive ? "إيقاف مؤقت" : "بدء العداد"}
        </button>

        <button
          onClick={resetTimer}
          className="p-2 rounded-soft bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant transition"
          title="إعادة ضبط"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={handleSave}
          disabled={seconds === 0}
          className="flex items-center gap-1.5 py-2 px-4 rounded-soft bg-secondary hover:bg-secondary/90 disabled:opacity-50 font-semibold text-label-md text-on-secondary transition shadow-level-1"
        >
          <Save className="w-4 h-4" />
          حفظ الوقت
        </button>
      </div>
    </div>
  );
}
