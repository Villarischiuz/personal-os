"use client";

import { useState } from "react";
import { MOCK_TASKS } from "@/lib/mock-data";
import type { Task, EnergyBlock, WeeklyEvent } from "@/lib/types";
import { QuickCapture } from "@/components/calendar/QuickCapture";
import { InboxPanel } from "@/components/calendar/InboxPanel";
import { EnergyCalendar } from "@/components/calendar/EnergyCalendar";
import { WeeklyPlanner } from "@/components/calendar/WeeklyPlanner";
import { DailyScheduleCalendar } from "@/components/calendar/DailyScheduleCalendar";
import { useWeeklySchedule } from "@/lib/useWeeklySchedule";
import { AIBootBanner } from "@/components/global/AIBootBanner";
import { CalendarViews } from "@/components/calendar/CalendarViews";
import { Zap, Inbox, Clock } from "@/lib/icons";

let _nextId = 100;
function genId() { return `t-cap-${++_nextId}`; }

// 0=Lun … 6=Dom (compatibile con WeeklyEvent)
function todayDow(): 0|1|2|3|4|5|6 {
  return ((new Date().getDay() + 6) % 7) as 0|1|2|3|4|5|6;
}

export default function CalendarPage() {
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [selectedDow, setSelectedDow] = useState<0|1|2|3|4|5|6>(todayDow());
  const { events: weeklyEvents, replaceAll } = useWeeklySchedule();

  const inboxTasks = tasks.filter((t) => t.status === "Inbox" && !t.energy_block);
  const calendarTasks = tasks.filter((t) => !!t.energy_block);

  function addToInbox(title: string) {
    const now = new Date().toISOString().split("T")[0];
    const newTask: Task = {
      id: genId(), title, category: "Admin",
      energy_required: 2, status: "Inbox",
      duration_mins: 30, created_at: now,
    };
    setTasks((prev) => [newTask, ...prev]);
  }

  function assignToBlock(taskId: string, block: EnergyBlock) {
    setTasks((prev) =>
      prev.map((t) => t.id === taskId ? { ...t, energy_block: block, status: "Todo" as const } : t)
    );
  }

  function removeFromBlock(taskId: string) {
    setTasks((prev) =>
      prev.map((t) => t.id === taskId ? { ...t, energy_block: undefined, status: "Inbox" as const } : t)
    );
  }

  function handleReplaceAll(events: Omit<WeeklyEvent, "id">[]) {
    replaceAll(events);
  }

  return (
    <div className="space-y-8">
      {/* AI Boot Banner */}
      <AIBootBanner />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Calendario Energia</h1>
        <p className="mt-1 text-sm text-white/40">
          Cattura i task e assegnali alle finestre del tuo ritmo circadiano.
        </p>
      </div>

      {/* Quick Capture */}
      <QuickCapture onCapture={addToInbox} />

      {/* Weekly Planner (collapsibile) */}
      <WeeklyPlanner onApply={handleReplaceAll} />

      {/* Task Inbox + Energy Calendar */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Inbox size={14} className="text-white/40" />
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
              In Arrivo
            </h2>
            {inboxTasks.length > 0 && (
              <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[10px] font-medium text-white/50">
                {inboxTasks.length}
              </span>
            )}
          </div>
          <InboxPanel tasks={inboxTasks} onAssign={assignToBlock} />
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-white/40" />
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
              Programma Circadiano
            </h2>
          </div>
          <EnergyCalendar tasks={calendarTasks} onRemove={removeFromBlock} />
        </div>
      </div>

      {/* Multi-view Calendar Engine */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-white/40" />
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
            Calendario
          </h2>
        </div>
        <CalendarViews
          weeklyEvents={weeklyEvents}
          selectedDow={selectedDow}
          onDowChange={setSelectedDow}
        />
      </div>
    </div>
  );
}
