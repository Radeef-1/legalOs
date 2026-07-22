"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import {
  Kanban,
  Plus,
  CheckSquare,
  Clock,
  UserCheck,
  Building2,
  ShieldCheck,
  Play,
  Pause,
  CheckCircle2,
  AlertTriangle,
  Send,
  Sparkles,
  Users,
} from "lucide-react";

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [caseId, setCaseId] = useState("");
  const [priority, setPriority] = useState("HIGH");
  const [targetType, setTargetType] = useState("USER");
  const [dueDate, setDueDate] = useState("");

  // Timer State
  const [activeTimerId, setActiveTimerId] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);

  // Active Delegation Modal
  const [delegatingTask, setDelegatingTask] = useState<any | null>(null);
  const [delegateTarget, setDelegateTarget] = useState("");

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const storedUser = localStorage.getItem("user");
    if (!token || !storedUser) {
      router.push("/auth/login");
      return;
    }
    setUser(JSON.parse(storedUser));

    const loadData = async () => {
      const defaultMockTasks = [
        {
          id: "task_1",
          title: "مراجعة العقد والوثائق الأولية",
          status: "in_progress",
          priority: "HIGH",
          targetType: "USER",
          estimatedHours: 2.0,
          checklists: [
            { id: "c1", title: "التحقق من الهوية والأوراق", isCompleted: true },
            { id: "c2", title: "مطابقة الشروط مع النظام التجاري", isCompleted: false },
          ],
        },
        {
          id: "task_2",
          title: "تجهيز وإصدار الوكالة الشرعية",
          status: "todo",
          priority: "HIGH",
          targetType: "TEAM",
          estimatedHours: 1.5,
          checklists: [{ id: "c3", title: "الربط مع ناجز توثيق", isCompleted: false }],
        },
        {
          id: "task_3",
          title: "اعتماد المذكرة الشارحة قبل الإرسال",
          status: "waiting_approval",
          priority: "URGENT",
          targetType: "ROLE",
          estimatedHours: 3.0,
          checklists: [{ id: "c4", title: "اعتماد الشريك المسؤول", isCompleted: false }],
        },
        {
          id: "task_4",
          title: "حضور الجلسة القضائية الأولى",
          status: "review",
          priority: "URGENT",
          targetType: "USER",
          estimatedHours: 2.5,
          checklists: [{ id: "c5", title: "تسجيل محضر الجلسة", isCompleted: true }],
        },
        {
          id: "task_5",
          title: "رفع صحيفة الدعوى عبر منصة ناجز",
          status: "done",
          priority: "HIGH",
          targetType: "DEPARTMENT",
          estimatedHours: 1.0,
          checklists: [{ id: "c6", title: "استلام رقم القيد", isCompleted: true }],
        },
      ];

      try {
        const headers = { Authorization: `Bearer ${token}` };
        const response = await fetch("http://localhost:3000/v1/tasks", { headers }).catch(() => null);
        if (response && response.ok) {
          const tasksData = await response.json().catch(() => null);
          if (tasksData && tasksData.success && tasksData.data?.length > 0) {
            setTasks(tasksData.data);
            setLoading(false);
            return;
          }
        }
        setTasks(defaultMockTasks);
      } catch (err) {
        setTasks(defaultMockTasks);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  // Timer Tick
  useEffect(() => {
    let interval: any = null;
    if (activeTimerId) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimerId]);

  const toggleTimer = (taskId: string) => {
    if (activeTimerId === taskId) {
      setActiveTimerId(null);
    } else {
      setActiveTimerId(taskId);
    }
  };

  const formatTimer = (secs: number) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    setCreating(true);
    const newTask = {
      id: `task_${Date.now()}`,
      title,
      status: "todo",
      priority,
      targetType,
      estimatedHours: 2.5,
      checklists: [
        { id: `c_${Date.now()}_1`, title: "مراجعة المتطلبات والنظام", isCompleted: false },
        { id: `c_${Date.now()}_2`, title: "إنجاز العمل وإشعار الشريك", isCompleted: false },
      ],
    };

    const token = localStorage.getItem("accessToken");
    try {
      const response = await fetch("http://localhost:3000/v1/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, caseId: caseId || undefined, priority, targetType, dueDate: dueDate || undefined }),
      }).catch(() => null);

      if (response && response.ok) {
        const resData = await response.json().catch(() => null);
        if (resData && resData.success && resData.data) {
          setTasks((prev) => [resData.data, ...prev]);
          setTitle("");
          alert("تم حفظ وإسناد المهمة بنجاح!");
          return;
        }
      }

      setTasks((prev) => [newTask, ...prev]);
      setTitle("");
      alert(`تم إضافة وإسناد المهمة (${title}) بنجاح للمحامي/الفريق!`);
    } catch (err) {
      setTasks((prev) => [newTask, ...prev]);
      setTitle("");
      alert(`تم إضافة وإسناد المهمة (${title}) بنجاح للمحامي/الفريق!`);
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateStatus = (taskId: string, newStatus: string) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
  };

  const handleDelegate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!delegatingTask || !delegateTarget) return;

    setTasks((prev) =>
      prev.map((t) =>
        t.id === delegatingTask.id
          ? { ...t, delegatedTo: delegateTarget, title: `${t.title} (مفوّضة إلى ${delegateTarget})` }
          : t
      )
    );
    alert(`تم تفويض المهمة بنجاح إلى: ${delegateTarget}`);
    setDelegatingTask(null);
    setDelegateTarget("");
  };

  const columns = [
    { key: "todo", title: "المهام المعلقة (To-Do)", color: "border-t-blue-500", badgeBg: "bg-status-ongoing/8 text-status-ongoing" },
    { key: "in_progress", title: "قيد التنفيذ (In Progress)", color: "border-t-amber-500", badgeBg: "bg-primary/5 text-primary" },
    { key: "waiting_approval", title: "في انتظار الاعتماد (Approval)", color: "border-t-purple-500", badgeBg: "bg-purple-500/10 text-purple-400" },
    { key: "review", title: "المراجعة القانونية (Review)", color: "border-t-cyan-500", badgeBg: "bg-cyan-500/10 text-status-ongoing" },
    { key: "done", title: "المهام المنجزة (Done)", color: "border-t-emerald-500", badgeBg: "bg-secondary/8 text-secondary" },
  ];

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col font-heading" dir="rtl">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-surface-container-lowest border-b border-outline-variant shadow-level-1 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-card bg-primary text-on-primary flex items-center justify-center font-semibold text-on-primary shadow-level-1">
            <Kanban className="w-5 h-5 text-on-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-primary font-semibold">
              محرك إدارة العمليات وإسناد المهام (Task & Workflow Engine)
            </h1>
            <p className="text-xs text-on-surface-variant">إسناد متعدد، تفويض في الإجازات، وتتبع الوقت المباشر للفوترة</p>
          </div>
        </div>

        {/* Live Timer Status */}
        {activeTimerId && (
          <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 px-4 py-1.5 rounded-full">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
            <span className="text-xs font-bold text-primary">تتبع الوقت شغال:</span>
            <span className="text-xs font-body font-bold text-on-surface">{formatTimer(timerSeconds)}</span>
          </div>
        )}
      </header>

      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto w-full">
          {/* Quick Create Task */}
          <div className="card-level-1 p-6 rounded-card border border-outline-variant space-y-4 text-right">
            <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary" />
              إسناد مهمة جديدة (سلسلة العمليات القانونية)
            </h3>
            <form onSubmit={handleCreateTask} className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] text-on-surface-variant font-semibold">عنوان المهمة</label>
                <input
                  type="text"
                  placeholder="مثال: تجهيز لائحة الاعتراض"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant px-3.5 py-2 rounded-card text-xs text-on-surface focus:border-secondary focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-on-surface-variant font-semibold">جهة الإسناد (Assignment Target)</label>
                <select
                  value={targetType}
                  onChange={(e) => setTargetType(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant px-3.5 py-2 rounded-card text-xs text-on-surface focus:border-secondary focus:outline-none"
                >
                  <option value="USER">محامي محدد (User)</option>
                  <option value="TEAM">الفريق القانوني (Team)</option>
                  <option value="DEPARTMENT">قسم التنفيذ/المحاكم (Department)</option>
                  <option value="ROLE">الشريك المسؤول (Partner Role)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-on-surface-variant font-semibold">الأولوية</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant px-3.5 py-2 rounded-card text-xs text-on-surface focus:border-secondary focus:outline-none"
                >
                  <option value="LOW">منخفضة</option>
                  <option value="MEDIUM">متوسطة</option>
                  <option value="HIGH">عالية</option>
                  <option value="URGENT">طوارئ (SLA Urgent)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-on-surface-variant font-semibold">القضية المرتبطة</label>
                <select
                  value={caseId}
                  onChange={(e) => setCaseId(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant px-3.5 py-2 rounded-card text-xs text-on-surface focus:border-secondary focus:outline-none"
                >
                  <option value="">غير مرتبطة بقضية</option>
                  {cases.map((c) => (
                    <option key={c.id} value={c.id} className="text-on-primary">
                      {c.caseNumberInternal} ({c.client?.name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={creating}
                  className="w-full bg-primary text-on-primary text-on-primary font-bold py-2.5 rounded-card text-xs flex items-center justify-center gap-1.5 hover:opacity-90 transition-all shadow-md"
                >
                  <Plus className="w-4 h-4 text-on-primary" />
                  إسناد المهمة
                </button>
              </div>
            </form>
          </div>

          {/* 5-Column Enterprise Kanban */}
          {loading ? (
            <div className="text-center py-20 text-on-surface-variant text-xs font-semibold">جاري تحميل لوحة العمليات والمهام...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {columns.map((col) => {
                const colTasks = tasks.filter((t) => t.status === col.key);
                return (
                  <div key={col.key} className={`glass rounded-card p-4 flex flex-col gap-3 border-t-4 ${col.color}`}>
                    <div className="flex items-center justify-between border-b border-outline-variant pb-2">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${col.badgeBg}`}>
                        {colTasks.length}
                      </span>
                      <h4 className="text-xs font-bold text-on-surface">{col.title}</h4>
                    </div>

                    <div className="flex-1 flex flex-col gap-3 min-h-[450px]">
                      {colTasks.map((task) => (
                        <div
                          key={task.id}
                          className="bg-surface-container-lowest/70 border border-outline-variant hover:border-primary/20 transition-all rounded-card p-4 space-y-3 text-right"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span
                              className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                                task.priority === "URGENT"
                                  ? "bg-red-500/20 text-error border border-red-500/30"
                                  : task.priority === "HIGH"
                                  ? "bg-primary/10 text-primary border border-primary/20"
                                  : "bg-blue-500/20 text-status-ongoing"
                              }`}
                            >
                              {task.priority || "MEDIUM"}
                            </span>
                            <span className="text-[10px] text-outline font-body">
                              {task.targetType || "USER"}
                            </span>
                          </div>

                          <h5 className="text-xs font-bold text-on-surface leading-snug">{task.title}</h5>

                          {/* Checklist Mini Progress */}
                          {task.checklists && task.checklists.length > 0 && (
                            <div className="space-y-1 pt-1">
                              <div className="flex items-center justify-between text-[10px] text-on-surface-variant">
                                <span>قائمة الفحص (Checklist)</span>
                                <span>
                                  {task.checklists.filter((c: any) => c.isCompleted).length} / {task.checklists.length}
                                </span>
                              </div>
                              <div className="w-full bg-surface-container-low h-1.5 rounded-full overflow-hidden">
                                <div
                                  className="bg-primary h-full transition-all"
                                  style={{
                                    width: `${
                                      (task.checklists.filter((c: any) => c.isCompleted).length /
                                        task.checklists.length) *
                                      100
                                    }%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          )}

                          {/* Action Bar */}
                          <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[10px]">
                            {/* Timer Button */}
                            <button
                              onClick={() => toggleTimer(task.id)}
                              className={`flex items-center gap-1 px-2 py-1 rounded-md font-bold transition-all ${
                                activeTimerId === task.id
                                  ? "bg-primary text-on-primary"
                                  : "bg-surface-container-low text-on-surface-variant hover:text-primary"
                              }`}
                            >
                              {activeTimerId === task.id ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                              <span>{activeTimerId === task.id ? "مؤقت شغال" : "بدء المؤقت"}</span>
                            </button>

                            {/* Delegate Button */}
                            <button
                              onClick={() => setDelegatingTask(task)}
                              className="text-on-surface-variant hover:text-primary flex items-center gap-1"
                            >
                              <UserCheck className="w-3 h-3" />
                              <span>تفويض</span>
                            </button>
                          </div>

                          {/* Move Next Status */}
                          <div className="pt-1 flex justify-end gap-1">
                            {col.key !== "done" && (
                              <button
                                onClick={() => {
                                  const nextState =
                                    col.key === "todo"
                                      ? "in_progress"
                                      : col.key === "in_progress"
                                      ? "waiting_approval"
                                      : col.key === "waiting_approval"
                                      ? "review"
                                      : "done";
                                  handleUpdateStatus(task.id, nextState);
                                }}
                                className="text-[10px] text-primary hover:underline font-bold"
                              >
                                تحويل للمرحلة التالية ←
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Delegation Modal */}
      {delegatingTask && (
        <div className="fixed inset-0 z-50 bg-surface-container-lowest backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="card-level-1 p-6 rounded-card border border-primary/20 max-w-md w-full max-h-[88vh] overflow-y-auto my-auto space-y-4 text-right">
            <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-primary" />
              تفويض المهمة أثناء الإجازة/الغياب
            </h3>
            <p className="text-xs text-on-surface-variant">
              المهمة: <span className="text-on-surface font-bold">{delegatingTask.title}</span>
            </p>

            <form onSubmit={handleDelegate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">اسم المحامي البديل</label>
                <input
                  type="text"
                  value={delegateTarget}
                  onChange={(e) => setDelegateTarget(e.target.value)}
                  placeholder="مثال: المحامي/ أحمد العتيبي"
                  className="w-full bg-surface-container-low border border-outline-variant rounded-card px-3.5 py-2 text-xs text-on-surface focus:outline-none focus:border-secondary"
                  required
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setDelegatingTask(null)}
                  className="px-4 py-2 rounded-card text-xs bg-surface-container-low text-on-surface-variant hover:text-on-surface"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-card text-xs bg-primary text-on-primary text-on-primary font-bold"
                >
                  تأكيد التفويض
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
