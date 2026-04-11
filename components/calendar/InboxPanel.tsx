"use client";

import { Zap, Clock, ChevronRight, Inbox } from "@/lib/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Task, EnergyBlock } from "@/lib/types";

interface Props {
  tasks: Task[];
  onAssign: (taskId: string, block: EnergyBlock) => void;
}

const CATEGORY_COLORS: Record<Task["category"], string> = {
  Work: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Study: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  Admin: "bg-slate-500/20 text-slate-300 border-slate-500/30",
};

const BLOCKS: { block: EnergyBlock; label: string; color: string }[] = [
  { block: "Peak", label: "Peak", color: "text-amber-400 hover:bg-amber-500/15 border-amber-500/30" },
  { block: "Trough", label: "Trough", color: "text-sky-400 hover:bg-sky-500/15 border-sky-500/30" },
  { block: "Rebound", label: "Rebound", color: "text-violet-400 hover:bg-violet-500/15 border-violet-500/30" },
];

function EnergyDots({ level }: { level: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            i < level ? "bg-amber-400" : "bg-white/10"
          )}
        />
      ))}
    </span>
  );
}

export function InboxPanel({ tasks, onAssign }: Props) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 py-10 text-center">
        <Inbox size={24} className="text-white/20" />
        <p className="text-sm text-white/30">In Arrivo vuota — ottimo lavoro.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="rounded-xl border border-white/8 bg-white/3 p-3 transition-colors hover:bg-white/5"
        >
          {/* Title row */}
          <div className="mb-2 flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-white/90 leading-snug">{task.title}</p>
            <span
              className={cn(
                "flex-shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-medium",
                CATEGORY_COLORS[task.category]
              )}
            >
              {task.category}
            </span>
          </div>

          {/* Meta row */}
          <div className="mb-3 flex items-center gap-3">
            <EnergyDots level={task.energy_required} />
            <span className="flex items-center gap-1 text-xs text-white/30">
              <Clock size={10} />
              {task.duration_mins}m
            </span>
          </div>

          {/* Assign buttons */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-white/25 mr-0.5">Assegna →</span>
            {BLOCKS.map(({ block, label, color }) => (
              <button
                key={block}
                onClick={() => onAssign(task.id, block)}
                className={cn(
                  "rounded-md border px-2 py-0.5 text-[10px] font-medium transition-colors",
                  color
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
