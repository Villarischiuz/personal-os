"use client";

import { useEffect, useRef, useState } from "react";
import { MOCK_DAILY_LOGS } from "@/lib/mock-data";
import { buildWeeklyReview } from "@/lib/computations";
import { useKanbanStore } from "@/lib/stores/workStore";
import { usePomodoroStore } from "@/lib/stores/workStore";
import { CrudSheet, type CrudContext } from "@/components/global/CrudSheet";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import type { Task } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Timer, Play, Pause, RotateCcw, SkipForward,
  ClipboardList, Loader2, CheckCircle,
  BarChart3, Moon, Zap, Brain, Target, Maximize2, Minimize2, Plus, MoreHorizontal,
} from "@/lib/icons";

// ─── Kanban ───────────────────────────────────────────────────
const STATUS_META = {
  Inbox:      { label: "In Arrivo",   color: "text-white/50",  bg: "bg-white/5",         border: "border-white/10"  },
  Todo:       { label: "Da Fare",     color: "text-blue-400",  bg: "bg-blue-500/10",     border: "border-blue-500/20" },
  InProgress: { label: "In Corso",    color: "text-amber-400", bg: "bg-amber-500/10",    border: "border-amber-500/20" },
  Done:       { label: "Completati",  color: "text-green-400", bg: "bg-green-500/10",    border: "border-green-500/20" },
} as const;

const CATEGORY_BADGE: Record<Task["category"], string> = {
  Work:  "bg-blue-500/20 text-blue-300",
  Study: "bg-emerald-500/20 text-emerald-300",
  Admin: "bg-slate-500/20 text-slate-300",
};

function KanbanCard({ task, onAdvance, onSelect, onEdit, onDelete, isActive }: {
  task: Task;
  onAdvance: () => void;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isActive: boolean;
}) {
  return (
    <div
      className={cn(
        "group rounded-lg border p-3 transition-all",
        isActive
          ? "border-blue-500/50 bg-blue-500/10"
          : "border-white/8 bg-white/4 hover:bg-white/7 hover:border-white/15"
      )}
    >
      <div className="flex items-start gap-1 mb-2">
        <p onClick={onAdvance} className="flex-1 cursor-pointer text-xs font-medium text-white/85 leading-snug">
          {task.title}
        </p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex-shrink-0 rounded p-1 text-white/20 hover:bg-white/10 hover:text-white/60 transition-colors opacity-0 group-hover:opacity-100 min-h-[28px] min-w-[28px] flex items-center justify-center">
              <MoreHorizontal size={13} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onSelect}>{isActive ? "✓ Rimuovi dal timer" : "▶ Imposta nel timer"}</DropdownMenuItem>
            <DropdownMenuItem onClick={onAdvance}>→ Avanza stato</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onEdit}>✏️ Modifica</DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-red-400 focus:text-red-400">🗑 Elimina</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex items-center gap-1.5">
        <span className={cn("rounded px-1.5 py-0.5 text-[9px] font-medium", CATEGORY_BADGE[task.category])}>
          {task.category}
        </span>
        <span className="text-[9px] text-white/25">{task.duration_mins}m</span>
        {isActive && <span className="ml-auto text-[9px] text-blue-400">▶ attivo</span>}
      </div>
    </div>
  );
}

// ─── Pomodoro Timer ───────────────────────────────────────────
const WORK_SECS = 25 * 60;
const BREAK_SECS = 5 * 60;

function PomodoroTimer() {
  const { secs, running, isBreak, completed, activeTask, zenMode, tick, toggle, reset, skip, setZen } =
    usePomodoroStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Only drive the tick from here when NOT in zen mode (zen overlay has its own interval)
  useEffect(() => {
    if (running && !zenMode) {
      intervalRef.current = setInterval(tick, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, zenMode, tick]);

  const total = isBreak ? BREAK_SECS : WORK_SECS;
  const progress = ((total - secs) / total) * 100;
  const mins = Math.floor(secs / 60);
  const ss = String(secs % 60).padStart(2, "0");
  const circumference = 2 * Math.PI * 54;
  const strokeDash = circumference - (progress / 100) * circumference;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Timer Pomodoro</CardTitle>
        <div className="flex items-center gap-2">
          <span className={cn("text-xs font-semibold", isBreak ? "text-green-400" : "text-blue-400")}>
            {isBreak ? "Pausa ☕" : "Lavoro 🎯"}
          </span>
          {running && (
            <button
              onClick={() => setZen(true)}
              className="ml-auto rounded-lg border border-white/10 p-1.5 text-white/30 hover:text-white/60 transition-colors"
              title="Modalità focus"
            >
              <Maximize2 size={13} />
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-5">
          {activeTask && (
            <p className="text-xs text-white/40 text-center max-w-[180px] truncate">
              📌 {activeTask}
            </p>
          )}
          {/* Circular progress */}
          <div className="relative flex items-center justify-center">
            <svg width="128" height="128" className="-rotate-90">
              <circle cx="64" cy="64" r="54" stroke="rgba(255,255,255,0.06)" strokeWidth="8" fill="none" />
              <circle
                cx="64" cy="64" r="54"
                stroke={isBreak ? "#22c55e" : "#3b82f6"}
                strokeWidth="8"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDash}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute text-center">
              <p className="font-mono text-2xl font-bold text-white">{mins}:{ss}</p>
              <p className="text-[10px] text-white/30">{completed} completati</p>
            </div>
          </div>
          {/* Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={reset}
              className="rounded-lg border border-white/10 p-2 text-white/40 hover:bg-white/8 hover:text-white/70 transition-colors"
            >
              <RotateCcw size={16} />
            </button>
            <button
              onClick={toggle}
              className={cn(
                "rounded-xl px-6 py-2.5 font-medium text-sm transition-colors",
                running
                  ? "bg-white/10 text-white hover:bg-white/15"
                  : "bg-blue-600 text-white hover:bg-blue-500"
              )}
            >
              {running ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button
              onClick={skip}
              className="rounded-lg border border-white/10 p-2 text-white/40 hover:bg-white/8 hover:text-white/70 transition-colors"
            >
              <SkipForward size={16} />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Deep Focus Overlay ───────────────────────────────────────
function DeepFocusOverlay() {
  const { secs, running, isBreak, completed, activeTask, zenMode, tick, toggle, reset, setZen } =
    usePomodoroStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!zenMode) return;
    if (running) {
      intervalRef.current = setInterval(tick, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, zenMode, tick]);

  if (!zenMode) return null;

  const total = isBreak ? BREAK_SECS : WORK_SECS;
  const progress = ((total - secs) / total) * 100;
  const mins = Math.floor(secs / 60);
  const ss = String(secs % 60).padStart(2, "0");
  const circumference = 2 * Math.PI * 100;
  const strokeDash = circumference - (progress / 100) * circumference;

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[hsl(222,47%,4%)]">
      {/* Exit button */}
      <button
        onClick={() => setZen(false)}
        className="absolute top-5 right-5 rounded-xl border border-white/10 p-3 text-white/30 hover:text-white/60 transition-colors"
      >
        <Minimize2 size={18} />
      </button>

      {/* Mode badge */}
      <span className={cn(
        "mb-8 rounded-full border px-4 py-1 text-xs font-semibold uppercase tracking-widest",
        isBreak
          ? "border-green-500/30 text-green-400 bg-green-500/10"
          : "border-blue-500/30 text-blue-400 bg-blue-500/10"
      )}>
        {isBreak ? "☕ Pausa" : "🎯 Focus"}
      </span>

      {/* Big circular timer */}
      <div className="relative flex items-center justify-center mb-10">
        <svg width="260" height="260" className="-rotate-90">
          <circle cx="130" cy="130" r="100" stroke="rgba(255,255,255,0.05)" strokeWidth="10" fill="none" />
          <circle
            cx="130" cy="130" r="100"
            stroke={isBreak ? "#22c55e" : "#3b82f6"}
            strokeWidth="10"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDash}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute text-center">
          <p className="font-mono text-6xl font-black text-white tracking-tight">{mins}:{ss}</p>
          <p className="text-sm text-white/25 mt-1">{completed} pomodori</p>
        </div>
      </div>

      {/* Active task */}
      {activeTask && (
        <p className="mb-10 text-base text-white/50 text-center max-w-xs px-4">📌 {activeTask}</p>
      )}

      {/* Controls */}
      <div className="flex items-center gap-6">
        <button
          onClick={reset}
          className="rounded-2xl border border-white/10 p-4 text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors"
        >
          <RotateCcw size={22} />
        </button>
        <button
          onClick={toggle}
          className={cn(
            "rounded-2xl px-10 py-5 font-bold text-lg transition-all active:scale-95",
            running
              ? "bg-white/10 text-white hover:bg-white/15 border border-white/10"
              : "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/40"
          )}
        >
          {running ? <Pause size={28} /> : <Play size={28} />}
        </button>
        <button
          onClick={() => setZen(false)}
          className="rounded-2xl border border-white/10 p-4 text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors"
        >
          <Minimize2 size={22} />
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────
const COLUMNS: Task["status"][] = ["Inbox", "Todo", "InProgress", "Done"];

export default function WorkPage() {
  const { tasks, advanceTask, deleteTask } = useKanbanStore();
  const { activeTask, setActiveTask } = usePomodoroStore();
  const review = buildWeeklyReview(MOCK_DAILY_LOGS);
  const [sheet, setSheet] = useState<{ open: boolean; ctx: CrudContext | null }>({ open: false, ctx: null });

  return (
    <>
      <DeepFocusOverlay />

      <div className="space-y-8">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">Piano Lavoro</h1>
            <p className="mt-1 text-sm text-white/40">Kanban · Pomodoro · Revisione settimanale</p>
          </div>
          <button
            onClick={() => setSheet({ open: true, ctx: { type: "task" } })}
            className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-xs font-semibold text-white/70 hover:bg-white/8 hover:text-white transition-colors min-h-[44px]"
          >
            <Plus size={13} /> Nuovo task
          </button>
        </div>

        {/* Kanban */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {COLUMNS.map((status) => {
            const meta = STATUS_META[status];
            const col = tasks.filter((t) => t.status === status);
            const Icon = status === "Inbox" ? ClipboardList : status === "InProgress" ? Loader2 : status === "Done" ? CheckCircle : Target;
            return (
              <div key={status} className={cn("rounded-xl border p-3", meta.bg, meta.border)}>
                <div className="mb-3 flex items-center gap-2">
                  <Icon size={13} className={meta.color} />
                  <span className={cn("text-xs font-semibold uppercase tracking-wide", meta.color)}>
                    {meta.label}
                  </span>
                  <span className="ml-auto flex h-4 w-4 items-center justify-center rounded-full bg-white/10 text-[9px] text-white/40">
                    {col.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {col.length === 0 ? (
                    <p className="py-3 text-center text-[10px] text-white/20">Vuoto</p>
                  ) : (
                    col.map((t) => (
                      <KanbanCard
                        key={t.id}
                        task={t}
                        onAdvance={() => advanceTask(t.id)}
                        onSelect={() => setActiveTask(activeTask === t.title ? "" : t.title)}
                        onEdit={() => setSheet({ open: true, ctx: { type: "task", item: t } })}
                        onDelete={() => deleteTask(t.id)}
                        isActive={activeTask === t.title}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Pomodoro */}
          <PomodoroTimer />

          {/* Weekly Review */}
          <Card>
            <CardHeader>
              <CardTitle>Revisione Settimanale</CardTitle>
              <span className="text-xs text-white/30">Ultimi 7 giorni</span>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center gap-3 rounded-xl border border-white/8 bg-white/3 px-4 py-3">
                <BarChart3 size={20} className="text-blue-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-white/40">Punteggio aderenza</p>
                  <p className="text-2xl font-black text-white">{review.adherence_score}<span className="text-sm text-white/30">/100</span></p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: Moon,   label: "Sonno medio",          value: `${review.avg_sleep}h` },
                  { icon: Zap,    label: "Pomodori totali",      value: String(review.total_pomodoros) },
                  { icon: Brain,  label: "Task completati",      value: String(review.total_tasks_completed) },
                  { icon: Target, label: "Sessioni allenamento", value: String(review.training_sessions) },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="rounded-lg border border-white/6 bg-white/3 px-3 py-2.5">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon size={11} className="text-white/30" />
                      <p className="text-[10px] text-white/35">{label}</p>
                    </div>
                    <p className="font-mono text-base font-bold text-white">{value}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[10px] text-white/25">
                Macro centrate {review.macros_hit_days}/7 giorni · RPE medio {review.avg_training_rpe}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <CrudSheet
        open={sheet.open}
        context={sheet.ctx}
        onClose={() => setSheet({ open: false, ctx: null })}
      />
    </>
  );
}
