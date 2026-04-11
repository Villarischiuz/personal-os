"use client";

import { X, Clock, Sun, Sunset, Moon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { Task, EnergyBlock } from "@/lib/types";

interface BlockMeta {
  label: string;
  timeRange: string;
  subtitle: string;
  energyRange: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  accent: string;
  bg: string;
  border: string;
  headerBg: string;
  dot: string;
}

const BLOCK_META: Record<EnergyBlock, BlockMeta> = {
  Peak: {
    label: "Peak",
    timeRange: "6:00 – 12:00",
    subtitle: "Finestra deep work",
    energyRange: "Energy 4–5",
    icon: Sun,
    accent: "text-amber-400",
    bg: "bg-amber-500/5",
    border: "border-amber-500/20",
    headerBg: "bg-amber-500/10",
    dot: "bg-amber-400",
  },
  Trough: {
    label: "Trough",
    timeRange: "13:00 – 15:00",
    subtitle: "Admin & bassa energia",
    energyRange: "Energy 1–2",
    icon: Sunset,
    accent: "text-sky-400",
    bg: "bg-sky-500/5",
    border: "border-sky-500/20",
    headerBg: "bg-sky-500/10",
    dot: "bg-sky-400",
  },
  Rebound: {
    label: "Rebound",
    timeRange: "17:00 – 21:00",
    subtitle: "Studio & revisione",
    energyRange: "Energy 3",
    icon: Moon,
    accent: "text-violet-400",
    bg: "bg-violet-500/5",
    border: "border-violet-500/20",
    headerBg: "bg-violet-500/10",
    dot: "bg-violet-400",
  },
};

const CATEGORY_BADGE: Record<Task["category"], string> = {
  Work: "bg-blue-500/20 text-blue-300",
  Study: "bg-emerald-500/20 text-emerald-300",
  Admin: "bg-slate-500/20 text-slate-300",
};

interface Props {
  block: EnergyBlock;
  tasks: Task[];
  onRemove: (taskId: string) => void;
}

export function EnergyBlockPanel({ block, tasks, onRemove }: Props) {
  const meta = BLOCK_META[block];
  const Icon = meta.icon;

  return (
    <div className={cn("flex flex-col rounded-xl border", meta.bg, meta.border)}>
      {/* Header */}
      <div className={cn("flex items-start justify-between rounded-t-xl px-4 py-3", meta.headerBg)}>
        <div className="flex items-center gap-2.5">
          <Icon size={16} className={meta.accent} />
          <div>
            <p className={cn("text-sm font-semibold", meta.accent)}>{meta.label}</p>
            <p className="text-[10px] text-white/35">{meta.timeRange} · {meta.energyRange}</p>
          </div>
        </div>
        <span className="text-[10px] text-white/25 mt-0.5">{meta.subtitle}</span>
      </div>

      {/* Task list */}
      <div className="flex-1 space-y-1.5 p-3 min-h-[120px]">
        {tasks.length === 0 ? (
          <div className="flex h-full items-center justify-center py-6">
            <p className="text-xs text-white/20">Nessun task assegnato</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="group flex items-start justify-between gap-2 rounded-lg border border-white/6 bg-white/4 px-3 py-2 transition-colors hover:bg-white/7"
            >
              <div className="flex items-start gap-2 min-w-0">
                <span className={cn("mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full", meta.dot)} />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-white/85 leading-snug truncate">{task.title}</p>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <span className={cn("rounded px-1 py-0 text-[9px] font-medium", CATEGORY_BADGE[task.category])}>
                      {task.category}
                    </span>
                    <span className="flex items-center gap-0.5 text-[9px] text-white/25">
                      <Clock size={8} />
                      {task.duration_mins}m
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => onRemove(task.id)}
                className="mt-0.5 flex-shrink-0 rounded p-0.5 text-white/20 opacity-0 transition-all hover:bg-white/10 hover:text-white/60 group-hover:opacity-100"
                title="Remove from block"
              >
                <X size={12} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer count */}
      <div className="border-t border-white/6 px-4 py-2">
        <p className="text-[10px] text-white/25">
          {tasks.length} attività ·{" "}
          {tasks.reduce((sum, t) => sum + t.duration_mins, 0)}m totali
        </p>
      </div>
    </div>
  );
}
