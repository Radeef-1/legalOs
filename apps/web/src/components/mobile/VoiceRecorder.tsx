"use client";

import React, { useState, useEffect } from "react";
import { Mic, Square, Check, X, RefreshCw, FileText } from "lucide-react";

interface VoiceRecorderProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (transcription: string) => void;
}

export function VoiceRecorder({ isOpen, onClose, onSave }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [transcript, setTranscript] = useState("");

  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => setTimerSeconds((prev) => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  if (!isOpen) return null;

  const startRecording = () => {
    setIsRecording(true);
    setTimerSeconds(0);
    setTranscript("جاري استماع الملاحظة الصوتية وتحويلها إلى نص نظامي...");
  };

  const stopRecording = () => {
    setIsRecording(false);
    setTranscript(
      "تم الاتفاق مع الموكل على تقديم طلب إحالة الدعوى إلى الدائرة الأولى بدلاً من الثانية وإرفاق ملاحق العقد.",
    );
  };

  const handleSave = () => {
    if (onSave && transcript) {
      onSave(transcript);
      onClose();
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-slate-900 text-white border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col items-center animate-in zoom-in-95 duration-200">
        <div className="w-full flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <Mic className="w-4 h-4 text-rose-400" />
            مسجل الملاحظات الصوتية (Speech-to-Text)
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Audio Visualizer & Wave simulation */}
        <div className="relative my-4 flex items-center justify-center">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${
              isRecording
                ? "bg-rose-600 animate-pulse border-4 border-rose-400"
                : "bg-indigo-600 hover:bg-indigo-500 border-4 border-indigo-400/50"
            }`}
          >
            {isRecording ? <Square className="w-8 h-8 text-white fill-white" /> : <Mic className="w-10 h-10 text-white" />}
          </button>
        </div>

        {/* Timer */}
        <div className="text-2xl font-mono font-bold text-slate-200 mb-2">
          {formatTime(timerSeconds)}
        </div>
        <p className="text-xs text-slate-400 mb-4">
          {isRecording ? "اضغط على الزر لإيقاف التسجيل" : "اضغط على الميكروفون لبدء التسجيل الصوتية"}
        </p>

        {/* Transcription Output */}
        {transcript && (
          <div className="w-full p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed my-2">
            <span className="font-bold text-indigo-400 block mb-1">النص المستخرج الذكي:</span>
            {transcript}
          </div>
        )}

        {/* Action Controls */}
        <div className="w-full flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-800">
          <button onClick={onClose} className="text-xs text-slate-400 px-3 py-2 rounded-lg">
            إلغاء
          </button>
          <button
            onClick={handleSave}
            disabled={!transcript}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-lg shadow-indigo-600/30"
          >
            <Check className="w-4 h-4" />
            حفظ بالملاحظات 📝
          </button>
        </div>
      </div>
    </div>
  );
}
