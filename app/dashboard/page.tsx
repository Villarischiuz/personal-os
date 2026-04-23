"use client";

import { useMemo, useState } from "react";
import { SystemTrafficLight } from "@/components/dashboard/SystemTrafficLight";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { StreakCounter } from "@/components/dashboard/StreakCounter";
import { DailySnapshot } from "@/components/dashboard/DailySnapshot";
import { UpdateMetricsSheet } from "@/components/dashboard/UpdateMetricsSheet";
import { ExamCountdown } from "@/components/dashboard/ExamCountdown";
import { DailyIntegrityCheck } from "@/components/dashboard/DailyIntegrityCheck";
import { ConsistencyHeatmap } from "@/components/dashboard/ConsistencyHeatmap";
import { BlockProgressBar } from "@/components/dashboard/BlockProgressBar";
import { SmartContextCard } from "@/components/dashboard/SmartContextCard";
import { useContextualPriority } from "@/lib/hooks/useContextualPriority";
import { useBiometricStore } from "@/lib/stores/biometricStore";
import { MOCK_DAILY_LOGS } from "@/lib/mock-data";
import { useKanbanStore } from "@/lib/stores/workStore";
import { useStudyStore } from "@/lib/stores/studyStore";
import { useTargetStore, daysUntilTarget } from "@/lib/stores/targetStore";
import { CrudSheet, type CrudContext } from "@/components/global/CrudSheet";
import {
  buildPerformanceData,
  buildTaskMetrics,
  computeStreak,
  countCompletedTaskMinutes,
  getBacklogTasks,
  getDoneTasks,
  getFocusTask,
  getThisWeekTasks,
  getTodayTasks,
} from "@/lib/computations";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, CheckCircle, Clock, Edit3, Target } from "@/lib/icons";
import { useCurrentBlock } from "@/lib/hooks/useCurrentBlock";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/types";

const FOCUS_STORAGE_KEY = "personal-os-focus-mode";

const AREA_STYLE: Record<Task["area"], string> = {
  IELTS: "border-blue-500/30 bg-blue-500/10 text-blue-300",
  DSE: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  Projects: "border-violet-500/30 bg-violet-500/10 text-violet-300",
  Websites: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  Admin: "border-white/15 bg-white/5 text-white/55",
};

const PRIORITY_STYLE: Record<Task["priority"], string> = {
  P0: "border-red-500/30 bg-red-500/10 text-red-300",
  P1: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  P2: "border-blue-500/30 bg-blue-500/10 text-blue-300",
  P3: "border-white/15 bg-white/5 text-white/55",
};

function TaskListSection({
  title,
  hint,
  icon: Icon,
  tone,
  items,
  emptyMessage,
  onOpen,
}: {
  title: string;
  hint: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  tone: string;
  items: Task[];
  emptyMessage: string;
  onOpen: (task: Task) => void;
}) {
  return (
    <Card>
      <CardHeader className="flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Icon size={15} className={tone} />
          <CardTitle>{title}</CardTitle>
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/45">
            {items.length}
          </span>
        </div>
        <span className="text-xs text-white/30">{hint}</span>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {items.length === 0 ? (
          <p className="rounded-xl border border-dashed border-white/10 px-4 py-5 text-sm text-white/30">
            {emptyMessage}
          </p>
        ) : (
          items.slice(0, 5).map((task) => (
            <button
              key={task.id}
              onClick={() => onOpen(task)}
              className="w-full rounded-xl border border-white/8 bg-black/10 px-3 py-3 text-left transition-colors hover:bg-black/20"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white/85">{task.title}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold", AREA_STYLE[task.area])}>
                      {task.area}
                    </span>
                    <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold", PRIORITY_STYLE[task.priority])}>
                      {task.priority}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/45">
                      {task.status}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/45">
                      {task.duration_mins}m
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-white/25">
                  {task.bucket === "ThisWeek" ? "This Week" : task.bucket}
                </span>
              </div>
            </button>
          ))
        )}
        {items.length > 5 && (
          <p className="text-[11px] text-white/30">+ {items.length - 5} altri task</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function CommandCenter() {
  const { todayLog, todayMacros } = useBiometricStore();
  const { tasks } = useKanbanStore();
  const topics = useStudyStore((state) => state.topics);
  const getDueCards = useStudyStore((state) => state.getDueCards);
  const ieltsExamAt = useTargetStore((state) => state.ielts_exam_at);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [taskSheet, setTaskSheet] = useState<{ open: boolean; ctx: CrudContext | null }>({
    open: false,
    ctx: null,
  });
  const [focusMode, setFocusMode] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(FOCUS_STORAGE_KEY) === "true";
  });

  function toggleFocusMode() {
    setFocusMode((value) => {
      const next = !value;
      localStorage.setItem(FOCUS_STORAGE_KEY, String(next));
      return next;
    });
  }

  const block = useCurrentBlock();
  const priority = useContextualPriority();
  const [peakBannerDismissed, setPeakBannerDismissed] = useState(false);

  const dashboardLogs = [
    ...MOCK_DAILY_LOGS.filter((log) => log.date !== todayLog.date),
    todayLog,
  ].sort((a, b) => a.date.localeCompare(b.date));

  const performanceData = buildPerformanceData(dashboardLogs);
  const streak = computeStreak(dashboardLogs);
  const todayTasks = getTodayTasks(tasks);
  const thisWeekTasks = getThisWeekTasks(tasks);
  const backlogTasks = getBacklogTasks(tasks);
  const doneTasks = getDoneTasks(tasks);
  const taskMetrics = buildTaskMetrics(tasks);
  const completedMinutesToday = countCompletedTaskMinutes(tasks);
  const proteinGap = Math.max(0, todayMacros.protein_g_target - todayMacros.protein_g_actual);
  const focusTask = getFocusTask(tasks, block.name);
  const dueCards = getDueCards();

  const roadmapProgress = useMemo(() => {
    const totalItems = topics.reduce((acc, topic) => acc + (topic.type === "video_list" && topic.items ? topic.items.length : 1), 0);
    const doneItems = topics.reduce((acc, topic) => {
      if (topic.type === "video_list" && topic.items) return acc + topic.itemsDone.length;
      return acc + (topic.done ? 1 : 0);
    }, 0);
    const pct = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;
    return { totalItems, doneItems, pct };
  }, [topics]);

  const ieltsDaysLeft = daysUntilTarget(ieltsExamAt);

  const hideBiometrics = focusMode && block.name === "Peak";
  const hideChart = focusMode && block.name === "Peak";

  return (
    <div className="w-full space-y-6">
      <SmartContextCard priority={priority} />

      <div className="md:hidden">
        <ConsistencyHeatmap />
      </div>

      <ExamCountdown />

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
            className="flex items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-xs font-semibold text-blue-400 transition-colors hover:bg-blue-500/20"
          >
            <Edit3 size={13} />
            Aggiorna metriche
          </button>
          <Badge variant="blue">workflow v2</Badge>
        </div>
      </div>

      <BlockProgressBar />

      {block.name === "Peak" && !focusMode && !peakBannerDismissed && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-blue-500/20 bg-blue-500/8 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-blue-300">Blocco Peak attivo</p>
            <p className="text-xs text-blue-300/60">Attiva Focus Mode per eliminare le distrazioni</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={toggleFocusMode}
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-blue-500"
            >
              Attiva
            </button>
            <button
              onClick={() => setPeakBannerDismissed(true)}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/40 transition-colors hover:bg-white/8"
            >
              Ignora
            </button>
          </div>
        </div>
      )}

      {focusMode && (
        <div className="rounded-xl border border-green-500/20 bg-green-500/8 px-4 py-3">
          <p className="text-sm font-semibold text-green-400">{block.label}</p>
          <p className="mt-0.5 text-xs text-green-400/60">{block.description}</p>
        </div>
      )}

      <DailyIntegrityCheck />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        {[
          {
            label: "Focus corrente",
            value: focusTask ? focusTask.title : "Nessuna priorità attiva",
            hint: focusTask
              ? `${focusTask.priority} · ${focusTask.area} · ${focusTask.duration_mins}m`
              : "scegli un task per oggi",
          },
          {
            label: "Task chiusi oggi",
            value: String(taskMetrics.today_completed),
            hint: completedMinutesToday > 0 ? `${completedMinutesToday} minuti conclusi` : "nessun completamento registrato",
          },
          {
            label: "Pianificato oggi",
            value: String(taskMetrics.today_planned),
            hint: `${taskMetrics.today_planned_minutes} minuti allocati`,
          },
          {
            label: "Proteine mancanti",
            value: `${proteinGap}g`,
            hint: proteinGap === 0 ? "target già centrato" : "per chiudere bene la giornata",
          },
        ].map(({ label, value, hint }) => (
          <div key={label} className="rounded-xl border border-white/8 bg-white/4 px-4 py-3">
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/30">{label}</p>
            <p className="mt-2 line-clamp-2 text-lg font-bold text-white">{value}</p>
            <p className="mt-1 text-xs text-white/30">{hint}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SystemTrafficLight todayLog={todayLog} />
        <StreakCounter streak={streak} />
        <div className="hidden md:block">
          <ConsistencyHeatmap />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader className="flex-wrap gap-2">
            <CardTitle>Carico per Area</CardTitle>
            <span className="text-xs text-white/30">
              breakdown reale sui task attivi e completati questa settimana
            </span>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {taskMetrics.area_rows.map((row) => (
              <div key={row.area} className="rounded-xl border border-white/8 bg-black/10 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold", AREA_STYLE[row.area])}>
                      {row.area}
                    </span>
                    <span className="text-xs text-white/35">{row.active_count} attivi</span>
                  </div>
                  <span className="text-xs text-white/35">{row.done_count} chiusi questa settimana</span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg border border-white/6 bg-white/3 px-2 py-2">
                    <p className="text-[10px] text-white/30">Today</p>
                    <p className="text-sm font-bold text-white">{row.today_count}</p>
                  </div>
                  <div className="rounded-lg border border-white/6 bg-white/3 px-2 py-2">
                    <p className="text-[10px] text-white/30">This Week</p>
                    <p className="text-sm font-bold text-white">{row.week_count}</p>
                  </div>
                  <div className="rounded-lg border border-white/6 bg-white/3 px-2 py-2">
                    <p className="text-[10px] text-white/30">Minuti attivi</p>
                    <p className="text-sm font-bold text-white">{row.total_minutes}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-wrap gap-2">
            <CardTitle>Segnali Studio</CardTitle>
            <span className="text-xs text-white/30">
              studyStore resta separato, ma la dashboard legge i progressi utili
            </span>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-xl border border-white/8 bg-black/10 px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/30">Roadmap DSE</p>
              <p className="mt-2 text-2xl font-black text-white">
                {roadmapProgress.doneItems}
                <span className="text-sm text-white/35">/{roadmapProgress.totalItems}</span>
              </p>
              <p className="mt-1 text-xs text-white/30">{roadmapProgress.pct}% completato</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/8 bg-black/10 px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/30">Flashcard due</p>
                <p className="mt-2 text-xl font-black text-white">{dueCards.length}</p>
              </div>
              <div className="rounded-xl border border-white/8 bg-black/10 px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/30">IELTS target</p>
                <p className="mt-2 text-xl font-black text-white">{ieltsDaysLeft}</p>
                <p className="text-[11px] text-white/30">giorni</p>
              </div>
            </div>
            <div className="rounded-xl border border-white/8 bg-black/10 px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/30">Settimana attiva</p>
              <p className="mt-2 text-sm font-semibold text-white">
                {taskMetrics.week_completed} task completati · {taskMetrics.week_planned_minutes} minuti pianificati
              </p>
              <p className="mt-1 text-xs text-white/30">
                backlog residuo: {taskMetrics.backlog_count} task
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <TaskListSection
          title="Today"
          hint="task esplicitamente scelti per oggi"
          icon={Target}
          tone="text-blue-300"
          items={todayTasks}
          emptyMessage="Nessun task nel bucket Today."
          onOpen={(task) => setTaskSheet({ open: true, ctx: { type: "task", item: task } })}
        />
        <TaskListSection
          title="This Week"
          hint="coda attiva della settimana corrente"
          icon={Clock}
          tone="text-amber-300"
          items={thisWeekTasks}
          emptyMessage="Nessun task in This Week."
          onOpen={(task) => setTaskSheet({ open: true, ctx: { type: "task", item: task } })}
        />
        <TaskListSection
          title="Backlog"
          hint="idee e task non ancora caricati nel ciclo attivo"
          icon={ClipboardList}
          tone="text-white/60"
          items={backlogTasks}
          emptyMessage="Backlog vuoto."
          onOpen={(task) => setTaskSheet({ open: true, ctx: { type: "task", item: task } })}
        />
        <TaskListSection
          title="Done"
          hint="storico task conclusi"
          icon={CheckCircle}
          tone="text-green-400"
          items={doneTasks}
          emptyMessage="Nessun task completato."
          onOpen={(task) => setTaskSheet({ open: true, ctx: { type: "task", item: task } })}
        />
      </div>

      {!hideChart && <PerformanceChart data={performanceData} />}
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
