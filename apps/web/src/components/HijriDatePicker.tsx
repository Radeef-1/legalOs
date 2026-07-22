"use client";

import React, { useState } from "react";
import { Calendar as CalendarIcon, Clock } from "lucide-react";

interface HijriDatePickerProps {
  value?: Date;
  onChange?: (date: Date) => void;
  label?: string;
}

export function HijriDatePicker({ value = new Date(), onChange, label = "التاريخ النظامي" }: HijriDatePickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(value);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      const d = new Date(e.target.value);
      setSelectedDate(d);
      if (onChange) onChange(d);
    }
  };

  const gregFormatted = selectedDate.toLocaleDateString("ar-SA-u-ca-gregory", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const hijriFormatted = selectedDate.toLocaleDateString("ar-SA-u-ca-islamic-umalqura", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex flex-col gap-1.5 font-heading" dir="rtl">
      {label && <label className="text-label-md text-on-surface-variant">{label}</label>}
      <div className="card-level-1 p-3 rounded-card flex items-center gap-3">
        <CalendarIcon className="w-5 h-5 text-primary shrink-0" />
        <input
          type="date"
          value={selectedDate.toISOString().split("T")[0]}
          onChange={handleDateChange}
          className="bg-surface-container-low border border-outline-variant rounded-soft px-2.5 py-1 text-body-md text-on-surface"
        />
        <div className="flex flex-col text-on-surface border-r border-outline-variant pr-3 mr-auto">
          <span className="text-label-md font-semibold text-primary">{hijriFormatted}</span>
          <span className="text-label-sm text-on-surface-variant">{gregFormatted}</span>
        </div>
      </div>
    </div>
  );
}
