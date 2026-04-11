"use client";

import { useState } from "react";
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isToday as dfIsToday,
  addMonths, subMonths, addWeeks, subWeeks, isSameDay, parseISO,
} from "date-fns";
import { it } from "date-fns/locale";
import { useKanbanStore } from "@/lib/stores/workStore";
import { DailyScheduleCalendar } from "@/components/calendar/DailyScheduleCalendar";
import { CrudSheet, type CrudContext } from "@/components/global/CrudSheet";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import type { Task, WeeklyEvent } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Plus } from "@/lib/icons";

// ─── Helpers ──────────────────────────────────────────────────
type CalView = "month" | "week" | "day";

function isoStr(d: Date) { return format(d, "yyyy-MM-dd"); }

function jsToWeekDay(d: Date): 0|1|2|3|4|5|6 {
  return ((d.getDay() + 6) % 7) as 0|1|2|3|4|5|6;
}

const WEEK_COLS = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

const STATUS_DOT: Record<Task["status"], string> = {
  Inbox:      "bg-white/30",
  Todo:       "bg-blue-400",
  InProgress: "bg-amber-400",
  Done:       "bg-green-400",
};

const CATEGORY_COLOR: Record<Task["category"], string> = {
  Work:  "border-blue-500/40 bg-blue-500/10 text-blue-300",
  Study: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  Admin: "border-white/15 bg-white/5 text-white/50",
};

// ─── View Switcher ────────────────────────────────────────────
function ViewSwitcher({ view, onChange }: { view: CalView; onChange: (v: CalView) => void }) {
  return (
    <div className="flex rounded-xl border border-white/10 bg-white/5 p-1 gap-0.5">
      {(["month", "week", "day"] as CalView[]).map((v) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={cn(
            "flex-1 rounded-lg px-3 py-2 text-xs font-semibold capitalize transition-all min-h-[36px]",
            view === v
              ? "bg-white/10 text-white shadow-sm"
              : "text-white/40 hover:text-white/70"
          )}
        >
          {v === "month" ? "Mese" : v === "week" ? "Settimana" : "Giorno"}
        </button>
      ))}
    </div>
  );
}

// ─── Month View ───────────────────────────────────────────────
function MonthView({
  current,
  onNavigate,
  tasks,
  onDayClick,
  onAddClick,
}: {
  current: Date;
  onNavigate: (d: Date) => void;
  tasks: Task[];
  onDayClick: (d: Date) => void;
  onAddClick: (date: string) => void;
}) {
  const monthStart = startOfMonth(current);
  const monthEnd = endOfMonth(current);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const title = format(current, "MMMM yyyy", { locale: it });
  const capitalTitle = title.charAt(0).toUpperCase() + title.slice(1);

  return (
    <div className="rounded-xl border border-white/10 bg-white/3 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
        <button onClick={() => onNavigate(subMonths(current, 1))} className="rounded-lg p-2 text-white/30 hover:bg-white/8 hover:text-white/70 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center">
          <ChevronLeft size={16} />
        </button>
        <h3 className="text-sm font-semibold text-white">{capitalTitle}</h3>
        <button onClick={() => onNavigate(addMonths(current, 1))} className="rounded-lg p-2 text-white/30 hover:bg-white/8 hover:text-white/70 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 border-b border-white/5">
        {WEEK_COLS.map((d) => (
          <div key={d} className="py-2 text-center text-[10px] font-semibold text-white/25 uppercase tracking-wider">
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const iso = isoStr(day);
          const dayTasks = tasks.filter((t) => t.date === iso);
          const inMonth = isSameMonth(day, current);
          const isToday = dfIsToday(day);
          const dots = dayTasks.slice(0, 4);

          return (
            <button
              key={iso}
              onClick={() => inMonth ? onDayClick(day) : onAddClick(iso)}
              className={cn(
                "group relative min-h-[60px] p-1.5 border-b border-r border-white/5 text-left transition-colors last:border-r-0",
                inMonth ? "hover:bg-white/5 active:bg-white/8" : "opacity-30",
              )}
            >
              <span className={cn(
                "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
                isToday
                  ? "bg-blue-600 text-white"
                  : "text-white/70"
              )}>
                {format(day, "d")}
              </span>

              {/* Task dots */}
              {dots.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-[3px] px-0.5">
                  {dots.map((t) => (
                    <span key={t.id} className={cn("h-1.5 w-1.5 rounded-full flex-shrink-0", STATUS_DOT[t.status])} />
                  ))}
                  {dayTasks.length > 4 && (
                    <span className="text-[8px] text-white/30 leading-none self-center">+{dayTasks.length - 4}</span>
                  )}
                </div>
              )}

              {/* Add hint on hover */}
              {inMonth && (
                <Plus size={10} className="absolute bottom-1.5 right-1.5 text-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Week View ────────────────────────────────────────────────
function WeekView({
  current,
  onNavigate,
  tasks,
  onAddClick,
  onTaskEdit,
  onTaskDelete,
}: {
  current: Date;
  onNavigate: (d: Date) => void;
  tasks: Task[];
  onAddClick: (date: string) => void;
  onTaskEdit: (t: Task) => void;
  onTaskDelete: (id: string) => void;
}) {
  const weekStart = startOfWeek(current, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(current, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const rangeLabel =
    format(weekStart, "d MMM", { locale: it }) + " – " + format(weekEnd, "d MMM yyyy", { locale: it });

  return (
    <div className="rounded-xl border border-white/10 bg-white/3 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
        <button onClick={() => onNavigate(subWeeks(current, 1))} className="rounded-lg p-2 text-white/30 hover:bg-white/8 hover:text-white/70 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center">
          <ChevronLeft size={16} />
        </button>
        <h3 className="text-xs font-semibold text-white/70 capitalize">{rangeLabel}</h3>
        <button onClick={() => onNavigate(addWeeks(current, 1))} className="rounded-lg p-2 text-white/30 hover:bg-white/8 hover:text-white/70 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Columns */}
      <div className="grid grid-cols-7 divide-x divide-white/5 min-h-[220px]">
        {days.map((day) => {
          const iso = isoStr(day);
          const dayTasks = tasks.filter((t) => t.date === iso);
          const isToday = dfIsToday(day);

          return (
            <div key={iso} className="flex flex-col min-h-[200px]">
              {/* Col header */}
              <div className={cn(
                "border-b border-white/5 px-1.5 py-2 text-center sticky top-0",
                isToday && "bg-blue-600/10"
              )}>
                <p className="text-[9px] font-semibold text-white/30 uppercase">{WEEK_COLS[(day.getDay() + 6) % 7]}</p>
                <p className={cn("text-sm font-bold", isToday ? "text-blue-400" : "text-white/70")}>
                  {format(day, "d")}
                </p>
              </div>

              {/* Task cards */}
              <div className="flex-1 p-1 space-y-1">
                {dayTasks.map((t) => (
                  <WeekTaskCard key={t.id} task={t} onEdit={() => onTaskEdit(t)} onDelete={() => onTaskDelete(t.id)} />
                ))}
              </div>

              {/* Add empty column click */}
              <button
                onClick={() => onAddClick(iso)}
                className="flex w-full items-center justify-center gap-1 py-2 text-white/15 hover:text-white/40 hover:bg-white/4 transition-colors min-h-[36px]"
              >
                <Plus size={12} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WeekTaskCard({ task, onEdit, onDelete }: { task: Task; onEdit: () => void; onDelete: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={cn(
          "w-full rounded-md border px-1.5 py-1 text-left text-[10px] font-medium leading-tight transition-colors hover:brightness-110 min-h-[32px]",
          CATEGORY_COLOR[task.category]
        )}>
          <span className="line-clamp-2">{task.title}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={onEdit}>✏️ Modifica</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onDelete} className="text-red-400 focus:text-red-400">🗑 Elimina</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Main CalendarViews ───────────────────────────────────────
interface Props {
  weeklyEvents: WeeklyEvent[];
  selectedDow: 0|1|2|3|4|5|6;
  onDowChange: (d: 0|1|2|3|4|5|6) => void;
}

export function CalendarViews({ weeklyEvents, selectedDow, onDowChange }: Props) {
  const [view, setView] = useState<CalView>("month");
  const [current, setCurrent] = useState(new Date());
  const { tasks, deleteTask } = useKanbanStore();
  const [sheet, setSheet] = useState<{ open: boolean; ctx: CrudContext | null }>({ open: false, ctx: null });

  function openAdd(date?: string) {
    setSheet({
      open: true,
      ctx: { type: "task", defaultDate: date ?? isoStr(new Date()) },
    });
  }

  function openEdit(task: Task) {
    setSheet({ open: true, ctx: { type: "task", item: task } });
  }

  function handleDayClick(day: Date) {
    setCurrent(day);
    onDowChange(jsToWeekDay(day));
    setView("day");
  }

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <ViewSwitcher view={view} onChange={setView} />
        <button
          onClick={() => openAdd()}
          className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/70 hover:bg-white/8 hover:text-white transition-colors min-h-[40px]"
        >
          <Plus size={13} /> Nuovo task
        </button>
      </div>

      {view === "month" && (
        <MonthView
          current={current}
          onNavigate={setCurrent}
          tasks={tasks}
          onDayClick={handleDayClick}
          onAddClick={(date) => openAdd(date)}
        />
      )}

      {view === "week" && (
        <WeekView
          current={current}
          onNavigate={setCurrent}
          tasks={tasks}
          onAddClick={(date) => openAdd(date)}
          onTaskEdit={openEdit}
          onTaskDelete={deleteTask}
        />
      )}

      {view === "day" && (
        <DailyScheduleCalendar
          weeklyEvents={weeklyEvents}
          selectedDayOfWeek={selectedDow}
          onDayChange={(d) => {
            onDowChange(d);
            // Sync `current` to the matching date
            const today = new Date();
            const todayDow = jsToWeekDay(today);
            const diff = (d - todayDow + 7) % 7;
            const next = new Date(today);
            next.setDate(today.getDate() + diff);
            setCurrent(next);
          }}
        />
      )}

      {/* Zustand tasks for day view (shown as a compact list) */}
      {view === "day" && (() => {
        const iso = isoStr(current);
        const dayTasks = tasks.filter((t) => t.date === iso);
        if (!dayTasks.length) return null;
        return (
          <div className="rounded-xl border border-white/8 bg-white/3 p-4">
            <p className="mb-3 text-xs font-semibold text-white/40 uppercase tracking-wider">
              Task del {format(current, "d MMMM", { locale: it })}
            </p>
            <div className="space-y-2">
              {dayTasks.map((t) => (
                <div key={t.id} className="flex items-center gap-3">
                  <div className={cn("flex-1 rounded-lg border px-3 py-2.5 min-h-[44px] flex items-center", CATEGORY_COLOR[t.category])}>
                    <span className="text-xs font-medium flex-1">{t.title}</span>
                    <span className="text-[9px] text-white/25 ml-2">{t.duration_mins}m</span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="rounded-lg border border-white/10 p-2.5 text-white/30 hover:bg-white/8 hover:text-white/70 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
                        <span className="text-base leading-none">⋯</span>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(t)}>✏️ Modifica</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => deleteTask(t.id)} className="text-red-400 focus:text-red-400">🗑 Elimina</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      <CrudSheet
        open={sheet.open}
        context={sheet.ctx}
        onClose={() => setSheet({ open: false, ctx: null })}
      />
    </div>
  );
}
