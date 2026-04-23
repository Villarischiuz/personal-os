"use client";

import { useState } from "react";
import Link from "next/link";
import { X, Dumbbell, Brain, BookOpen, TrendingUp, Moon, ChevronRight, Play, Pause, RotateCcw } from "@/lib/icons";
import { useKanbanStore, usePomodoroStore } from "@/lib/stores/workStore";
import { usePhysicalStore } from "@/lib/stores/physicalStore";
import { useStudyStore } from "@/lib/stores/studyStore";
import { useBiometricStore } from "@/lib/stores/biometricStore";
import { useTargetStore, daysUntilTarget } from "@/lib/stores/targetStore";
import { cn } from "@/lib/utils";
import type { ContextualPriority } from "@/lib/hooks/useContextualPriority";
import { getFocusTask } from "@/lib/computations";

// JS getDay(): 0=Sun,1=Mon,2=Tue,3=Wed,4=Thu,5=Fri,6=Sat
const GYM_DAY_TO_ROUTINE_IDX: Record<number, number> = { 1: 0, 3: 1, 5: 2 };

function fmt(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

interface Props {
  priority: ContextualPriority;
}

export function SmartContextCard({ priority }: Props) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="rounded-xl border border-white/12 bg-white/4 overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/8">
        <div>
          <p className="text-xs uppercase tracking-widest text-white/35 font-semibold">Priorità ora</p>
          <p className="text-sm font-bold text-white mt-0.5">{priority.title}</p>
          <p className="text-[10px] text-white/40">{priority.subtitle}</p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="p-2 text-white/25 hover:text-white/60 transition-colors flex-shrink-0"
          aria-label="Chiudi"
        >
          <X size={14} />
        </button>
      </div>
      <div className="p-4">
        <WidgetContent widget={priority.widget} />
      </div>
    </div>
  );
}

function WidgetContent({ widget }: { widget: ContextualPriority["widget"] }) {
  switch (widget) {
    case "workout":     return <WorkoutWidget />;
    case "study-deep":  return <StudyDeepWidget />;
    case "lead-gen":    return <LeadGenWidget />;
    case "review":      return <ReviewWidget />;
    case "rest":        return <RestWidget />;
    default:            return <DashboardWidget />;
  }
}

// ─── Workout ──────────────────────────────────────────────────
function WorkoutWidget() {
  const weeklyRoutine = usePhysicalStore((s) => s.weeklyRoutine);
  const dow = new Date().getDay();
  const idx = GYM_DAY_TO_ROUTINE_IDX[dow] ?? 0;
  const day = weeklyRoutine[idx];

  if (!day) return <p className="text-xs text-white/40">Nessuna scheda per oggi.</p>;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Dumbbell size={14} className={cn("text-orange-400")} />
        <span className="text-xs font-semibold text-orange-300">{day.day} · {day.focus}</span>
      </div>
      <div className="space-y-1.5">
        {day.exercises.slice(0, 5).map((ex) => (
          <div key={ex.id} className="flex items-center justify-between gap-2 rounded-lg bg-white/4 px-3 py-2">
            <span className="text-xs text-white/80 truncate">{ex.name}</span>
            <span className="flex-shrink-0 text-[10px] text-white/40 font-mono">
              {ex.prescription}{ex.weightNum ? ` · ${ex.weightNum}${ex.weightUnit}` : ""}
            </span>
          </div>
        ))}
        {day.exercises.length > 5 && (
          <p className="text-[10px] text-white/30 pl-1">+{day.exercises.length - 5} altri esercizi</p>
        )}
      </div>
      <Link
        href="/physical"
        className="flex items-center justify-between w-full rounded-lg border border-orange-500/25 bg-orange-500/10 px-3 py-2 text-xs text-orange-300 hover:bg-orange-500/20 transition-colors"
      >
        <span>Apri scheda completa</span>
        <ChevronRight size={12} />
      </Link>
    </div>
  );
}

// ─── Study / Deep Work ────────────────────────────────────────
function StudyDeepWidget() {
  const { secs, running, isBreak, completed, toggle, reset } = usePomodoroStore();
  const tasks = useKanbanStore((s) => s.tasks);
  const focusTask = getFocusTask(tasks, "Peak");

  const QUICK_LINKS = [
    { label: "Polito Portale", href: "https://didattica.polito.it/", color: "text-blue-300 border-blue-500/25 bg-blue-500/10 hover:bg-blue-500/20" },
    { label: "BBC 6 Min English", href: "https://www.bbc.co.uk/learningenglish/english/features/6-minute-english", color: "text-green-300 border-green-500/25 bg-green-500/10 hover:bg-green-500/20" },
    { label: "DataFramed Podcast", href: "https://www.datacamp.com/podcast", color: "text-violet-300 border-violet-500/25 bg-violet-500/10 hover:bg-violet-500/20" },
  ];

  return (
    <div className="space-y-3">
      {/* Pomodoro */}
      <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/4 px-3 py-2.5">
        <Brain size={14} className="text-blue-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-white/35">{isBreak ? "Pausa" : "Focus"} · {completed} completati</p>
          <p className="text-lg font-mono font-bold text-white leading-none mt-0.5">{fmt(secs)}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => toggle()}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 hover:bg-blue-500 transition-colors"
          >
            {running ? <Pause size={12} className="text-white" /> : <Play size={12} className="text-white" />}
          </button>
          <button
            onClick={() => reset()}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 hover:bg-white/8 transition-colors"
          >
            <RotateCcw size={11} className="text-white/40" />
          </button>
        </div>
      </div>

      {/* Focus task */}
      {focusTask && (
        <div className="rounded-lg bg-white/4 px-3 py-2">
          <p className="text-[10px] text-white/30 uppercase tracking-wider">Task attivo</p>
          <p className="text-xs font-semibold text-white mt-0.5 truncate">{focusTask.title}</p>
        </div>
      )}

      {/* Quick links */}
      <div className="flex flex-wrap gap-1.5">
        {QUICK_LINKS.map(({ label, href, color }) => (
          <a
            key={href}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn("rounded-lg border px-2.5 py-1.5 text-[10px] font-semibold transition-colors", color)}
          >
            {label}
          </a>
        ))}
        <Link
          href="/study"
          className="rounded-lg border border-white/10 bg-white/4 px-2.5 py-1.5 text-[10px] text-white/50 hover:bg-white/8 transition-colors"
        >
          Vai a Studio →
        </Link>
      </div>
    </div>
  );
}

// ─── Lead Gen ─────────────────────────────────────────────────
function LeadGenWidget() {
  const tasks = useKanbanStore((s) => s.tasks);
  const workTasks = tasks.filter(
    (t) => t.category === "Work" && (t.status === "InProgress" || t.status === "Todo")
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp size={14} className="text-amber-400" />
        <span className="text-xs text-amber-300 font-semibold">Task Lavoro attivi</span>
        <span className="ml-auto text-[10px] font-mono text-white/40">{workTasks.length}</span>
      </div>
      {workTasks.length === 0 ? (
        <p className="text-xs text-white/30">Nessun task di lavoro. Ottimo momento per catturarne uno.</p>
      ) : (
        workTasks.slice(0, 4).map((t) => (
          <div key={t.id} className="flex items-center justify-between gap-2 rounded-lg bg-white/4 px-3 py-2">
            <span className="text-xs text-white/80 truncate">{t.title}</span>
            <span className={cn(
              "flex-shrink-0 text-[9px] font-bold rounded px-1.5 py-0.5",
              t.status === "InProgress"
                ? "bg-blue-500/20 text-blue-300"
                : "bg-amber-500/15 text-amber-300"
            )}>
              {t.status === "InProgress" ? "In Corso" : "Da Fare"}
            </span>
          </div>
        ))
      )}
      <Link
        href="/work"
        className="flex items-center justify-between w-full rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-xs text-amber-300 hover:bg-amber-500/20 transition-colors mt-1"
      >
        <span>Vai a Lavoro</span>
        <ChevronRight size={12} />
      </Link>
    </div>
  );
}

// ─── Review ───────────────────────────────────────────────────
function ReviewWidget() {
  const getDueCards = useStudyStore((s) => s.getDueCards);
  const ieltsExamAt = useTargetStore((s) => s.ielts_exam_at);
  const dueCount = getDueCards().length;
  const daysToExam = daysUntilTarget(ieltsExamAt);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-2">
        <BookOpen size={14} className="text-violet-400" />
        <span className="text-xs text-violet-300 font-semibold">Ripasso serale</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-violet-500/20 bg-violet-500/10 px-3 py-2.5 text-center">
          <p className="text-xl font-black text-violet-300">{dueCount}</p>
          <p className="text-[10px] text-violet-300/60 mt-0.5">flashcard da ripassare</p>
        </div>
        <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-2.5 text-center">
          <p className="text-xl font-black text-blue-300">{daysToExam}</p>
          <p className="text-[10px] text-blue-300/60 mt-0.5">giorni all&apos;esame IELTS</p>
        </div>
      </div>

      <Link
        href="/study"
        className="flex items-center justify-between w-full rounded-lg border border-violet-500/25 bg-violet-500/10 px-3 py-2 text-xs text-violet-300 hover:bg-violet-500/20 transition-colors"
      >
        <span>Apri Studio &amp; Flashcard</span>
        <ChevronRight size={12} />
      </Link>
    </div>
  );
}

// ─── Rest / Recovery ──────────────────────────────────────────
function RestWidget() {
  const { todayMacros } = useBiometricStore();
  const proteinGap = Math.max(0, todayMacros.protein_g_target - todayMacros.protein_g_actual);
  const calPct = Math.min(100, Math.round((todayMacros.calories_actual / todayMacros.calories_target) * 100));

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-2">
        <Moon size={14} className="text-green-400" />
        <span className="text-xs text-green-300 font-semibold">Recovery &amp; Nutrizione</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-white/4 px-3 py-2.5">
          <p className="text-[10px] text-white/35">Calorie</p>
          <p className="text-sm font-bold text-white mt-0.5">{todayMacros.calories_actual} <span className="text-[10px] text-white/35">/ {todayMacros.calories_target}</span></p>
          <div className="mt-1.5 h-1 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full rounded-full bg-green-500" style={{ width: `${calPct}%` }} />
          </div>
        </div>
        <div className="rounded-lg bg-white/4 px-3 py-2.5">
          <p className="text-[10px] text-white/35">Proteine mancanti</p>
          <p className={cn("text-sm font-bold mt-0.5", proteinGap === 0 ? "text-green-400" : "text-amber-300")}>
            {proteinGap === 0 ? "✓ OK" : `−${proteinGap}g`}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard fallback ───────────────────────────────────────
function DashboardWidget() {
  const tasks = useKanbanStore((s) => s.tasks);
  const focus = getFocusTask(tasks);

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-white/30">Task prioritario</p>
        <p className="text-sm font-semibold text-white truncate mt-0.5">
          {focus ? focus.title : "Nessun task attivo"}
        </p>
      </div>
      <Link
        href="/work"
        className="flex-shrink-0 rounded-lg border border-white/10 px-3 py-2 text-xs text-white/50 hover:bg-white/8 transition-colors"
      >
        Lavoro
      </Link>
    </div>
  );
}
