"use client";

import { useState, useEffect, useRef } from "react";
import { MOCK_TASKS, MOCK_DAILY_LOGS } from "@/lib/mock-data";
import {
  getTasksByStatus,
  buildWeeklyReview,
} from "@/lib/computations";
import type { Task } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Timer, Play, Pause, RotateCcw, SkipForward,
  ClipboardList, Loader2, CheckCircle,
  BarChart3, Moon, Zap, Brain, Target,
} from "@/lib/icons";

// ─── Kanban ───────────────────────────────────────────────────
const STATUS_META = {
  Inbox:      { label: "In Arrivo",   color: "text-white/50",  bg: "bg-white/5",         border: "border-white/10"  },
  Todo:       { label: "Da Fare",     color: "text-blue-400",  bg: "bg-blue-500/10",     border: "border-blue-500/20" },
  InProgress: { label: "In Corso",    color: "text-amber-400", bg: "bg-amber-500/10",    border: "border-amber-500/20" },
  Done:       { label: "Completati",  color: "text-green-400", bg: "bg-green-500/10",    border: "border-green-500/20" },
} as const;

const CYCLE: Task["status"][] = ["Todo", "InProgress", "Done", "Inbox"];

const CATEGORY_BADGE: Record<Task["category"], string> = {
  Work:  "bg-blue-500/20 text-blue-300",
  Study: "bg-emerald-500/20 text-emerald-300",
  Admin: "bg-slate-500/20 text-slate-300",
};

function KanbanCard({ task, onAdvance }: { task: Task; onAdvance: () => void }) {
  return (
    <div
      onClick={onAdvance}
      className="group cursor-pointer rounded-lg border border-white/8 bg-white/4 p-3 transition-all hover:bg-white/7 hover:border-white/15"
    >
      <p className="text-xs font-medium text-white/85 leading-snug mb-2">{task.title}</p>
      <div className="flex items-center gap-1.5">
        <span className={cn("rounded px-1.5 py-0.5 text-[9px] font-medium", CATEGORY_BADGE[task.category])}>
          {task.category}
        </span>
        <span className="text-[9px] text-white/25">{task.duration_mins}m</span>
        <span className="ml-auto text-[9px] text-white/20 opacity-0 group-hover:opacity-100 transition-opacity">
          avanza →
        </span>
      </div>
    </div>
  );
}

// ─── Pomodoro Timer ───────────────────────────────────────────
const WORK_SECS = 25 * 60;
const BREAK_SECS = 5 * 60;

function PomodoroTimer() {
  const [secs, setSecs] = useState(WORK_SECS);
  const [running, setRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [completed, setCompleted] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecs((s) => {
          if (s <= 1) {
            if (!isBreak) setCompleted((c) => c + 1);
            setIsBreak((b) => !b);
            return isBreak ? WORK_SECS : BREAK_SECS;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, isBreak]);

  function reset() {
    setRunning(false);
    setIsBreak(false);
    setSecs(WORK_SECS);
  }

  function skip() {
    setRunning(false);
    if (!isBreak) setCompleted((c) => c + 1);
    setIsBreak((b) => !b);
    setSecs(isBreak ? WORK_SECS : BREAK_SECS);
  }

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
        <span className={cn("text-xs font-semibold", isBreak ? "text-green-400" : "text-blue-400")}>
          {isBreak ? "Pausa ☕" : "Lavoro 🎯"}
        </span>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-5">
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
              onClick={() => setRunning((r) => !r)}
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

// ─── Page ─────────────────────────────────────────────────────
const COLUMNS: Task["status"][] = ["Inbox", "Todo", "InProgress", "Done"];

export default function WorkPage() {
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const review = buildWeeklyReview(MOCK_DAILY_LOGS);

  function advanceTask(id: string) {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const idx = CYCLE.indexOf(t.status as typeof CYCLE[number]);
        const next = CYCLE[(idx + 1) % CYCLE.length];
        return { ...t, status: next };
      })
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-white">Piano Lavoro</h1>
        <p className="mt-1 text-sm text-white/40">Kanban · Pomodoro · Revisione settimanale</p>
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
                    <KanbanCard key={t.id} task={t} onAdvance={() => advanceTask(t.id)} />
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
                { icon: Moon,   label: "Sonno medio",        value: `${review.avg_sleep}h` },
                { icon: Zap,    label: "Pomodori totali",    value: String(review.total_pomodoros) },
                { icon: Brain,  label: "Task completati",    value: String(review.total_tasks_completed) },
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
  );
}
