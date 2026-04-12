"use client";

import { useState } from "react";
import { Clock, Inbox, MoreHorizontal } from "@/lib/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Task, EnergyBlock } from "@/lib/types";

interface Props {
  tasks: Task[];
  onAssign: (taskId: string, block: EnergyBlock) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onDropToInbox: (taskId: string) => void;
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

const TASK_DRAG_TYPE = "text/personal-os-task";

export function InboxPanel({ tasks, onAssign, onEdit, onDelete, onDropToInbox }: Props) {
  const [isOver, setIsOver] = useState(false);

  function readDraggedTaskId(event: React.DragEvent<HTMLDivElement>) {
    return event.dataTransfer.getData(TASK_DRAG_TYPE);
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const taskId = readDraggedTaskId(event);
    setIsOver(false);
    if (!taskId) return;
    onDropToInbox(taskId);
  }

  if (tasks.length === 0) {
    return (
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsOver(true);
        }}
        onDragLeave={() => setIsOver(false)}
        onDrop={handleDrop}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-10 text-center transition-colors",
          isOver
            ? "border-blue-500/40 bg-blue-500/10"
            : "border-white/10"
        )}
      >
        <Inbox size={24} className="text-white/20" />
        <p className="text-sm text-white/30">In Arrivo vuota — ottimo lavoro.</p>
        <p className="text-xs text-white/20">Trascina qui un task per rimetterlo in inbox.</p>
      </div>
    );
  }

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        setIsOver(true);
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={handleDrop}
      className={cn(
        "space-y-2 rounded-2xl border border-transparent p-2 transition-colors",
        isOver && "border-blue-500/30 bg-blue-500/5"
      )}
    >
      {tasks.map((task) => (
        <div
          key={task.id}
          draggable
          onDragStart={(event) => {
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData(TASK_DRAG_TYPE, task.id);
          }}
          className="group rounded-xl border border-white/8 bg-white/3 p-3 transition-colors hover:bg-white/5"
        >
          {/* Title row */}
          <div className="mb-2 flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-white/90 leading-snug">{task.title}</p>
            <div className="flex items-start gap-2">
              <span
                className={cn(
                  "flex-shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-medium",
                  CATEGORY_COLORS[task.category]
                )}
              >
                {task.category}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex min-h-[28px] min-w-[28px] items-center justify-center rounded p-1 text-white/20 opacity-100 transition-colors hover:bg-white/10 hover:text-white/70 md:opacity-0 md:group-hover:opacity-100">
                    <MoreHorizontal size={13} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(task)}>Modifica</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(task.id)}
                    className="text-red-400 focus:text-red-400"
                  >
                    Elimina
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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
      <p className="px-1 pt-1 text-[11px] text-white/20">
        Trascina un task sui blocchi energia per pianificarlo.
      </p>
    </div>
  );
}
