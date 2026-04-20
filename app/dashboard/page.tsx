"use client";

import { useState, useEffect } from "react";
import { SystemTrafficLight } from "@/components/dashboard/SystemTrafficLight";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { StreakCounter } from "@/components/dashboard/StreakCounter";
import { DailySnapshot } from "@/components/dashboard/DailySnapshot";
import { UpdateMetricsSheet } from "@/components/dashboard/UpdateMetricsSheet";
import { ExamCountdown } from "@/components/dashboard/ExamCountdown";
import { DailyIntegrityCheck } from "@/components/dashboard/DailyIntegrityCheck";
import { ConsistencyHeatmap } from "@/components/dashboard/ConsistencyHeatmap";
import { useBiometricStore } from "@/lib/stores/biometricStore";
import { MOCK_DAILY_LOGS } from "@/lib/mock-data";
import { useKanbanStore } from "@/lib/stores/workStore";
import { CrudSheet, type CrudContext } from "@/components/global/CrudSheet";
import {
  buildPerformanceData,
  computeStreak,
  getTasksByStatus,
} from "@/lib/computations";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, CheckCircle, Clock, Loader2, Edit3 } from "@/lib/icons";
import { useCurrentBlock } from "@/lib/hooks/useCurrentBlock";
import { cn } from "@/lib/utils";

const FOCUS_STORAGE_KEY = "personal-os-focus-mode";

export default function CommandCenter() {
  const { todayLog, todayMacros } = useBiometricStore();
  const { tasks } = useKanbanStore();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [taskSheet, setTaskSheet] = useState<{ open: boolean; ctx: CrudContext | null }>({
    open: false,
    ctx: null,
  });
  const [focusMode, setFocusMode] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(FOCUS_STORAGE_KEY);
    if (stored !== null) setFocusMode(stored === "true");
  }, []);

  function toggleFocusMode() {
    setFocusMode((v) => {
      const next = !v;
      localStorage.setItem(FOCUS_STORAGE_KEY, String(next));
      return next;
    });
  }

  const block = useCurrentBlock();

  const dashboardLogs = [
    ...MOCK_DAILY_LOGS.filter((log) => log.date !== todayLog.date),
    todayLog,
  ].sort((a, b) => a.date.localeCompare(b.date));

  const performanceData = buildPerformanceData(dashboardLogs);
  const streak = computeStreak(dashboardLogs);

  const inboxTasks = getTasksByStatus(tasks, "Inbox");
  const todoTasks = getTasksByStatus(tasks, "Todo");
  const inProgressTasks = getTasksByStatus(tasks, "InProgress");
  const doneTasks = getTasksByStatus(tasks, "Done");
  const proteinGap = Math.max(0, todayMacros.protein_g_target - todayMacros.protein_g_actual);
  const focusTask = inProgressTasks[0] ?? todoTasks[0] ?? inboxTasks[0] ?? null;

  // In focus mode: Peak hides retrospective data; Off/Rebound shows everything
  const hideBiometrics = focusMode && block.name === "Peak";
  const hideChart = focusMode && block.name === "Peak";

  return (
    <div className="w-full space-y-6">
      {/* Heatmap — mobile first (above everything on small screens) */}
      <div className="md:hidden">
        <ConsistencyHeatmap />
      </div>

      {/* Exam countdown */}
      <ExamCountdown />

      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Centro Comando
          </h1>
          <p className="mt-1 text-sm text-white/40">
            {new Date().toLocaleDateString("it-IT", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-shrink-0 sm:justify-end">
          <button
            onClick={toggleFocusMode}
            className={cn(
              "flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors",
              focusMode
                ? "border-green-500/40 bg-green-500/15 text-green-400 hover:bg-green-500/25"
                : "border-white/15 bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60"
            )}
          >
            {focusMode ? "Focus ON" : "Focus OFF"}
            {focusMode && (
              <span className="text-[10px] font-normal text-green-400/70">({block.label})</span>
            )}
          </button>
          <button
            onClick={() => setSheetOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-xs font-semibold text-blue-400 hover:bg-blue-500/20 transition-colors"
          >
            <Edit3 size={13} />
            Aggiorna metriche
          </button>
          <Badge variant="blue">v1.0</Badge>
        </div>
      </div>

      {/* Focus mode banner */}
      {focusMode && (
        <div className="rounded-xl border border-green-500/20 bg-green-500/8 px-4 py-3">
          <p className="text-sm font-semibold text-green-400">{block.label}</p>
          <p className="mt-0.5 text-xs text-green-400/60">{block.description}</p>
        </div>
      )}

      {/* Daily Integrity Check */}
      <DailyIntegrityCheck />

      {/* Quick metrics */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {[
          {
            label: "Focus corrente",
            value: focusTask ? focusTask.title : "Nessuna priorità attiva",
            hint: focusTask ? `${focusTask.duration_mins} minuti · ${focusTask.category}` : "scegli un task in lavoro o calendario",
          },
          {
            label: "Proteine mancanti",
            value: `${proteinGap}g`,
            hint: proteinGap === 0 ? "target già centrato" : "per chiudere bene la giornata",
          },
          {
            label: "Task chiusi oggi",
            value: String(todayLog.tasks_completed),
            hint: todayLog.tasks_completed >= 5 ? "giornata in trazione" : "c'è spazio per un ultimo push",
          },
        ].map(({ label, value, hint }) => (
          <div key={label} className="rounded-xl border border-white/8 bg-white/4 px-4 py-3">
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/30">{label}</p>
            <p className="mt-2 line-clamp-2 text-lg font-bold text-white">{value}</p>
            <p className="mt-1 text-xs text-white/30">{hint}</p>
          </div>
        ))}
      </div>

      {/* Main grid — heatmap on desktop sits here alongside traffic light */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SystemTrafficLight todayLog={todayLog} />
        <StreakCounter streak={streak} />

        {/* Heatmap on desktop (replaces one of the cards, shown in 3rd slot) */}
        <div className="hidden md:block">
          <ConsistencyHeatmap />
        </div>
      </div>

      {/* Pipeline card — always visible, focus mode doesn't hide tasks */}
      <Card>
        <CardHeader className="flex-wrap gap-2">
          <CardTitle>Pipeline Attiva</CardTitle>
          <span className="text-xs text-white/30">
            {tasks.length} task totali · {todayLog.pomodoros_completed * 25} minuti focus oggi
          </span>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            {
              key: "inbox",
              label: "In Arrivo",
              icon: ClipboardList,
              tone: "text-white/60",
              border: "border-white/10 bg-white/5",
              items: inboxTasks,
            },
            {
              key: "todo",
              label: "Da Fare",
              icon: Clock,
              tone: "text-amber-300",
              border: "border-amber-500/20 bg-amber-500/10",
              items: todoTasks,
            },
            {
              key: "progress",
              label: "In Corso",
              icon: Loader2,
              tone: "text-blue-400",
              border: "border-blue-500/20 bg-blue-500/10",
              items: inProgressTasks,
            },
            {
              key: "done",
              label: "Completati",
              icon: CheckCircle,
              tone: "text-green-400",
              border: "border-green-500/20 bg-green-500/10",
              items: doneTasks,
            },
          ].map(({ key, label, icon: Icon, tone, border, items }) => (
            <div key={key} className={`rounded-xl border px-3 py-3 ${border}`}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className={`flex items-center gap-2 text-sm ${tone}`}>
                  <Icon size={15} />
                  {label}
                </div>
                <span className="font-mono text-xs font-bold text-white/80">{items.length}</span>
              </div>
              {items.length === 0 ? (
                <p className="text-xs text-white/30">Nessun task in questa colonna.</p>
              ) : (
                <div className="space-y-2">
                  {items.slice(0, 3).map((task) => (
                    <button
                      key={task.id}
                      onClick={() => setTaskSheet({ open: true, ctx: { type: "task", item: task } })}
                      className="flex w-full items-start justify-between gap-3 rounded-lg bg-black/10 px-3 py-2 text-left transition-colors hover:bg-black/20"
                    >
                      <span className="text-xs font-medium text-white/85">{task.title}</span>
                      <span className="flex-shrink-0 text-[10px] text-white/35">
                        {task.duration_mins}m
                      </span>
                    </button>
                  ))}
                  {items.length > 3 && (
                    <p className="text-[11px] text-white/35">+ {items.length - 3} altri task</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Performance chart — hidden in Peak focus mode */}
      {!hideChart && <PerformanceChart data={performanceData} />}

      {/* Daily snapshot — hidden in Peak focus mode */}
      {!hideBiometrics && <DailySnapshot log={todayLog} macros={todayMacros} />}

      <UpdateMetricsSheet
        key={`${sheetOpen ? "open" : "closed"}-${todayLog.date}-${todayLog.sleep_hours}-${todayLog.rhr}-${todayMacros.calories_actual}-${todayMacros.protein_g_actual}`}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
      />
      <CrudSheet
        open={taskSheet.open}
        context={taskSheet.ctx}
        onClose={() => setTaskSheet({ open: false, ctx: null })}
      />
    </div>
  );
}
